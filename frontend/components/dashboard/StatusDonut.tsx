'use client';

import React, { useEffect, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { api } from '@/lib/api';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#94a3b8'];

export default function StatusDonut() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.reports.getDashboardStats();
        if (res.success) {
          const stats = res.data;
          setData([
            { name: 'Active', value: stats.activeSubscriptions },
            { name: 'Closed', value: stats.closedSubscriptions || 0 },
            { name: 'Confirmed', value: stats.confirmedSubscriptions || 0 },
            { name: 'Draft', value: stats.draftSubscriptions || 0 },
          ]);
          setTotal(stats.activeSubscriptions + (stats.closedSubscriptions || 0) + (stats.confirmedSubscriptions || 0) + (stats.draftSubscriptions || 0));
        } else {
          setData([]);
          setTotal(0);
        }
      } catch {
         setData([]);
         setTotal(0);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, []);

  if (!isLoaded) return <div className="h-full w-full bg-gray-50/50 animate-pulse rounded-xl" />;

  return (
    <div className="bg-bg-surface p-6 rounded-card border border-border shadow-sm h-full flex flex-col hover:shadow-md transition-all">
       <div className="mb-8">
          <h3 className="text-xl font-sans font-bold text-text-primary">Subscription Health</h3>
          <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold">Status Segments • System Audit</p>
       </div>

       <div className="flex-1 min-h-[16rem] relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
             <span className="text-4xl font-sans font-bold text-text-primary leading-none">{total}</span>
             <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-[0.2em] mt-1">units</span>
          </div>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={8}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                   borderRadius: '16px', 
                   border: 'none', 
                   boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                   fontSize: '11px',
                   fontWeight: '700',
                   backgroundColor: 'var(--color-sidebar-bg)',
                   color: 'white',
                   padding: '10px 14px'
                }} 
                itemStyle={{ color: '#f0e3ec' }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ 
                  paddingTop: '30px', 
                  fontSize: '9px',
                  fontWeight: '800',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}
