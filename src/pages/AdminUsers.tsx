import { useState, useEffect } from 'react';
import { Users, AlertCircle, Loader2, Trash2, User, Shield, Store, Heart } from 'lucide-react';
import { fetchAdminUsers, deleteUser } from '@/lib/api';
import Modal from '@/components/Modal';

const roleConfig: Record<string, { icon: typeof Heart; color: string; label: string }> = {
  patient: { icon: Heart, color: 'bg-rose-50 text-rose-600', label: 'Patient' },
  pharmacist: { icon: Store, color: 'bg-teal-50 text-teal-600', label: 'Pharmacist' },
  admin: { icon: Shield, color: 'bg-blue-50 text-blue-600', label: 'Admin' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
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
          <Users className="w-6 h-6 text-teal-600" /> User Management
        </h1>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Phone</th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Joined</th>
                    <th className="text-right px-5 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const rc = roleConfig[u.role] || roleConfig.patient;
                    const RoleIcon = rc.icon;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="font-medium text-gray-900">{u.full_name || 'Unnamed'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${rc.color}`}>
                            <RoleIcon className="w-3.5 h-3.5" /> {rc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{u.phone || '—'}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong className="text-gray-900">{deleteTarget?.full_name}</strong>? If this user owns a pharmacy, it will also be removed. This action cannot be undone.
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
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
