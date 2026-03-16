import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Package, Truck, CheckCircle, XCircle, ShoppingCart,
  FileText, Loader2, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

type TabKey = 'all' | 'pending' | 'confirmed' | 'in_transit' | 'delivered';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        style: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
      };
    case 'confirmed':
      return {
        label: 'Confirmed',
        style: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Package,
      };
    case 'processing':
      return {
        label: 'Processing',
        style: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Package,
      };
    case 'in_transit':
      return {
        label: 'In Transit',
        style: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Truck,
      };
    case 'delivered':
      return {
        label: 'Delivered',
        style: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        style: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
      };
    default:
      return {
        label: status || 'Unknown',
        style: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: AlertCircle,
      };
  }
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getOrderStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch order stats:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      const statusMessages: Record<string, string> = {
        confirmed: 'Order accepted',
        cancelled: 'Order declined',
        processing: 'Order marked as processing',
        in_transit: 'Order dispatched',
        delivered: 'Order delivered',
      };
      toast.success(statusMessages[newStatus] || 'Status updated');
      await Promise.all([fetchOrders(), fetchStats()]);
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = stats?.pendingOrders ?? orders.filter(o => o.status === 'pending').length;
  const processingCount = stats?.processingOrders ?? orders.filter(o => ['processing', 'confirmed'].includes(o.status)).length;
  const deliveredCount = stats?.deliveredToday ?? orders.filter(o => o.status === 'delivered').length;

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => {
        if (activeTab === 'confirmed') return o.status === 'confirmed' || o.status === 'processing';
        return o.status === activeTab;
      });

  const kpis = [
    { title: 'Pending', value: pendingCount, icon: Clock, color: 'amber' },
    { title: 'Processing', value: processingCount, icon: Package, color: 'blue' },
    { title: 'Delivered Today', value: deliveredCount, icon: CheckCircle, color: 'emerald' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
        <p className="text-slate-500 mt-1">Track and process your incoming orders</p>
      </motion.div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.title} {...fadeUp} transition={{ delay: 0.1 * (i + 1), duration: 0.4 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 bg-${kpi.color}-100 text-${kpi.color}-600 rounded-xl`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : kpi.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tab Filters */}
      <motion.div {...fadeUp} transition={{ delay: 0.4, duration: 0.4 }}>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.key === 'pending' ? pendingCount :
                   tab.key === 'confirmed' ? processingCount :
                   tab.key === 'in_transit' ? orders.filter(o => o.status === 'in_transit').length :
                   tab.key === 'delivered' ? deliveredCount : 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Order Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="ml-3 text-slate-500">Loading orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No orders found</p>
          <p className="text-slate-400 text-sm mt-1">Orders will appear here when buyers place them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const orderId = order._id || order.id;
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isUpdating = updatingId === orderId;

            return (
              <motion.div
                key={orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-6">
                    {/* Top row: Order ID, Buyer, Time, Status */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-5">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-lg font-bold text-slate-900 font-mono">
                            #{(orderId || '').slice(-8).toUpperCase()}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.style}`}>
                            <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          <span className="font-medium text-slate-700">{order.buyerName || order.buyer?.name || 'N/A'}</span>
                          <span className="mx-2 text-slate-300">|</span>
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Total Amount</p>
                        <p className="text-2xl font-bold text-slate-900">
                          ₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-5">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {(order.items || []).map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span className="text-slate-700">
                                {item.name || item.produce}
                              </span>
                              <span className="text-slate-400">
                                x {item.quantity} {item.unit || 'kg'}
                              </span>
                            </div>
                            <span className="font-medium text-slate-900">
                              ₹{(item.price || item.totalPrice || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleStatusUpdate(orderId, 'cancelled')}
                            disabled={isUpdating}
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Decline
                          </Button>
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            onClick={() => handleStatusUpdate(orderId, 'confirmed')}
                            disabled={isUpdating}
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Accept
                          </Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                          onClick={() => handleStatusUpdate(orderId, 'processing')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
                          Mark Processing
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button
                          className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                          onClick={() => handleStatusUpdate(orderId, 'in_transit')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                          Dispatch
                        </Button>
                      )}
                      {order.status === 'in_transit' && (
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          onClick={() => handleStatusUpdate(orderId, 'delivered')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                          Mark Delivered
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <FileText className="w-4 h-4 mr-2" /> View Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
