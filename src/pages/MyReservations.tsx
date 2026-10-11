import { useState, useEffect } from 'react';
import { ClipboardList, Store, MapPin, Tag, Package, Clock, X, Loader2, AlertCircle } from 'lucide-react';
import { fetchMyReservations, cancelReservation } from '@/lib/api';
import type { Reservation } from '@/lib/supabase';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-teal-50 text-teal-700 border-teal-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMyReservations();
      setReservations(data as any || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await cancelReservation(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-teal-600" /> My Reservations
        </h1>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No reservations yet.</p>
            <p className="text-gray-400 text-sm mt-1">Search for medicine and reserve it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {r.stock?.medicine?.brand_name || 'Unknown medicine'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {r.stock?.medicine?.generic_name} • {r.stock?.medicine?.form} {r.stock?.medicine?.strength}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[r.status]}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                  <p className="flex items-center gap-1.5"><Store className="w-4 h-4 text-gray-400" /> {r.pharmacy?.name}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {r.pharmacy?.area}</p>
                  <p className="flex items-center gap-1.5"><Package className="w-4 h-4 text-gray-400" /> Qty: {r.quantity}</p>
                  <p className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-gray-400" /> {(r.stock?.price * r.quantity).toFixed(2)} Taka</p>
                  <p className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {new Date(r.created_at).toLocaleDateString()}</p>
                </div>

                {r.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    disabled={cancelling === r.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {cancelling === r.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                    ) : (
                      <><X className="w-4 h-4" /> Cancel Reservation</>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
