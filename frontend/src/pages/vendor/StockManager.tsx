import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, Tag, X, Check, Package,
  AlertCircle, CheckCircle2, Loader2, ImageIcon, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function StockManager() {
  const [stock, setStock] = useState<any[]>([]);
  const [produceList, setProduceList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ quantity: '', price: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [addingStock, setAddingStock] = useState(false);

  // Add stock form
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    pricePerKg: '',
    expiryDate: '',
    produceId: '',
  });
  const [suggestedRange, setSuggestedRange] = useState({ min: 0, max: 0 });
  const [produceSearch, setProduceSearch] = useState('');
  const [showProduceDropdown, setShowProduceDropdown] = useState(false);

  useEffect(() => {
    fetchStock();
    fetchProduceList();
  }, []);

  const fetchStock = async () => {
    try {
      const data = await api.getMyStock();
      setStock(data.stock || data || []);
    } catch (err) {
      console.error('Failed to fetch stock:', err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchProduceList = async () => {
    try {
      const data = await api.getProduceList();
      setProduceList(data.produce || data || []);
    } catch (err) {
      console.error('Failed to fetch produce list:', err);
    }
  };

  const filteredStock = stock.filter(item =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProduce = produceList.filter(p =>
    (p.name || '').toLowerCase().includes(produceSearch.toLowerCase())
  );

  const handleSelectProduce = (produce: any) => {
    setNewItem({
      ...newItem,
      name: produce.name,
      produceId: produce._id || produce.id || '',
    });
    setSuggestedRange({
      min: produce.minPrice || produce.priceMin || 0,
      max: produce.maxPrice || produce.priceMax || 0,
    });
    setProduceSearch(produce.name);
    setShowProduceDropdown(false);
  };

  const handleAddStock = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.pricePerKg) {
      toast.error('Please fill in item name, quantity, and price');
      return;
    }
    setAddingStock(true);
    try {
      await api.addStock({
        name: newItem.name,
        quantity: Number(newItem.quantity),
        pricePerKg: Number(newItem.pricePerKg),
        expiryDate: newItem.expiryDate || undefined,
        produceId: newItem.produceId || undefined,
      });
      toast.success(`${newItem.name} added to inventory`);
      setShowAddModal(false);
      setNewItem({ name: '', quantity: '', pricePerKg: '', expiryDate: '', produceId: '' });
      setProduceSearch('');
      setSuggestedRange({ min: 0, max: 0 });
      fetchStock();
    } catch (err) {
      console.error('Failed to add stock:', err);
      toast.error('Failed to add stock item');
    } finally {
      setAddingStock(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const body: any = {};
      if (editData.quantity) body.quantity = Number(editData.quantity);
      if (editData.price) body.pricePerKg = Number(editData.price);
      await api.updateStock(id, body);
      toast.success('Stock updated successfully');
      setEditingId(null);
      setEditData({ quantity: '', price: '' });
      fetchStock();
    } catch (err) {
      console.error('Failed to update stock:', err);
      toast.error('Failed to update stock');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteStock(id);
      setStock(stock.filter(item => (item._id || item.id) !== id));
      toast.success('Item removed from inventory');
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete stock:', err);
      toast.error('Failed to delete item');
    }
  };

  const handleMarkSurplus = async (id: string) => {
    try {
      await api.markSurplus(id, 20);
      toast.success('Item marked as surplus with 20% discount');
      fetchStock();
    } catch (err) {
      console.error('Failed to mark surplus:', err);
      toast.error('Failed to mark as surplus');
    }
  };

  const getStatus = (item: any) => {
    const qty = item.quantity || 0;
    if (qty <= 0) return { label: 'Out of Stock', style: 'bg-red-100 text-red-700', icon: AlertCircle };
    if (qty < 10) return { label: 'Low Stock', style: 'bg-amber-100 text-amber-700', icon: AlertCircle };
    return { label: 'In Stock', style: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your inventory like a pro seller</p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Item
        </Button>
      </motion.div>

      {/* Search Bar */}
      <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.4 }}>
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by item name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm text-sm"
          />
        </div>
      </motion.div>

      {/* Stock Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.4 }}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="ml-3 text-slate-500">Loading inventory...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Item</th>
                      <th className="px-4 py-4 font-medium">Category</th>
                      <th className="px-4 py-4 font-medium">Qty</th>
                      <th className="px-4 py-4 font-medium">Price/Unit</th>
                      <th className="px-4 py-4 font-medium">Market Range</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="px-4 py-4 font-medium">Expiry</th>
                      <th className="px-4 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((item, i) => {
                      const itemId = item._id || item.id;
                      const status = getStatus(item);
                      const isEditing = editingId === itemId;

                      return (
                        <motion.tr
                          key={itemId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                        >
                          {/* Item with thumbnail */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <span className="font-medium text-slate-900">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-500">{item.category || '-'}</td>

                          {/* Quantity - editable */}
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editData.quantity}
                                onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                                className="w-20 px-2 py-1.5 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            ) : (
                              <span className="font-medium text-slate-900">{item.quantity} {item.unit || 'kg'}</span>
                            )}
                          </td>

                          {/* Price - editable */}
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editData.price}
                                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                className="w-20 px-2 py-1.5 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            ) : (
                              <span className="text-slate-700">₹{item.pricePerKg}/{item.unit || 'kg'}</span>
                            )}
                          </td>

                          {/* Market Range */}
                          <td className="px-4 py-4">
                            <span className="text-xs text-slate-400">
                              {item.minPrice || item.marketMin
                                ? `₹${item.minPrice || item.marketMin}-₹${item.maxPrice || item.marketMax}`
                                : '-'}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.style}`}>
                              <status.icon className="w-3 h-3 mr-1" />
                              {status.label}
                            </span>
                          </td>

                          {/* Expiry */}
                          <td className="px-4 py-4 text-slate-500 text-xs">
                            {item.expiryDate
                              ? new Date(item.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '-'}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => handleUpdate(itemId)}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                    onClick={() => { setEditingId(null); setEditData({ quantity: '', price: '' }); }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                    title="Edit"
                                    onClick={() => {
                                      setEditingId(itemId);
                                      setEditData({
                                        quantity: String(item.quantity || ''),
                                        price: String(item.pricePerKg || ''),
                                      });
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    title="Delete"
                                    onClick={() => setShowDeleteConfirm(itemId)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                    title="Mark as Surplus"
                                    onClick={() => handleMarkSurplus(itemId)}
                                  >
                                    <Tag className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {filteredStock.length === 0 && !loading && (
                      <tr>
                        <td colSpan={8} className="px-6 py-16 text-center">
                          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-slate-500 font-medium">No stock items found</p>
                          <p className="text-slate-400 text-xs mt-1">Add your first item to get started</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Delete Item</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to remove this item from your inventory?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New Stock</h2>
                  <p className="text-sm text-slate-500 mt-1">Add items to your inventory</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-5">
                {/* Produce autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Produce
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search produce catalog..."
                      value={produceSearch}
                      onChange={(e) => {
                        setProduceSearch(e.target.value);
                        setShowProduceDropdown(true);
                        setNewItem({ ...newItem, name: e.target.value });
                      }}
                      onFocus={() => setShowProduceDropdown(true)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  {showProduceDropdown && filteredProduce.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredProduce.slice(0, 10).map((p: any) => (
                        <button
                          key={p._id || p.id || p.name}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 transition-colors flex justify-between items-center"
                          onClick={() => handleSelectProduce(p)}
                        >
                          <span className="font-medium text-slate-900">{p.name}</span>
                          {(p.minPrice || p.priceMin) && (
                            <span className="text-xs text-slate-400">
                              ₹{p.minPrice || p.priceMin}-₹{p.maxPrice || p.priceMax}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested price range */}
                {suggestedRange.max > 0 && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <p className="text-xs text-emerald-700 font-medium">
                      Suggested market price: ₹{suggestedRange.min} - ₹{suggestedRange.max} per kg
                    </p>
                  </div>
                )}

                {/* Item name (if manually typed) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Fresh Tomatoes"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Quantity (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g., 50"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price per unit (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g., 30"
                      value={newItem.pricePerKg}
                      onChange={(e) => setNewItem({ ...newItem, pricePerKg: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold shadow-sm"
                  onClick={handleAddStock}
                  disabled={addingStock}
                >
                  {addingStock ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> Add Stock</>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
