import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Download, CheckCircle2, Loader2, IndianRupee,
  ShoppingBag, RotateCcw, Calendar, Package, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

interface DeliveredOrder {
  _id: string;
  orderId?: string;
  vendorName?: string;
  vendor?: { name?: string };
  items: OrderItem[];
  totalAmount?: number;
  status: string;
  createdAt: string;
  deliveredAt?: string;
}

export default function BusinessHistory() {
  const [orders, setOrders] = useState<DeliveredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders('delivered');
      setOrders(data.orders || data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => {
    if (order.totalAmount != null) return sum + order.totalAmount;
    return sum + (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
  }, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  const getDisplayId = (order: DeliveredOrder) => order.orderId || `ORD-${order._id?.slice(-6).toUpperCase()}` || 'N/A';
  const getVendorName = (order: DeliveredOrder) => order.vendorName || order.vendor?.name || 'Vendor';
  const getTotal = (order: DeliveredOrder) => {
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

  const handleReorder = async (order: DeliveredOrder) => {
    try {
      setReorderingId(order._id);
      await api.createOrder({
        items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, unit: i.unit })),
        vendorId: (order as any).vendorId || undefined,
      });
      toast.success('Reorder placed successfully! Check your Orders page.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reorder');
    } finally {
      setReorderingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const id = getDisplayId(order).toLowerCase();
    const vendor = getVendorName(order).toLowerCase();
    const itemNames = (order.items || []).map((i) => i.name).join(' ').toLowerCase();
    const q = searchQuery.toLowerCase();
    return id.includes(q) || vendor.includes(q) || itemNames.includes(q);
  });

  const summaryCards = [
    {
      label: 'Total Orders Completed',
      value: loading ? '...' : totalOrders.toString(),
      icon: <Package className="w-6 h-6" />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      accent: 'border-l-emerald-500',
    },
    {
      label: 'Total Amount Spent',
      value: loading ? '...' : `Rs.${totalSpent.toLocaleString('en-IN')}`,
      icon: <IndianRupee className="w-6 h-6" />,
      iconBg: 'bg-blue-50 text-blue-600',
      accent: 'border-l-blue-500',
    },
    {
      label: 'Average Order Value',
      value: loading ? '...' : `Rs.${avgOrderValue.toLocaleString('en-IN')}`,
      icon: <TrendingUp className="w-6 h-6" />,
      iconBg: 'bg-purple-50 text-purple-600',
      accent: 'border-l-purple-500',
    },
  ];

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
          <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
          <p className="text-slate-500 text-sm mt-1">Review your completed purchases and reorder anytime</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="text-slate-600"
            onClick={() => toast.info('Generating export...')}
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className={`border-l-4 ${card.accent} border-slate-200`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.iconBg}`}>{card.icon}</div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by order ID, vendor, or item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-slate-500 font-medium">Loading order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-700">No completed orders yet</p>
            <p className="text-sm text-slate-500 mt-1">Your delivered orders will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const total = getTotal(order);
            const isReordering = reorderingId === order._id;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-slate-900 text-lg">{getDisplayId(order)}</h3>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              From <span className="font-medium text-slate-900">{getVendorName(order)}</span>
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Ordered: {formatDate(order.createdAt)}
                              </span>
                              {order.deliveredAt && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Delivered: {formatDate(order.deliveredAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xs text-slate-500 mb-0.5">Total Amount</p>
                          <p className="text-xl font-bold text-emerald-600">
                            <IndianRupee className="w-4 h-4 inline" />
                            {total.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-slate-50 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Items Ordered</p>
                        <div className="space-y-2">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
                                  {item.quantity}
                                </span>
                                <span className="text-slate-700">{item.name}</span>
                                <span className="text-slate-400 text-xs">({item.unit || 'kg'})</span>
                              </div>
                              <span className="font-medium text-slate-900">
                                <IndianRupee className="w-3 h-3 inline" />
                                {(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-slate-600"
                          onClick={() => toast.info('Downloading invoice...')}
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Invoice
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleReorder(order)}
                          disabled={isReordering}
                        >
                          {isReordering ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Reorder
                        </Button>
                      </div>
                    </div>
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
