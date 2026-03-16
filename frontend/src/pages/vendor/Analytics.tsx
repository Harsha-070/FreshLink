import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, ShoppingCart, TrendingUp, Star, Download, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
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

export default function VendorAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getOrderStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch order stats:', err);
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

  const kpis = [
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

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.title} {...fadeUp} transition={{ delay: 0.1 * (i + 1), duration: 0.4 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${kpi.color}-100 text-${kpi.color}-600 rounded-xl`}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    kpi.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {kpi.change}
                  </span>
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
              <CardTitle className="text-lg font-semibold text-slate-900">Top 5 Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
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
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={70}
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
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
