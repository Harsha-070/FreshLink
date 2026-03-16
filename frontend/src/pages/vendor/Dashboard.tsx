import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  IndianRupee, ShoppingCart, Package, Leaf, Plus, ClipboardList, Tag,
  TrendingUp, AlertTriangle, RefreshCw, Clock, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/useStore';

const revenueChartData = [
  { day: 'Mon', revenue: 3200 },
  { day: 'Tue', revenue: 4100 },
  { day: 'Wed', revenue: 2800 },
  { day: 'Thu', revenue: 5200 },
  { day: 'Fri', revenue: 4600 },
  { day: 'Sat', revenue: 6100 },
  { day: 'Sun', revenue: 5400 },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, stockData] = await Promise.allSettled([
        api.getOrderStats(),
        api.getOrders(),
        api.getMyStock(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (ordersData.status === 'fulfilled') {
        const orders = ordersData.value.orders || ordersData.value || [];
        setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
      }
      if (stockData.status === 'fulfilled') {
        setStock(stockData.value.stock || stockData.value || []);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayRevenue = stats?.todaySales ?? 0;
  const activeOrders = (stats?.processingOrders ?? 0) + (stats?.pendingOrders ?? 0);
  const itemsListed = stock.length;
  const wastePrevented = stock
    .filter((s: any) => s.isSurplus || s.surplus)
    .reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);

  const lowStockItems = stock.filter((item: any) => (item.quantity || 0) < 10 && (item.quantity || 0) > 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'in_transit': return 'bg-blue-100 text-blue-700';
      case 'confirmed':
      case 'processing': return 'bg-indigo-100 text-indigo-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const kpis = [
    {
      title: "Today's Revenue",
      value: `₹${todayRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Active Orders',
      value: activeOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Items Listed',
      value: itemsListed,
      icon: Package,
      color: 'bg-violet-500',
      lightColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      title: 'Waste Prevented',
      value: `${wastePrevented} kg`,
      icon: Leaf,
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-8 text-white"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || 'Vendor'}!
          </h1>
          <p className="text-emerald-100 text-lg">
            Here is your business overview for today. Keep up the great work reducing food waste.
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Leaf className="w-48 h-48" />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            {...fadeUp}
            transition={{ delay: 0.1 * (i + 1), duration: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${kpi.lightColor}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.textColor}`} />
                  </div>
                  <TrendingUp className={`w-4 h-4 ${kpi.textColor}`} />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : kpi.value}
                </h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div {...fadeUp} transition={{ delay: 0.5, duration: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                asChild
              >
                <Link to="/vendor/stock">
                  <Plus className="w-4 h-4 mr-2" /> Add Stock
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-slate-200 hover:bg-slate-50"
                asChild
              >
                <Link to="/vendor/orders">
                  <ClipboardList className="w-4 h-4 mr-2" /> View Orders
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-slate-200 hover:bg-slate-50"
                asChild
              >
                <Link to="/vendor/surplus">
                  <Tag className="w-4 h-4 mr-2" /> Mark Surplus
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Chart + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          {...fadeUp}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Revenue Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div {...fadeUp} transition={{ delay: 0.7, duration: 0.4 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  {lowStockItems.length} items
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
              ) : lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All items are well-stocked</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {lowStockItems.map((item: any) => {
                    const id = item._id || item.id;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100"
                      >
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                          <p className="text-xs text-amber-600">
                            {item.quantity} {item.unit || 'kg'} remaining
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-amber-200 text-amber-700 hover:bg-amber-100"
                          asChild
                        >
                          <Link to="/vendor/stock">
                            <RefreshCw className="w-3 h-3 mr-1" /> Restock
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.8, duration: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700" asChild>
                <Link to="/vendor/orders">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Order ID</th>
                      <th className="px-6 py-4 font-medium">Buyer</th>
                      <th className="px-6 py-4 font-medium">Items</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, i) => (
                      <motion.tr
                        key={order._id || order.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-slate-900">
                            #{(order._id || order.id || '').slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {order.buyerName || order.buyer?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">
                          {order.items?.map((it: any) => it.name || it.produce).join(', ') || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            ₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString('en-IN', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })
                              : 'N/A'}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                          <p className="text-slate-500">No recent orders found</p>
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
    </motion.div>
  );
}
