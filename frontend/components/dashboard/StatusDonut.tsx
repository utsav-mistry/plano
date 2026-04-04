'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';

const data = [
  { name: 'Active', value: 248 },
  { name: 'Draft', value: 28 },
  { name: 'Confirmed', value: 14 },
  { name: 'Closed', value: 22 },
];

const COLORS = ['#22c55e', '#a8a39c', '#3b82f6', '#ef4444'];

export default function StatusDonut() {
  return (
    <div className="bg-bg-surface p-6 rounded-card border border-border shadow-sm h-full">
       <div className="mb-4">
          <h3 className="text-xl font-serif font-bold text-text-primary">Subscription Status</h3>
       </div>

       <div className="h-64 relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-3xl font-serif font-bold text-text-primary">312</span>
             <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-widest">total subs</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e4e0db', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }} 
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ 
                  paddingTop: '20px', 
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#635d57',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}
