import { useState, useEffect } from 'react';
import { ShieldCheck, Store, MapPin, CheckCircle, XCircle, Ban, AlertCircle, Loader2, Trash2, User } from 'lucide-react';
import { fetchAdminPharmacies, setPharmacyVerification, setPharmacyBlocked, deletePharmacy } from '@/lib/api';
import Modal from '@/components/Modal';

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminPharmacies();
      setPharmacies(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleVerify = async (id: string, verify: boolean) => {
    setProcessing(id);
    try {
      await setPharmacyVerification(id, verify);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleBlock = async (id: string, block: boolean) => {
    setProcessing(id);
    try {
      await setPharmacyBlocked(id, block);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessing(deleteTarget.id);
    try {
      await deletePharmacy(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(null);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-600" /> Pharmacy Management
        </h1>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {pharmacies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No pharmacies registered yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pharmacies.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                      {p.is_verified ? (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200">Verified</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">Pending</span>
                      )}
                      {p.is_blocked && (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-200">Blocked</span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {p.area} — {p.address}</p>
                      <p className="flex items-center gap-1.5"><User className="w-4 h-4 text-gray-400" /> Owner: {p.owner?.full_name || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!p.is_verified ? (
                      <button
                        onClick={() => handleVerify(p.id, true)}
                        disabled={processing === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
                      >
                        {processing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Verify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(p.id, false)}
                        disabled={processing === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {processing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Unverify
                      </button>
                    )}

                    {!p.is_blocked ? (
                      <button
                        onClick={() => handleBlock(p.id, true)}
                        disabled={processing === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Ban className="w-4 h-4" /> Block
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlock(p.id, false)}
                        disabled={processing === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
                      >
                        {processing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Unblock
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteTarget(p)}
                      disabled={processing === p.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Pharmacy"
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong className="text-gray-900">{deleteTarget?.name}</strong>? This will also delete all its stock and reservations. This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={processing === deleteTarget?.id}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {processing === deleteTarget?.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
