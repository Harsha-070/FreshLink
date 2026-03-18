import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, ShoppingCart, TrendingUp, Star, Download, Loader2,
  Leaf, Recycle, TreePine, Package
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

const revenueData = [
  { day: 'Mon', revenue: 3200 },
  { day: 'Tue', revenue: 4500 },
  { day: 'Wed', revenue: 2800 },
  { day: 'Thu', revenue: 5100 },
  { day: 'Fri', revenue: 4200 },
  { day: 'Sat', revenue: 6800 },
  { day: 'Sun', revenue: 5500 },
];

const topItemsData = [
  { name: 'Tomatoes', orders: 45 },
  { name: 'Onions', orders: 38 },
  { name: 'Potatoes', orders: 32 },
  { name: 'Carrots', orders: 25 },
  { name: 'Spinach', orders: 20 },
];

const wasteReductionData = [
  { month: 'Jan', wastePrevented: 45, surplusSold: 32 },
  { month: 'Feb', wastePrevented: 52, surplusSold: 41 },
  { month: 'Mar', wastePrevented: 68, surplusSold: 55 },
  { month: 'Apr', wastePrevented: 75, surplusSold: 62 },
  { month: 'May', wastePrevented: 82, surplusSold: 70 },
  { month: 'Jun', wastePrevented: 95, surplusSold: 78 },
];

const surplusDistributionData = [
  { name: 'Vegetables', value: 45, color: '#10b981' },
  { name: 'Fruits', value: 30, color: '#f59e0b' },
  { name: 'Leafy Greens', value: 15, color: '#3b82f6' },
  { name: 'Others', value: 10, color: '#8b5cf6' },
];

export default function VendorAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsData, stockData] = await Promise.all([
          api.getOrderStats(),
          api.getMyStock().catch(() => ({ stock: [] })),
        ]);
        setStats(statsData);
        setStock(stockData.stock || stockData || []);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const topSellingItem = stats?.topSellingItem ?? 'Tomatoes';

  // Waste metrics calculations
  const surplusItems = stock.filter((s: any) => s.isSurplus || s.surplus);
  const wastePrevented = surplusItems.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
  const surplusUtilization = stock.length > 0 ? Math.round((surplusItems.length / stock.length) * 100) : 0;
  const co2Saved = Math.round(wastePrevented * 2.5); // ~2.5 kg CO2 per kg of food waste prevented

  const salesKpis = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'emerald',
      change: '+12.5%',
      positive: true,
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'blue',
      change: '+8.2%',
      positive: true,
    },
    {
      title: 'Avg Order Value',
      value: `₹${avgOrderValue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'violet',
      change: '+3.1%',
      positive: true,
    },
    {
      title: 'Top Selling Item',
      value: topSellingItem,
      icon: Star,
      color: 'amber',
      change: 'Most ordered',
      positive: true,
    },
  ];

  const wasteKpis = [
    {
      title: 'Waste Prevented',
      value: `${wastePrevented} kg`,
      icon: Leaf,
      color: 'teal',
      change: 'This month',
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
      change: 'Environmental impact',
      positive: true,
    },
    {
      title: 'Surplus Items',
      value: surplusItems.length,
      icon: Package,
      color: 'orange',
      change: 'Active surplus',
      positive: true,
    },
  ];

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
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="day"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#analyticsGrad)"
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topItemsData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`${value} orders`, 'Frequency']}
                    />
                    <Bar
                      dataKey="orders"
                      fill="#10b981"
                      radius={[0, 8, 8, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
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
                Waste Prevention Trend (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] md:h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wasteReductionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="surplusGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number, name: string) => [
                        `${value} kg`,
                        name === 'wastePrevented' ? 'Waste Prevented' : 'Surplus Sold'
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => value === 'wastePrevented' ? 'Waste Prevented' : 'Surplus Sold'}
                    />
                    <Area
                      type="monotone"
                      dataKey="wastePrevented"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#wasteGrad)"
                      dot={{ r: 3, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="surplusSold"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#surplusGrad)"
                      dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={surplusDistributionData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                    >
                      {surplusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
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
