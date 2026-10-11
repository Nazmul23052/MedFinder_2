import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, AlertCircle, Loader2, X, Search, TrendingDown, Calendar } from 'lucide-react';
import { fetchMyStocks, fetchMyPharmacy, createStock, updateStock, deleteStock, fetchAllMedicines } from '@/lib/api';
import type { Stock, Medicine, Pharmacy } from '@/lib/supabase';
import Modal from '@/components/Modal';

export default function StockManagement() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [medSearch, setMedSearch] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [pharmData, stockData, medData] = await Promise.all([
        fetchMyPharmacy(),
        fetchMyStocks(),
        fetchAllMedicines(),
      ]);
      setPharmacy(pharmData as Pharmacy | null);
      setStocks((stockData as any) || []);
      setMedicines(medData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingStock(null);
    setSelectedMedId('');
    setMedSearch('');
    setPrice('');
    setQuantity('');
    setExpiryDate('');
    setShowModal(true);
  };

  const openEdit = (stock: Stock) => {
    setEditingStock(stock);
    setSelectedMedId(stock.medicine_id);
    setMedSearch(stock.medicine?.brand_name || '');
    setPrice(stock.price.toString());
    setQuantity(stock.quantity.toString());
    setExpiryDate(stock.expiry_date);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy) return;
    setSaving(true);
    setError(null);
    try {
      const stockData = {
        pharmacy_id: pharmacy.id,
        medicine_id: selectedMedId,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        expiry_date: expiryDate,
      };
      if (editingStock) {
        await updateStock(editingStock.id, { price: parseFloat(price), quantity: parseInt(quantity), expiry_date: expiryDate });
      } else {
        await createStock(stockData);
      }
      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteStock(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filteredMeds = medicines.filter((m) =>
    m.brand_name.toLowerCase().includes(medSearch.toLowerCase()) ||
    m.generic_name.toLowerCase().includes(medSearch.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-lg">You need to create a pharmacy profile first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-teal-600" /> Stock Management
          </h1>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {stocks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No stock entries yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Stock" to list your first medicine.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Medicine</th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Price</th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Qty</th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Expiry</th>
                    <th className="text-right px-5 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stocks.map((stock: any) => {
                    const isLow = stock.quantity > 0 && stock.quantity <= 10;
                    const isOut = stock.quantity === 0;
                    const isExpired = new Date(stock.expiry_date) < new Date();
                    return (
                      <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{stock.medicine?.brand_name}</p>
                          <p className="text-xs text-gray-500">{stock.medicine?.generic_name} • {stock.medicine?.form} {stock.medicine?.strength}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">{parseFloat(stock.price).toFixed(2)} Taka</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                            isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-700'
                          }`}>
                            {(isLow || isOut) && <TrendingDown className="w-3.5 h-3.5" />}
                            {stock.quantity}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-sm ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(stock.expiry_date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(stock)}
                              className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(stock.id)}
                              disabled={deleting === stock.id}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deleting === stock.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
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
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingStock ? 'Edit Stock' : 'Add Stock'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {!editingStock && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Medicine</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  placeholder="Search medicine..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  required
                />
              </div>
              {medSearch && !selectedMedId && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredMeds.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMedId(m.id);
                        setMedSearch(`${m.brand_name} (${m.generic_name})`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-900">{m.brand_name}</p>
                      <p className="text-xs text-gray-500">{m.generic_name} • {m.form} {m.strength}</p>
                    </button>
                  ))}
                  {filteredMeds.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">No medicine found</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (Taka)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
            <input
              type="date"
              required
              min={today}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={saving || (!editingStock && !selectedMedId)}
            className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              editingStock ? 'Update Stock' : 'Add Stock'
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
