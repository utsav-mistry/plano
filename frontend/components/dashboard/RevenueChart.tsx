'use client';

import React, { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api } from '@/lib/api';

export default function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.reports.getRevenueReport({ period: '12m' });
        if (res.success && res.data) {
          // Normalize backend data format (assuming _id is the date key)
          const formatted = (res.data.revenue || []).map((item: any) => ({
             name: item._id,
             revenue: item.totalRevenue
          }));
          setData(formatted);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Revenue fetch error:', err);
        setData([]);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, []);

  // Avoid rendering chart with 0 height/width initially which causes Recharts warnings
  if (!isLoaded) return <div className="h-72 w-full bg-gray-50/50 animate-pulse rounded-xl" />;

  return (
    <div className="bg-bg-surface p-6 rounded-card border border-border shadow-sm group hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-sans font-bold text-text-primary">Revenue Inflow</h3>
          <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold">MRR History • Real-time Data</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
           <span className="text-[10px] font-bold text-success-600 uppercase tracking-widest">Live Feed</span>
        </div>
      </div>

      <div className="h-72 w-full min-h-[18rem] overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#714b67" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#714b67" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede9" className="dark:stroke-gray-800" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#a97096', fontWeight: 600 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#a97096', fontWeight: 600 }} 
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: 'var(--color-sidebar-bg)',
                color: 'white'
              }} 
              itemStyle={{ color: '#f0e3ec' }}
              cursor={{ stroke: '#cba3bc', strokeWidth: 2, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#714b67" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
