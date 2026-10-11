import { useState, useEffect } from 'react';
import { LayoutDashboard, Store, Package, ClipboardList, Search, TrendingDown, AlertCircle, Loader2, TrendingUp, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { fetchAdminReports } from '@/lib/api';

interface ReportData {
  totalPharmacies: number;
  verifiedPharmacies: number;
  blockedPharmacies: number;
  totalStocks: number;
  lowStocks: number;
  outOfStocks: number;
  expiredStocks: number;
  totalReservations: number;
  pendingReservations: number;
  acceptedReservations: number;
  rejectedReservations: number;
  cancelledReservations: number;
  mostSearched: { query: string; count: number; noResults: number }[];
  notInStock: { query: string; count: number; noResults: number }[];
  totalMedicines: number;
}

export default function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminReports()
      .then((d) => setData(d as ReportData))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: 'Total Pharmacies', value: data.totalPharmacies, icon: Store, color: 'bg-teal-50 text-teal-600' },
    { label: 'Verified', value: data.verifiedPharmacies, icon: CheckCircle, color: 'bg-teal-50 text-teal-700' },
    { label: 'Blocked', value: data.blockedPharmacies, icon: Ban, color: 'bg-red-50 text-red-600' },
    { label: 'Total Stock Items', value: data.totalStocks, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Low Stock', value: data.lowStocks, icon: TrendingDown, color: 'bg-amber-50 text-amber-600' },
    { label: 'Out of Stock', value: data.outOfStocks, icon: Package, color: 'bg-red-50 text-red-600' },
    { label: 'Expired Stock', value: data.expiredStocks, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
    { label: 'Total Medicines', value: data.totalMedicines, icon: Package, color: 'bg-gray-50 text-gray-600' },
  ];

  const reservationStats = [
    { label: 'Total Reservations', value: data.totalReservations, icon: ClipboardList, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending', value: data.pendingReservations, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Accepted', value: data.acceptedReservations, icon: CheckCircle, color: 'bg-teal-50 text-teal-600' },
    { label: 'Rejected', value: data.rejectedReservations, icon: XCircle, color: 'bg-red-50 text-red-600' },
    { label: 'Cancelled', value: data.cancelledReservations, icon: Ban, color: 'bg-gray-50 text-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-teal-600" /> Reports & Analytics
        </h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Reservation Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" /> Reservation Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {reservationStats.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Most Searched */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" /> Most Searched Medicines
            </h2>
            {data.mostSearched.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No search data yet.</p>
            ) : (
              <div className="space-y-2">
                {data.mostSearched.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{s.query}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600">{s.count} searches</span>
                      {s.noResults > 0 && (
                        <span className="text-amber-600 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {s.noResults} no results
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-600" /> High Demand / Not In Stock
            </h2>
            {data.notInStock.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No demand gaps detected.</p>
            ) : (
              <div className="space-y-2">
                {data.notInStock.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{s.query}</span>
                    </div>
                    <span className="text-sm text-amber-600 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> {s.noResults}x not found
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
