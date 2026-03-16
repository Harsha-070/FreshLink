import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Search, X, Loader2, MapPin, Star, Clock, AlertTriangle,
  CheckCircle2, AlertCircle, ChefHat, CalendarDays, Zap, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface RequirementItem {
  name: string;
  quantity: number;
  unit?: string;
}

interface Requirement {
  _id: string;
  items: RequirementItem[];
  urgency: string;
  neededBy: string;
  mealType?: string;
  status?: string;
  createdAt?: string;
}

interface VendorMatch {
  vendorId?: string;
  vendorName?: string;
  vendor?: string;
  distance?: number;
  rating?: number;
  items?: Array<{ name: string; price: number; unit: string; availableQty?: number; quantity?: number }>;
}

export default function Requirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Inline matching state
  const [matchMap, setMatchMap] = useState<Record<string, VendorMatch[]>>({});
  const [matchLoadingId, setMatchLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formItems, setFormItems] = useState<RequirementItem[]>([{ name: '', quantity: 1, unit: 'kg' }]);
  const [formUrgency, setFormUrgency] = useState('Medium');
  const [formNeededBy, setFormNeededBy] = useState('');
  const [formMealType, setFormMealType] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const data = await api.getRequirements();
      setRequirements(data.requirements || data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteRequirement(id);
      setRequirements(requirements.filter((req) => req._id !== id));
      if (expandedId === id) setExpandedId(null);
      toast.success('Requirement deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete requirement');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = formItems.filter((i) => i.name.trim());
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    try {
      setFormSubmitting(true);
      const body = {
        items: validItems,
        urgency: formUrgency,
        neededBy: formNeededBy || new Date().toISOString(),
        mealType: formMealType || undefined,
      };
      const data = await api.createRequirement(body);
      const newReq = data.requirement || data;
      setRequirements([newReq, ...requirements]);
      toast.success('Requirement posted successfully');
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create requirement');
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormItems([{ name: '', quantity: 1, unit: 'kg' }]);
    setFormUrgency('Medium');
    setFormNeededBy('');
    setFormMealType('');
  };

  const addFormItem = () => {
    setFormItems([...formItems, { name: '', quantity: 1, unit: 'kg' }]);
  };

  const updateFormItem = (index: number, field: string, value: any) => {
    const updated = [...formItems];
    (updated[index] as any)[field] = value;
    setFormItems(updated);
  };

  const removeFormItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  const handleFindVendors = async (req: Requirement) => {
    if (expandedId === req._id && matchMap[req._id]) {
      setExpandedId(null);
      return;
    }
    try {
      setMatchLoadingId(req._id);
      setExpandedId(req._id);
      const data = await api.findMatches({ requirements: req.items });
      const matches = data.matches || data || [];
      setMatchMap((prev) => ({ ...prev, [req._id]: matches }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to find vendors');
    } finally {
      setMatchLoadingId(null);
    }
  };

  const filteredRequirements = requirements.filter((req) => {
    const itemNames = (req.items || []).map((i) => i.name).join(' ');
    const q = searchQuery.toLowerCase();
    return (
      itemNames.toLowerCase().includes(q) ||
      (req.mealType || '').toLowerCase().includes(q) ||
      (req.urgency || '').toLowerCase().includes(q)
    );
  });

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', icon: <Zap className="w-3 h-3" /> };
      case 'medium':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', icon: <AlertTriangle className="w-3 h-3" /> };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" /> };
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Fulfilled' };
      case 'partial':
        return { badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" />, label: 'Partially Fulfilled' };
      default:
        return { badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: <AlertCircle className="w-3.5 h-3.5" />, label: status || 'Open' };
    }
  };

  const getMealIcon = (mealType?: string) => {
    return <ChefHat className="w-4 h-4" />;
  };

  const mealTypeOptions = [
    { value: '', label: 'Select Meal Type' },
    { value: 'Breakfast', label: 'Breakfast' },
    { value: 'Lunch', label: 'Lunch' },
    { value: 'Dinner', label: 'Dinner' },
    { value: 'Juice Menu', label: 'Juice Menu' },
    { value: 'General', label: 'General' },
  ];

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
    ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requirements</h1>
          <p className="text-slate-500 text-sm mt-1">Plan your meals and manage ingredient requirements</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Post New Requirement
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by item, meal type, or urgency..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Requirements List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-slate-500 font-medium">Loading requirements...</p>
        </div>
      ) : filteredRequirements.length === 0 ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-700">No requirements found</p>
            <p className="text-sm text-slate-500 mt-1">Post your first requirement to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequirements.map((req, i) => {
            const urgency = getUrgencyConfig(req.urgency);
            const status = getStatusConfig(req.status);
            const isExpanded = expandedId === req._id;
            const vendorMatches = matchMap[req._id] || [];

            return (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border-slate-200 overflow-hidden transition-shadow ${isExpanded ? 'shadow-md ring-1 ring-emerald-200' : 'hover:shadow-sm'}`}>
                  <CardContent className="p-0">
                    {/* Main Card Content */}
                    <div className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Left: Meal type + items */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2.5 rounded-xl ${urgency.bg} shrink-0`}>
                            {getMealIcon(req.mealType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              {req.mealType && (
                                <span className="text-sm font-bold text-slate-900 capitalize">{req.mealType}</span>
                              )}
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${urgency.badge}`}>
                                {urgency.icon} {req.urgency}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.badge}`}>
                                {status.icon} {status.label}
                              </span>
                            </div>

                            {/* Items List */}
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(req.items || []).map((item, idx) => (
                                <span key={idx} className="inline-flex items-center bg-slate-100 text-slate-700 rounded-lg px-3 py-1.5 text-sm">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-slate-400 mx-1.5">-</span>
                                  <span className="text-slate-500">{item.quantity} {item.unit || 'kg'}</span>
                                </span>
                              ))}
                            </div>

                            {/* Needed By */}
                            {req.neededBy && (
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                Needed by {new Date(req.neededBy).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 lg:shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => handleFindVendors(req)}
                            disabled={matchLoadingId === req._id}
                          >
                            {matchLoadingId === req._id ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Find Vendors
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(req._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Matching Results */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-100 bg-emerald-50/30 px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold text-slate-700">Matching Vendors</p>
                              <button
                                onClick={() => setExpandedId(null)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {matchLoadingId === req._id ? (
                              <div className="flex items-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
                                <span className="text-sm text-slate-500">Searching for best vendors...</span>
                              </div>
                            ) : vendorMatches.length === 0 ? (
                              <p className="text-sm text-slate-500 py-2">No matching vendors found for these items.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {vendorMatches.map((m: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-200 transition-colors"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <p className="font-semibold text-slate-900">{m.vendorName || m.vendor || 'Vendor'}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          {m.distance != null && (
                                            <span className="text-xs text-slate-500 flex items-center">
                                              <MapPin className="w-3 h-3 mr-0.5" /> {m.distance.toFixed(1)} km
                                            </span>
                                          )}
                                          {m.rating != null && (
                                            <span className="flex items-center gap-0.5">{renderStars(m.rating)}</span>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                        onClick={() => toast.success('Order request sent to vendor')}
                                      >
                                        Order
                                      </Button>
                                    </div>
                                    {(m.items || []).length > 0 && (
                                      <div className="space-y-1 mt-2 pt-2 border-t border-slate-100">
                                        {(m.items || []).map((it: any, j: number) => (
                                          <div key={j} className="flex justify-between text-xs text-slate-600">
                                            <span>{it.name}</span>
                                            <span className="font-medium text-slate-800">Rs.{it.price}/{it.unit}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Requirement Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Post New Requirement</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Specify what you need and when</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                {/* Meal Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meal Type</label>
                  <select
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {mealTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Items */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Items</label>
                  <div className="space-y-2">
                    {formItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => updateFormItem(idx, 'name', e.target.value)}
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateFormItem(idx, 'quantity', Number(e.target.value))}
                          className="w-20 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <select
                          value={item.unit || 'kg'}
                          onChange={(e) => updateFormItem(idx, 'unit', e.target.value)}
                          className="w-20 border border-slate-200 rounded-lg px-2 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="bunch">bunch</option>
                          <option value="pcs">pcs</option>
                          <option value="litre">litre</option>
                        </select>
                        {formItems.length > 1 && (
                          <button type="button" onClick={() => removeFormItem(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addFormItem}
                    className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add another item
                  </button>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Urgency</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map((level) => {
                      const config = getUrgencyConfig(level);
                      const isActive = formUrgency === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormUrgency(level)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                            isActive
                              ? `${config.badge} ${config.border} ring-2 ring-offset-1 ring-current`
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Needed By */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Needed By</label>
                  <input
                    type="date"
                    value={formNeededBy}
                    onChange={(e) => setFormNeededBy(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6" disabled={formSubmitting}>
                    {formSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Post Requirement
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
