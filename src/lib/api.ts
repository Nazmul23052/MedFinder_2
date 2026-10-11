import { supabase, type SearchResult } from '@/lib/supabase';

export async function searchMedicines(query: string, area: string | null): Promise<SearchResult[]> {
  let stockQuery = supabase
    .from('stocks')
    .select(`
      id,
      price,
      quantity,
      expiry_date,
      medicine:medicines(id, brand_name, generic_name, category, form, strength),
      pharmacy:pharmacies(id, name, area, address, phone, is_verified, is_blocked)
    `)
    .gt('quantity', 0)
    .gte('expiry_date', new Date().toISOString().split('T')[0]);

  const { data, error } = await stockQuery;

  if (error) throw error;
  if (!data) return [];

  const results: SearchResult[] = data
    .filter((row: any) => {
      const ph = row.pharmacy;
      if (!ph || !ph.is_verified || ph.is_blocked) return false;
      if (area && ph.area.toLowerCase() !== area.toLowerCase()) return false;
      if (query) {
        const q = query.toLowerCase();
        const med = row.medicine;
        if (!med) return false;
        return (
          med.brand_name?.toLowerCase().includes(q) ||
          med.generic_name?.toLowerCase().includes(q) ||
          med.category?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .map((row: any) => ({
      stock_id: row.id,
      pharmacy_id: row.pharmacy?.id,
      pharmacy_name: row.pharmacy?.name,
      pharmacy_area: row.pharmacy?.area,
      pharmacy_address: row.pharmacy?.address,
      pharmacy_phone: row.pharmacy?.phone,
      medicine_id: row.medicine?.id,
      brand_name: row.medicine?.brand_name,
      generic_name: row.medicine?.generic_name,
      category: row.medicine?.category,
      form: row.medicine?.form,
      strength: row.medicine?.strength,
      price: parseFloat(row.price),
      quantity: row.quantity,
      expiry_date: row.expiry_date,
    }))
    .sort((a, b) => a.price - b.price);

  // Log the search
  supabase.from('search_logs').insert({
    query,
    area: area || null,
    results_count: results.length,
  }).then(({ error: logError }) => {
    if (logError) console.error('Failed to log search:', logError);
  });

  return results;
}

export async function fetchAreas(): Promise<string[]> {
  const { data, error } = await supabase
    .from('pharmacies')
    .select('area')
    .eq('is_verified', true)
    .eq('is_blocked', false)
    .not('area', 'eq', '');

  if (error) throw error;
  if (!data) return [];

  const areas = [...new Set(data.map((r: any) => r.area).filter(Boolean))] as string[];
  return areas.sort();
}

export async function fetchAllMedicines() {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('brand_name');

  if (error) throw error;
  return data;
}

export async function createReservation(stockId: string, pharmacyId: string, quantity: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      patient_id: user.id,
      stock_id: stockId,
      pharmacy_id: pharmacyId,
      quantity,
      status: 'pending',
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchMyReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      stock:stocks(
        id, price, quantity, expiry_date,
        medicine:medicines(brand_name, generic_name, form, strength)
      ),
      pharmacy:pharmacies(name, area, address, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function cancelReservation(reservationId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', reservationId)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchIncomingReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      stock:stocks(
        id, price, quantity, expiry_date,
        medicine:medicines(brand_name, generic_name, form, strength)
      ),
      pharmacy:pharmacies(name, area, address, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function acceptReservation(reservationId: string) {
  const { data, error } = await supabase.rpc('accept_reservation', {
    p_reservation_id: reservationId,
  });
  if (error) throw error;
  return data;
}

export async function rejectReservation(reservationId: string) {
  const { data, error } = await supabase.rpc('reject_reservation', {
    p_reservation_id: reservationId,
  });
  if (error) throw error;
  return data;
}

export async function fetchMyPharmacy() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPharmacy(pharmacyData: {
  name: string;
  area: string;
  address: string;
  phone: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('pharmacies')
    .insert({
      owner_id: user.id,
      ...pharmacyData,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updatePharmacy(pharmacyId: string, updates: any) {
  const { data, error } = await supabase
    .from('pharmacies')
    .update(updates)
    .eq('id', pharmacyId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchMyStocks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: pharmacy } = await supabase
    .from('pharmacies')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!pharmacy) return [];

  const { data, error } = await supabase
    .from('stocks')
    .select(`
      *,
      medicine:medicines(*)
    `)
    .eq('pharmacy_id', pharmacy.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createStock(stockData: {
  pharmacy_id: string;
  medicine_id: string;
  price: number;
  quantity: number;
  expiry_date: string;
}) {
  const { data, error } = await supabase
    .from('stocks')
    .insert(stockData)
    .select(`
      *,
      medicine:medicines(*)
    `)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateStock(stockId: string, updates: {
  price?: number;
  quantity?: number;
  expiry_date?: string;
}) {
  const { data, error } = await supabase
    .from('stocks')
    .update(updates)
    .eq('id', stockId)
    .select(`
      *,
      medicine:medicines(*)
    `)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteStock(stockId: string) {
  const { error } = await supabase
    .from('stocks')
    .delete()
    .eq('id', stockId);
  if (error) throw error;
}

export async function fetchAdminPharmacies() {
  const { data, error } = await supabase
    .from('pharmacies')
    .select(`
      *,
      owner:profiles(full_name, email, phone, role)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchAdminUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function setPharmacyVerification(pharmacyId: string, verified: boolean) {
  const { data, error } = await supabase
    .from('pharmacies')
    .update({ is_verified: verified })
    .eq('id', pharmacyId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function setPharmacyBlocked(pharmacyId: string, blocked: boolean) {
  const { data, error } = await supabase
    .from('pharmacies')
    .update({ is_blocked: blocked })
    .eq('id', pharmacyId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteUser(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
}

export async function deletePharmacy(pharmacyId: string) {
  const { error } = await supabase
    .from('pharmacies')
    .delete()
    .eq('id', pharmacyId);
  if (error) throw error;
}

export async function fetchAdminReports() {
  const [pharmaciesRes, stocksRes, reservationsRes, searchLogsRes, medicinesRes] = await Promise.all([
    supabase.from('pharmacies').select('id, is_verified, is_blocked'),
    supabase.from('stocks').select('id, quantity, expiry_date'),
    supabase.from('reservations').select('id, status'),
    supabase.from('search_logs').select('query, results_count, created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('medicines').select('id, brand_name, generic_name'),
  ]);

  const totalPharmacies = pharmaciesRes.data?.length || 0;
  const verifiedPharmacies = pharmaciesRes.data?.filter((p: any) => p.is_verified).length || 0;
  const blockedPharmacies = pharmaciesRes.data?.filter((p: any) => p.is_blocked).length || 0;
  const totalStocks = stocksRes.data?.length || 0;
  const lowStocks = stocksRes.data?.filter((s: any) => s.quantity > 0 && s.quantity <= 10).length || 0;
  const outOfStocks = stocksRes.data?.filter((s: any) => s.quantity === 0).length || 0;
  const expiredStocks = stocksRes.data?.filter((s: any) => {
    return new Date(s.expiry_date) < new Date();
  }).length || 0;

  const totalReservations = reservationsRes.data?.length || 0;
  const pendingReservations = reservationsRes.data?.filter((r: any) => r.status === 'pending').length || 0;
  const acceptedReservations = reservationsRes.data?.filter((r: any) => r.status === 'accepted').length || 0;
  const rejectedReservations = reservationsRes.data?.filter((r: any) => r.status === 'rejected').length || 0;
  const cancelledReservations = reservationsRes.data?.filter((r: any) => r.status === 'cancelled').length || 0;

  // Most searched queries
  const searchCounts: Record<string, { count: number; noResults: number }> = {};
  searchLogsRes.data?.forEach((log: any) => {
    if (!log.query) return;
    if (!searchCounts[log.query]) searchCounts[log.query] = { count: 0, noResults: 0 };
    searchCounts[log.query].count++;
    if (log.results_count === 0) searchCounts[log.query].noResults++;
  });

  const mostSearched = Object.entries(searchCounts)
    .map(([query, stats]) => ({ query, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Medicines not in stock (in search logs with 0 results but matching a medicine)
  const notInStock = mostSearched.filter((s) => s.noResults > 0).slice(0, 5);

  return {
    totalPharmacies,
    verifiedPharmacies,
    blockedPharmacies,
    totalStocks,
    lowStocks,
    outOfStocks,
    expiredStocks,
    totalReservations,
    pendingReservations,
    acceptedReservations,
    rejectedReservations,
    cancelledReservations,
    mostSearched,
    notInStock,
    totalMedicines: medicinesRes.data?.length || 0,
  };
}
