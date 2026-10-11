import { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, MapPin, Tag, Package, AlertCircle, Loader2, Store, Phone } from 'lucide-react';
import { searchMedicines, fetchAreas } from '@/lib/api';
import type { SearchResult } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/Modal';
import { createReservation } from '@/lib/api';

export default function SearchPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reserveItem, setReserveItem] = useState<SearchResult | null>(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  useEffect(() => {
    fetchAreas().then(setAreas).catch(console.error);
  }, []);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchMedicines(query, area || null);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, area]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      doSearch();
    }, 300);
    return () => clearTimeout(timeout);
  }, [doSearch]);

  const handleReserve = async () => {
    if (!profile) {
      navigate('/login');
      return;
    }
    if (!reserveItem) return;
    setReserving(true);
    setReserveError(null);
    try {
      await createReservation(reserveItem.stock_id, reserveItem.pharmacy_id, reserveQty);
      setReserveSuccess(true);
      setTimeout(() => {
        setReserveItem(null);
        setReserveSuccess(false);
        setReserveQty(1);
      }, 2000);
    } catch (err: any) {
      setReserveError(err.message || 'Failed to create reservation');
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Your Medicine</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by brand or generic name..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              />
            </div>
            <div className="relative sm:w-56">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all appearance-none bg-white"
              >
                <option value="">All areas</option>
                {areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No medicines found matching your search.</p>
            <p className="text-gray-400 text-sm mt-1">Try a different name or area.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''} found — sorted by lowest price
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((r) => (
                <div
                  key={r.stock_id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{r.brand_name}</h3>
                      <p className="text-sm text-gray-500">{r.generic_name}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-sm font-semibold">
                      {r.price.toFixed(2)} Taka
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600 mb-4 flex-1">
                    <p className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-gray-400" /> {r.pharmacy_name}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" /> {r.pharmacy_area}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-gray-400" /> {r.form} • {r.strength}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className={r.quantity <= 5 ? 'text-amber-600 font-medium' : ''}>
                        {r.quantity} in stock
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!profile) {
                        navigate('/login');
                        return;
                      }
                      setReserveItem(r);
                      setReserveQty(1);
                      setReserveError(null);
                    }}
                    className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm"
                  >
                    Reserve
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Reserve Modal */}
      <Modal
        open={!!reserveItem}
        onClose={() => { setReserveItem(null); setReserveError(null); }}
        title="Reserve Medicine"
      >
        {reserveSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Reservation Created!</h3>
            <p className="text-gray-500 text-sm mt-1">The pharmacy will review your request.</p>
          </div>
        ) : reserveItem ? (
          <div className="space-y-4">
            {reserveError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{reserveError}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900">{reserveItem.brand_name}</h4>
              <p className="text-sm text-gray-500">{reserveItem.generic_name} • {reserveItem.form} {reserveItem.strength}</p>
              <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-1.5"><Store className="w-4 h-4" /> {reserveItem.pharmacy_name}</p>
                <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {reserveItem.pharmacy_area}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {reserveItem.pharmacy_phone || 'N/A'}</p>
                <p className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> {reserveItem.price.toFixed(2)} Taka/unit</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReserveQty(Math.max(1, reserveQty - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={reserveItem.quantity}
                  value={reserveQty}
                  onChange={(e) => setReserveQty(Math.min(reserveItem.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center py-2 rounded-lg border border-gray-300 outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setReserveQty(Math.min(reserveItem.quantity, reserveQty + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">of {reserveItem.quantity} available</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-3">
                Total: {(reserveItem.price * reserveQty).toFixed(2)} Taka
              </p>
            </div>

            <button
              onClick={handleReserve}
              disabled={reserving}
              className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {reserving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Reserving...</>
              ) : (
                'Confirm Reservation'
              )}
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
