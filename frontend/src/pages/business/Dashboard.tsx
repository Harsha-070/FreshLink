import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Search, Star, MapPin, Loader2, ShoppingCart,
  Package, TrendingUp, ChevronRight, Leaf, IndianRupee, Truck, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/useStore';

interface ProduceItem {
  _id?: string;
  name: string;
  category?: string;
}

interface RequirementRow {
  id: string;
  item: string;
  quantity: number;
  unit: string;
}

interface VendorMatch {
  vendorId?: string;
  vendorName?: string;
  vendor?: string;
  distance?: number;
  rating?: number;
  items?: Array<{ name: string; price: number; unit: string; availableQty?: number; quantity?: number }>;
  price?: number;
  availableQty?: number;
}

interface FulfillmentPlan {
  matches: VendorMatch[];
  totalCost?: number;
  deliveryCost?: number;
  grandTotal?: number;
}

interface NearbyVendor {
  vendorId: string;
  vendorName: string;
  distance: number;
  rating?: number;
  items?: Array<{ name: string; price: number; unit: string; isSurplus?: boolean }>;
}

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [produceList, setProduceList] = useState<ProduceItem[]>([]);
  const [requirements, setRequirements] = useState<RequirementRow[]>([
    { id: crypto.randomUUID(), item: '', quantity: 1, unit: 'kg' },
  ]);
  const [matchResults, setMatchResults] = useState<FulfillmentPlan | null>(null);
  const [nearbyVendors, setNearbyVendors] = useState<NearbyVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [cart, setCart] = useState<Array<{ vendorId?: string; vendorName?: string; item: string; price: number; qty: number; unit: string }>>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [produceData, vendorData] = await Promise.all([
        api.getProduceList().catch(() => ({ produce: [] })),
        api.getNearbyVendors().catch(() => ({ vendors: [] })),
      ]);
      setProduceList(produceData.produce || produceData || []);
      setNearbyVendors(vendorData.vendors || vendorData || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    setRequirements([...requirements, { id: crypto.randomUUID(), item: '', quantity: 1, unit: 'kg' }]);
  };

  const removeRow = (id: string) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((r) => r.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof RequirementRow, value: any) => {
    setRequirements(requirements.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleFindVendors = async () => {
    const validItems = requirements.filter((r) => r.item.trim());
    if (validItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    try {
      setMatchLoading(true);
      setMatchResults(null);
      const data = await api.findMatches({
        requirements: validItems.map((r) => ({ name: r.item, quantity: r.quantity, unit: r.unit })),
      });
      const matches = data.matches || data || [];
      const totalCost = data.totalCost || matches.reduce((sum: number, m: any) => {
        const itemTotal = (m.items || []).reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0);
        return sum + (m.price || itemTotal || 0);
      }, 0);
      const deliveryCost = data.deliveryCost || Math.round(totalCost * 0.05);
      setMatchResults({
        matches,
        totalCost,
        deliveryCost,
        grandTotal: data.grandTotal || totalCost + deliveryCost,
      });
      toast.success(`Found ${matches.length} matching vendor(s)`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to find vendors');
    } finally {
      setMatchLoading(false);
    }
  };

  const addToCart = (vendor: VendorMatch, item: any) => {
    setCart((prev) => [
      ...prev,
      {
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName || vendor.vendor || 'Vendor',
        item: item.name,
        price: item.price,
        qty: item.quantity || item.availableQty || 1,
        unit: item.unit,
      },
    ]);
    toast.success(`${item.name} added to order`);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to your order first');
      return;
    }
    try {
      setOrderLoading(true);
      const result = await api.createOrder({
        items: cart.map((c) => ({ name: c.item, quantity: c.qty, price: c.price, unit: c.unit })),
        vendorId: cart[0].vendorId,
      });
      const newOrder = result.order || result;
      const newOrderId = newOrder.id || newOrder._id;
      toast.success('Order placed! Redirecting to payment...');
      setCart([]);
      setMatchResults(null);
      setRequirements([{ id: crypto.randomUUID(), item: '', quantity: 1, unit: 'kg' }]);
      if (newOrderId) {
        navigate(`/business/checkout/${newOrderId}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
      />
    ));
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full -mb-20" />
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-medium mb-1">{greeting()}</p>
          <h1 className="text-3xl font-bold mb-2">{user?.name || 'Business Dashboard'}</h1>
          <p className="text-emerald-100/80 max-w-lg">
            Source fresh produce from verified local vendors. Post your requirements and get instant matches.
          </p>
        </div>
      </motion.div>

      {/* Quick Requirement Poster */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  Quick Requirement Poster
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">Add items you need and find the best vendors instantly</p>
              </div>
            </div>

            {/* Requirement Rows */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                <div className="col-span-5">Item</div>
                <div className="col-span-3">Quantity</div>
                <div className="col-span-3">Unit</div>
                <div className="col-span-1" />
              </div>
              {requirements.map((row) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-5">
                    <select
                      value={row.item}
                      onChange={(e) => updateRow(row.id, 'item', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    >
                      <option value="">Select item...</option>
                      {produceList.map((p, idx) => (
                        <option key={p._id || idx} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, 'quantity', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={row.unit}
                      onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="bunch">bunch</option>
                      <option value="pcs">pcs</option>
                      <option value="litre">litre</option>
                      <option value="dozen">dozen</option>
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {requirements.length > 1 && (
                      <button
                        onClick={() => removeRow(row.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={addRow}
                className="border-dashed border-slate-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-600"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
              <Button
                onClick={handleFindVendors}
                disabled={matchLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                {matchLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" /> Find Vendors
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Matching Results */}
      <AnimatePresence>
        {matchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Matching Vendors</h2>
              <button
                onClick={() => { setMatchResults(null); setCart([]); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchResults.matches.map((vendor, i) => (
                <motion.div
                  key={vendor.vendorId || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="h-full border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">
                            {vendor.vendorName || vendor.vendor || 'Vendor'}
                          </h3>
                          {vendor.distance != null && (
                            <p className="text-sm text-slate-500 flex items-center mt-0.5">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              {vendor.distance.toFixed(1)} km away
                            </p>
                          )}
                        </div>
                        {vendor.rating != null && (
                          <div className="flex items-center gap-0.5">{renderStars(vendor.rating)}</div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        {(vendor.items || []).map((item, j) => (
                          <div
                            key={j}
                            className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-500">
                                {item.price != null && (
                                  <span className="text-emerald-600 font-semibold">
                                    <IndianRupee className="w-3 h-3 inline" />
                                    {item.price}/{item.unit}
                                  </span>
                                )}
                                {item.availableQty != null && (
                                  <span className="ml-2">Avail: {item.availableQty} {item.unit}</span>
                                )}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => addToCart(vendor, item)}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Fulfillment Plan */}
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Fulfillment Summary</h3>
                {cart.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {cart.map((c, i) => (
                      <div key={i} className="flex justify-between text-sm bg-white rounded-lg px-4 py-2 border border-slate-100">
                        <span className="text-slate-700">
                          {c.item} x {c.qty} {c.unit} from <span className="font-medium">{c.vendorName}</span>
                        </span>
                        <span className="font-semibold text-slate-900">
                          <IndianRupee className="w-3 h-3 inline" />
                          {(c.price * c.qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Item Total</span>
                    <span className="font-medium">
                      <IndianRupee className="w-3 h-3 inline" />
                      {(matchResults.totalCost || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Delivery Cost</span>
                    <span className="font-medium">
                      <IndianRupee className="w-3 h-3 inline" />
                      {(matchResults.deliveryCost || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="text-emerald-600">
                      <IndianRupee className="w-3.5 h-3.5 inline" />
                      {(matchResults.grandTotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={orderLoading || cart.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                  >
                    {orderLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 mr-2" /> Place Order
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nearby Vendors */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Nearby Vendors</h2>
            <p className="text-sm text-slate-500 mt-0.5">Verified vendors within your delivery radius</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-slate-600"
            onClick={loadInitialData}
          >
            <TrendingUp className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="ml-3 text-slate-500 font-medium">Loading vendors...</span>
          </div>
        ) : nearbyVendors.length === 0 ? (
          <Card className="border-dashed border-slate-300">
            <CardContent className="py-16 text-center">
              <Leaf className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-700">No vendors found nearby</p>
              <p className="text-sm text-slate-500 mt-1">Try expanding your search radius or check back later</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {nearbyVendors.map((vendor, i) => (
              <motion.div
                key={vendor.vendorId || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="h-full border-slate-200 hover:shadow-lg hover:border-emerald-200 transition-all group cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <Truck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{vendor.vendorName}</h4>
                        <p className="text-xs text-slate-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-0.5" />
                          {vendor.distance?.toFixed(1)} km
                        </p>
                      </div>
                    </div>

                    {vendor.rating != null && (
                      <div className="flex items-center gap-1 mb-3">
                        {renderStars(vendor.rating)}
                        <span className="text-xs text-slate-500 ml-1">{vendor.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {vendor.items && vendor.items.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Items</p>
                        {vendor.items.slice(0, 3).map((item, j) => (
                          <div key={j} className="flex justify-between text-sm">
                            <span className="text-slate-600 truncate mr-2">
                              {item.name}
                              {item.isSurplus && (
                                <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                                  Surplus
                                </span>
                              )}
                            </span>
                            <span className="text-slate-900 font-medium whitespace-nowrap">
                              <IndianRupee className="w-3 h-3 inline" />
                              {item.price}/{item.unit}
                            </span>
                          </div>
                        ))}
                        {vendor.items.length > 3 && (
                          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                            +{vendor.items.length - 3} more <ChevronRight className="w-3 h-3 ml-0.5" />
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
