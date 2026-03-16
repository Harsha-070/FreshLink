import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, TrendingDown, Package, Tag, Snowflake, X,
  Loader2, MapPin, Thermometer, Warehouse, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function SurplusHub() {
  const [surplusItems, setSurplusItems] = useState<any[]>([]);
  const [myStock, setMyStock] = useState<any[]>([]);
  const [coldStorages, setColdStorages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mark surplus modal
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<any>(null);
  const [discountPercent, setDiscountPercent] = useState(20);

  const [surplusStats, setSurplusStats] = useState<any>({});

  // Cold storage modal
  const [showColdModal, setShowColdModal] = useState(false);
  const [coldStockId, setColdStockId] = useState('');
  const [coldStorageId, setColdStorageId] = useState('');
  const [coldQty, setColdQty] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [surplusRes, stockRes, coldRes] = await Promise.allSettled([
        api.getMySurplus(),
        api.getMyStock(),
        api.getColdStorages(),
      ]);

      if (surplusRes.status === 'fulfilled') {
        setSurplusItems(surplusRes.value.surplus || []);
        if (surplusRes.value.stats) setSurplusStats(surplusRes.value.stats);
      }
      if (stockRes.status === 'fulfilled') setMyStock(stockRes.value.stock || []);
      if (coldRes.status === 'fulfilled') setColdStorages(coldRes.value.facilities || coldRes.value.coldStorages || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const nonSurplusStock = myStock.filter(
    (item) => !item.isSurplus && !item.surplus && (item.quantity || 0) > 0
  );

  const selectedColdStorage = coldStorages.find(
    (cs) => (cs._id || cs.id) === coldStorageId
  );

  const nearExpiryCount = surplusStats.nearExpiry ?? surplusItems.length;
  const foodSaved = surplusStats.foodSavedKg ?? surplusItems.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
  const activeListings = surplusStats.activeListings ?? surplusItems.length;

  const handleOpenMarkModal = (item: any) => {
    setSelectedStockItem(item);
    setDiscountPercent(20);
    setShowMarkModal(true);
  };

  const handleMarkSurplus = async () => {
    if (!selectedStockItem) return;
    const id = selectedStockItem._id || selectedStockItem.id;
    try {
      await api.markSurplus(id, discountPercent);
      toast.success(`${selectedStockItem.name} marked as surplus with ${discountPercent}% discount`);
      setShowMarkModal(false);
      setSelectedStockItem(null);
      fetchAllData();
    } catch (err) {
      console.error('Failed to mark surplus:', err);
      toast.error('Failed to mark as surplus');
    }
  };

  const handleColdStorageRequest = async () => {
    if (!coldStockId || !coldStorageId || !coldQty) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await api.requestColdStorage({
        stockId: coldStockId,
        coldStorageId,
        quantity: Number(coldQty),
      });
      toast.success('Cold storage request submitted successfully');
      setShowColdModal(false);
      setColdStockId('');
      setColdStorageId('');
      setColdQty('');
    } catch (err) {
      console.error('Failed to request cold storage:', err);
      toast.error('Cold storage request failed');
    }
  };

  const previewDiscountPrice = selectedStockItem
    ? Math.round((selectedStockItem.pricePerKg || 0) * (1 - discountPercent / 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-slate-900">Surplus Hub</h1>
        <p className="text-slate-500 mt-1">Reduce waste by managing near-expiry items and cold storage</p>
      </motion.div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Near Expiry Items',
            value: nearExpiryCount,
            icon: AlertTriangle,
            color: 'amber',
          },
          {
            title: 'Food Saved',
            value: `${foodSaved} kg`,
            icon: TrendingDown,
            color: 'emerald',
          },
          {
            title: 'Active Surplus Listings',
            value: activeListings || surplusItems.length,
            icon: Package,
            color: 'blue',
          },
        ].map((stat, i) => (
          <motion.div key={stat.title} {...fadeUp} transition={{ delay: 0.1 * (i + 1), duration: 0.4 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-100 text-${stat.color}-600 rounded-xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Non-surplus stock list */}
      <motion.div {...fadeUp} transition={{ delay: 0.4, duration: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Available Stock - Mark as Surplus
              </CardTitle>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => setShowColdModal(true)}
              >
                <Snowflake className="w-4 h-4 mr-2" /> Send to Cold Storage
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
            ) : nonSurplusStock.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No items available to mark as surplus</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nonSurplusStock.map((item) => {
                  const id = item._id || item.id;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.quantity} {item.unit || 'kg'} - ₹{item.pricePerKg}/{item.unit || 'kg'}
                            {item.expiryDate && (
                              <span className="ml-2 text-amber-600">
                                Expires: {new Date(item.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                        onClick={() => handleOpenMarkModal(item)}
                      >
                        <Tag className="w-3.5 h-3.5 mr-1.5" /> Mark as Surplus
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Surplus Items Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.5, duration: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Current Surplus Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
            ) : surplusItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Tag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No surplus items yet. Mark items above to list them here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Item</th>
                      <th className="px-4 py-4 font-medium">Original Price</th>
                      <th className="px-4 py-4 font-medium">Discount Price</th>
                      <th className="px-4 py-4 font-medium">Savings</th>
                      <th className="px-4 py-4 font-medium">Quantity</th>
                      <th className="px-4 py-4 font-medium">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surplusItems.map((item, index) => {
                      const originalPrice = item.pricePerKg || 0;
                      const discountPrice = item.discountPrice || originalPrice;
                      const discount = originalPrice > 0 ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;
                      return (
                        <motion.tr
                          key={item._id || item.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                          <td className="px-4 py-4 text-slate-500 line-through">
                            ₹{originalPrice}/{item.unit || 'kg'}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-emerald-600">
                              ₹{discountPrice}/{item.unit || 'kg'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                              -{discount}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {item.quantity} {item.unit || 'kg'}
                          </td>
                          <td className="px-4 py-4 text-slate-500 text-xs">
                            {item.expiryDate
                              ? new Date(item.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '-'}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Cold Storage Section */}
      <motion.div {...fadeUp} transition={{ delay: 0.6, duration: 0.4 }}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-blue-500" />
              Cold Storage Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coldStorages.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No cold storage facilities available nearby.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coldStorages.map((cs) => {
                  const csId = cs._id || cs.id;
                  return (
                    <div
                      key={csId}
                      className="bg-white rounded-xl p-4 border border-blue-100 hover:border-blue-300 transition-colors"
                    >
                      <h4 className="font-semibold text-slate-900 mb-2">{cs.name}</h4>
                      <div className="space-y-1.5 text-xs text-slate-500">
                        {cs.address && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span>{cs.address}</span>
                            {cs.distance && <span className="text-blue-600 font-medium">({cs.distance} km)</span>}
                          </div>
                        )}
                        {cs.pricePerKgPerDay && (
                          <div className="flex items-center gap-1.5">
                            <Warehouse className="w-3.5 h-3.5 text-blue-400" />
                            <span>₹{cs.pricePerKgPerDay}/kg/day</span>
                          </div>
                        )}
                        {cs.temperature && (
                          <div className="flex items-center gap-1.5">
                            <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                            <span>{cs.temperature}°C</span>
                          </div>
                        )}
                        {cs.available && (
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-blue-400" />
                            <span>{cs.available} kg available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mark Surplus Modal */}
      <AnimatePresence>
        {showMarkModal && selectedStockItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMarkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Mark as Surplus</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowMarkModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-medium text-slate-900">{selectedStockItem.name}</p>
                  <p className="text-sm text-slate-500">
                    {selectedStockItem.quantity} {selectedStockItem.unit || 'kg'} at ₹{selectedStockItem.pricePerKg}/{selectedStockItem.unit || 'kg'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Discount Percentage: <span className="text-emerald-600 font-bold">{discountPercent}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>10%</span>
                    <span>30%</span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Preview Discount Price</p>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 line-through text-lg">
                      ₹{selectedStockItem.pricePerKg}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="text-2xl font-bold text-emerald-600">
                      ₹{previewDiscountPrice}
                    </span>
                    <span className="text-sm text-slate-500">/{selectedStockItem.unit || 'kg'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowMarkModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleMarkSurplus}
                  >
                    Confirm Surplus
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cold Storage Request Modal */}
      <AnimatePresence>
        {showColdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowColdModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Snowflake className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Send to Cold Storage</h2>
                    <p className="text-sm text-slate-500">Preserve your produce for longer</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowColdModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Item</label>
                  <select
                    value={coldStockId}
                    onChange={(e) => setColdStockId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an item...</option>
                    {myStock.map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.name} ({s.quantity} {s.unit || 'kg'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Facility</label>
                  <select
                    value={coldStorageId}
                    onChange={(e) => setColdStorageId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a facility...</option>
                    {coldStorages.map((cs) => (
                      <option key={cs._id || cs.id} value={cs._id || cs.id}>
                        {cs.name} - {cs.address || ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected facility details */}
                {selectedColdStorage && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-blue-900 text-sm">{selectedColdStorage.name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                      {selectedColdStorage.distance && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {selectedColdStorage.distance} km away
                        </div>
                      )}
                      {selectedColdStorage.pricePerKgPerDay && (
                        <div className="flex items-center gap-1">
                          <Warehouse className="w-3 h-3" /> ₹{selectedColdStorage.pricePerKgPerDay}/kg/day
                        </div>
                      )}
                      {selectedColdStorage.temperature && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3" /> {selectedColdStorage.temperature}°C
                        </div>
                      )}
                      {selectedColdStorage.available && (
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" /> {selectedColdStorage.available} kg free
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={coldQty}
                    onChange={(e) => setColdQty(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowColdModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleColdStorageRequest}
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
