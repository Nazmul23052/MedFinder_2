import { useState, useEffect } from 'react';
import { Store, MapPin, Phone, AlertCircle, Loader2, CheckCircle, XCircle, Save, Building2, Clock } from 'lucide-react';
import { fetchMyPharmacy, createPharmacy, updatePharmacy } from '@/lib/api';
import type { Pharmacy } from '@/lib/supabase';

export default function PharmacyProfile() {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchMyPharmacy().then((data) => {
      if (data) {
        setPharmacy(data as Pharmacy);
        setName(data.name);
        setArea(data.area);
        setAddress(data.address);
        setPhone(data.phone || '');
      }
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (pharmacy) {
        await updatePharmacy(pharmacy.id, { name, area, address, phone });
      } else {
        const data = await createPharmacy({ name, area, address, phone });
        setPharmacy(data as Pharmacy);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Store className="w-6 h-6 text-teal-600" /> Pharmacy Profile
        </h1>

        {pharmacy && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${pharmacy.is_verified ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-2">
                {pharmacy.is_verified ? (
                  <><CheckCircle className="w-5 h-5 text-teal-600" /> <span className="text-sm font-medium text-teal-700">Verified</span></>
                ) : (
                  <><Clock className="w-5 h-5 text-amber-600" /> <span className="text-sm font-medium text-amber-700">Pending verification</span></>
                )}
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${pharmacy.is_blocked ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                {pharmacy.is_blocked ? (
                  <><XCircle className="w-5 h-5 text-red-600" /> <span className="text-sm font-medium text-red-700">Blocked</span></>
                ) : (
                  <><CheckCircle className="w-5 h-5 text-gray-400" /> <span className="text-sm font-medium text-gray-600">Active</span></>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-teal-700">Pharmacy profile saved successfully!</p>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pharmacy Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                placeholder="e.g. City Pharmacy"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Area</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                placeholder="e.g. Dhanmondi"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address</label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all resize-none"
              placeholder="House #, Road #, Thana, City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                placeholder="+880 1XXX XXXXXX"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> {pharmacy ? 'Update Profile' : 'Create Profile'}</>
            )}
          </button>
        </form>

        {!pharmacy && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Create your pharmacy profile to start listing medicine stock.
          </p>
        )}
      </div>
    </div>
  );
}


