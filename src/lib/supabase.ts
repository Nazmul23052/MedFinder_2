import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export type Role = 'patient' | 'pharmacist' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  phone: string;
  created_at: string;
}

export interface Pharmacy {
  id: string;
  owner_id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
}

export interface Medicine {
  id: string;
  brand_name: string;
  generic_name: string;
  category: string;
  form: string;
  strength: string;
  created_at: string;
}

export interface Stock {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  price: number;
  quantity: number;
  expiry_date: string;
  created_at: string;
  medicine?: Medicine;
  pharmacy?: Pharmacy;
}

export interface Reservation {
  id: string;
  patient_id: string;
  stock_id: string;
  pharmacy_id: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  stock?: Stock;
  pharmacy?: Pharmacy;
}

export interface SearchResult {
  stock_id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_area: string;
  pharmacy_address: string;
  pharmacy_phone: string;
  medicine_id: string;
  brand_name: string;
  generic_name: string;
  category: string;
  form: string;
  strength: string;
  price: number;
  quantity: number;
  expiry_date: string;
}
