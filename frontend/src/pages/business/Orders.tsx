import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Package, Truck, CheckCircle2, Clock, Loader2,
  MapPin, IndianRupee, ChevronDown, ChevronUp, AlertCircle, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

interface Order {
  _id: string;
  orderId?: string;
  vendorName?: string;
  vendor?: { name?: string };
  items: OrderItem[];
  totalAmount?: number;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'in_transit', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

export default function BusinessOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const tabs = ['All', 'Processing', 'In Transit', 'Delivered'];
  const tabStatusMap: Record<string, string> = {
    All: '',
    Processing: 'processing',
    'In Transit': 'in_transit',
    Delivered: 'delivered',
  };

  const tabCounts = {
    All: orders.length,
    Processing: orders.filter((o) => o.status === 'processing').length,
    'In Transit': orders.filter((o) => o.status === 'in_transit').length,
    Delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data.orders || data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayId = (order: Order) => order.orderId || `ORD-${order._id?.slice(-6).toUpperCase()}` || 'N/A';
  const getVendorName = (order: Order) => order.vendorName || order.vendor?.name || 'Vendor';
  const getTotal = (order: Order) => {
    if (order.totalAmount != null) return order.totalAmount;
    return (order.items || []).reduce((acc, i) => acc + i.price * i.quantity, 0);
  };
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getStatusStepIndex = (status: string): number => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-slate-500';
      case 'confirmed': return 'text-blue-500';
      case 'processing': return 'text-amber-500';
      case 'in_transit': return 'text-indigo-500';
      case 'delivered': return 'text-emerald-500';
      default: return 'text-slate-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_transit': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle2 className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const tabStatus = tabStatusMap[activeTab];
    if (tabStatus && order.status !== tabStatus) return false;
    if (!searchQuery) return true;
    const id = getDisplayId(order).toLowerCase();
    const vendor = getVendorName(order).toLowerCase();
    const q = searchQuery.toLowerCase();
    return id.includes(q) || vendor.includes(q);
  });

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
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage all your purchase orders</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {(tabCounts as any)[tab] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {(tabCounts as any)[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-slate-500 font-medium">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-700">No orders found</p>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab !== 'All' ? `No ${activeTab.toLowerCase()} orders at the moment` : 'Your orders will appear here once placed'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const isExpanded = expandedOrder === order._id;
            const stepIndex = getStatusStepIndex(order.status);
            const total = getTotal(order);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-slate-200 overflow-hidden transition-all ${isExpanded ? 'shadow-md ring-1 ring-emerald-100' : 'hover:shadow-sm'}`}>
                  <CardContent className="p-0">
                    {/* Order Summary Row */}
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2.5 rounded-xl bg-slate-50 shrink-0 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-slate-900">{getDisplayId(order)}</h3>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              From <span className="font-medium text-slate-900">{getVendorName(order)}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Ordered on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">
                              <IndianRupee className="w-4 h-4 inline" />
                              {total.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-slate-500">{order.items?.length || 0} item(s)</p>
                          </div>

                          {order.status === 'in_transit' && (
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info('Opening live tracker...');
                              }}
                            >
                              <MapPin className="w-3.5 h-3.5 mr-1" /> Track
                            </Button>
                          )}

                          <button className="text-slate-400 hover:text-slate-600 p-1">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-100"
                      >
                        {/* Status Timeline */}
                        <div className="px-5 py-5 bg-slate-50/50">
                          <p className="text-sm font-semibold text-slate-700 mb-4">Order Progress</p>
                          <div className="flex items-center justify-between relative">
                            {/* Progress line background */}
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" />
                            {/* Progress line fill */}
                            <div
                              className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
                              style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                            />

                            {STATUS_STEPS.map((step, idx) => {
                              const isCompleted = idx <= stepIndex;
                              const isCurrent = idx === stepIndex;
                              return (
                                <div key={step} className="relative flex flex-col items-center z-10">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      isCompleted
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'bg-white border-slate-300 text-slate-400'
                                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-xs mt-2 font-medium ${
                                      isCurrent ? 'text-emerald-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                                    }`}
                                  >
                                    {STATUS_LABELS[step]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-700 mb-3">Order Items</p>
                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase">Item</th>
                                  <th className="text-center px-4 py-2.5 font-medium text-slate-500 text-xs uppercase">Qty</th>
                                  <th className="text-right px-4 py-2.5 font-medium text-slate-500 text-xs uppercase">Price</th>
                                  <th className="text-right px-4 py-2.5 font-medium text-slate-500 text-xs uppercase">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(order.items || []).map((item, i) => (
                                  <tr key={i} className="border-b border-slate-50 last:border-0">
                                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                                    <td className="px-4 py-3 text-center text-slate-600">{item.quantity} {item.unit || 'kg'}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">
                                      <IndianRupee className="w-3 h-3 inline" />{item.price}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                                      <IndianRupee className="w-3 h-3 inline" />{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-slate-50">
                                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-slate-700">Total</td>
                                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                    <IndianRupee className="w-3.5 h-3.5 inline" />{total.toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          {/* Estimated Delivery */}
                          {order.estimatedDelivery && order.status !== 'delivered' && (
                            <div className="mt-4 flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg px-4 py-3">
                              <Truck className="w-4 h-4" />
                              <span>Estimated delivery: <span className="font-semibold">{formatDate(order.estimatedDelivery)}</span></span>
                            </div>
                          )}
                          {order.status === 'delivered' && order.deliveredAt && (
                            <div className="mt-4 flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 rounded-lg px-4 py-3">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Delivered on <span className="font-semibold">{formatDate(order.deliveredAt)}</span></span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
