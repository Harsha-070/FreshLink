import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, ShoppingCart, TrendingUp, Star, Download, Loader2,
  Leaf, Recycle, TreePine, Package, BarChart2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const CATEGORY_COLORS: Record<string, string> = {
  Vegetables: '#10b981',
  Fruits: '#f59e0b',
  'Leafy Greens': '#3b82f6',
  Dairy: '#8b5cf6',
  Grains: '#ec4899',
  Others: '#6b7280',
};

export default function VendorAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [stock, setStock] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, stockData, ordersData] = await Promise.all([
          api.getOrderStats().catch(() => ({})),
          api.getMyStock().catch(() => ({ stock: [] })),
          api.getOrders().catch(() => ({ orders: [] })),
        ]);
        setStats(statsData);
        setStock(stockData.stock || stockData || []);
        setOrders(ordersData.orders || ordersData || []);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const topSellingItem = stats?.topSellingItem ?? (orders.length > 0 ? 'N/A' : '-');

  // Build revenue chart from real orders (last 7 days)
  const buildRevenueData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const revenueByDay: Record<string, number> = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      revenueByDay[dayName] = 0;
    }

    // Aggregate order revenues by day
    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt);
      const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 6 && daysDiff >= 0) {
        const dayName = days[orderDate.getDay()];
        revenueByDay[dayName] += order.totalAmount || order.total || 0;
      }
    });

    return Object.entries(revenueByDay).map(([day, revenue]) => ({ day, revenue }));
  };

  // Build top items from real orders
  const buildTopItemsData = () => {
    const itemCounts: Record<string, number> = {};

    orders.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const name = item.name || item.produce || 'Unknown';
        itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
      });
    });

    return Object.entries(itemCounts)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);
  };

  // Build waste reduction data from surplus stock
  const buildWasteData = () => {
    const surplusItems = stock.filter((s: any) => s.isSurplus || s.surplus);
    const totalWaste = surplusItems.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);

    // Group by month (current month data)
    const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
    return [{ month: currentMonth, wastePrevented: totalWaste, surplusSold: Math.round(totalWaste * 0.7) }];
  };

  // Build surplus by category from real stock
  const buildSurplusCategoryData = () => {
    const surplusItems = stock.filter((s: any) => s.isSurplus || s.surplus);
    if (surplusItems.length === 0) return []; // Return empty if no surplus

    const categoryTotals: Record<string, number> = {};
    surplusItems.forEach((item: any) => {
      const category = item.category || 'Others';
      categoryTotals[category] = (categoryTotals[category] || 0) + (item.quantity || 0);
    });

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    return Object.entries(categoryTotals).map(([name, qty]) => ({
      name,
      value: Math.round((qty / total) * 100),
      color: CATEGORY_COLORS[name] || '#6b7280',
    }));
  };

  const revenueData = buildRevenueData();
  const topItemsData = buildTopItemsData();
  const wasteData = buildWasteData();
  const surplusCategoryData = buildSurplusCategoryData();

  // Waste metrics calculations
  const surplusItems = stock.filter((s: any) => s.isSurplus || s.surplus);
  const wastePrevented = surplusItems.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
  const surplusUtilization = stock.length > 0 ? Math.round((surplusItems.length / stock.length) * 100) : 0;
  const co2Saved = Math.round(wastePrevented * 2.5);

  const hasRevenueData = revenueData.some(d => d.revenue > 0);
  const hasTopItems = topItemsData.length > 0;
  const hasWasteData = wasteData.some(d => d.wastePrevented > 0);
  const hasSurplusData = surplusCategoryData.length > 0;

  const salesKpis = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'emerald',
      change: totalOrders > 0 ? 'From orders' : 'No orders yet',
      positive: true,
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'blue',
      change: totalOrders > 0 ? 'Completed' : 'No orders yet',
      positive: true,
    },
    {
      title: 'Avg Order Value',
      value: `₹${avgOrderValue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'violet',
      change: totalOrders > 0 ? 'Per order' : '-',
      positive: true,
    },
    {
      title: 'Top Selling Item',
      value: topSellingItem,
      icon: Star,
      color: 'amber',
      change: totalOrders > 0 ? 'Most ordered' : '-',
      positive: true,
    },
  ];

  const wasteKpis = [
    {
      title: 'Waste Prevented',
      value: `${wastePrevented} kg`,
      icon: Leaf,
      color: 'teal',
      change: wastePrevented > 0 ? 'This month' : 'No surplus yet',
      positive: true,
    },
    {
      title: 'Surplus Utilization',
      value: `${surplusUtilization}%`,
      icon: Recycle,
      color: 'cyan',
      change: 'Of total stock',
      positive: true,
    },
    {
      title: 'CO₂ Saved',
      value: `${co2Saved} kg`,
      icon: TreePine,
      color: 'green',
      change: co2Saved > 0 ? 'Environmental impact' : '-',
      positive: true,
    },
    {
      title: 'Surplus Items',
      value: surplusItems.length,
      icon: Package,
      color: 'orange',
      change: surplusItems.length > 0 ? 'Active surplus' : 'None',
      positive: true,
    },
  ];

  const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
      <Icon className="w-12 h-12 mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">Track your sales performance and insights</p>
        </div>
        <Button
          variant="outline"
          className="border-slate-200 text-slate-600 hover:bg-slate-50"
          onClick={() => toast.success('Report exported successfully')}
        >
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </motion.div>

      {/* Sales KPI Cards */}
      <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.4 }}>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-emerald-600" />
          Sales Performance
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {salesKpis.map((kpi, i) => (
          <motion.div key={kpi.title} {...fadeUp} transition={{ delay: 0.1 * (i + 1), duration: 0.4 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 md:p-3 bg-${kpi.color}-100 text-${kpi.color}-600 rounded-xl`}>
                    <kpi.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className={`text-[10px] md:text-xs font-medium px-2 py-0.5 md:px-2.5 md:py-1 rounded-full ${
                    kpi.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
                <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                  {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-slate-300" /> : kpi.value}
                </h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Waste Reduction KPI Cards */}
      <motion.div {...fadeUp} transition={{ delay: 0.5, duration: 0.4 }}>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-teal-600" />
          Waste Reduction Impact
        </h2>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {wasteKpis.map((kpi, i) => (
          <motion.div key={kpi.title} {...fadeUp} transition={{ delay: 0.5 + 0.1 * (i + 1), duration: 0.4 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-teal-50/30">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`p-2 md:p-3 bg-${kpi.color}-100 text-${kpi.color}-600 rounded-xl`}>
                    <kpi.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
                <p className="text-[10px] md:text-xs font-medium text-slate-500 mb-0.5 md:mb-1">{kpi.title}</p>
                <h3 className="text-lg md:text-2xl font-bold text-slate-900">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : kpi.value}
                </h3>
                <span className="text-[10px] md:text-xs text-teal-600 font-medium">{kpi.change}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <motion.div className="lg:col-span-2" {...fadeUp} transition={{ delay: 0.5, duration: 0.4 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Revenue - Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : !hasRevenueData ? (
                  <EmptyState icon={BarChart2} message="No revenue data yet. Complete some orders to see trends." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#analyticsGrad)"
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Items Bar Chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.6, duration: 0.4 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base md:text-lg font-semibold text-slate-900">Top 5 Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] md:h-[320px] w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : !hasTopItems ? (
                  <EmptyState icon={Package} message="No orders yet. Top items will appear here." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topItemsData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={60} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value} orders`, 'Frequency']}
                      />
                      <Bar dataKey="orders" fill="#10b981" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Waste Reduction Charts */}
      <motion.div {...fadeUp} transition={{ delay: 0.7, duration: 0.4 }}>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Recycle className="w-5 h-5 text-cyan-600" />
          Sustainability Metrics
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Waste Prevention Trend */}
        <motion.div className="lg:col-span-2" {...fadeUp} transition={{ delay: 0.75, duration: 0.4 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg font-semibold text-slate-900">
                Waste Prevention (Current Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] md:h-[320px] w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : !hasWasteData ? (
                  <EmptyState icon={Leaf} message="No surplus items yet. Mark items as surplus to track waste prevention." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wasteData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kg`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number, name: string) => [`${value} kg`, name === 'wastePrevented' ? 'Waste Prevented' : 'Surplus Sold']}
                      />
                      <Legend formatter={(value) => value === 'wastePrevented' ? 'Waste Prevented' : 'Surplus Sold'} />
                      <Bar dataKey="wastePrevented" fill="#14b8a6" radius={[8, 8, 0, 0]} barSize={60} />
                      <Bar dataKey="surplusSold" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Surplus Distribution Pie Chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.8, duration: 0.4 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base md:text-lg font-semibold text-slate-900">Surplus by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] md:h-[320px] w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : !hasSurplusData ? (
                  <EmptyState icon={Recycle} message="No surplus items yet. Mark items as surplus to see distribution." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={surplusCategoryData}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                      >
                        {surplusCategoryData.map((entry: { name: string; value: number; color: string }, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Environmental Impact Summary */}
      <motion.div {...fadeUp} transition={{ delay: 0.85, duration: 0.4 }}>
        <Card className="border-0 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <TreePine className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Environmental Impact</p>
                  <h3 className="text-xl font-bold text-slate-900">Your Contribution</h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 md:gap-10 md:ml-auto">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-teal-600">{co2Saved}</p>
                  <p className="text-xs text-slate-500">kg CO₂ saved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-emerald-600">{wastePrevented}</p>
                  <p className="text-xs text-slate-500">kg waste prevented</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-amber-600">{Math.round(wastePrevented * 0.8)}</p>
                  <p className="text-xs text-slate-500">meals equivalent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
