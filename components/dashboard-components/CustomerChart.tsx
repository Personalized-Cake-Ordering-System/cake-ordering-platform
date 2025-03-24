import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CustomerData {
    month: string;
    count: number;
}

interface CustomerChartProps {
    data?: CustomerData[];
}

const CustomerChart: React.FC<CustomerChartProps> = ({ data = [
    { month: 'Jan', count: 2100 },
    { month: 'Feb', count: 2400 },
    { month: 'Mar', count: 2800 },
    { month: 'Apr', count: 2600 },
    { month: 'May', count: 3100 },
    { month: 'Jun', count: 3400 },
    { month: 'Jul', count: 3200 },
    { month: 'Aug', count: 3800 },
    { month: 'Sep', count: 4100 },
    { month: 'Oct', count: 4300 },
    { month: 'Nov', count: 4500 },
    { month: 'Dec', count: 4800 },
] }) => {
    return (
        <div className="h-96 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-700 dark:text-gray-200 font-medium text-lg mb-6">Customer Growth</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <XAxis
                        dataKey="month"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8' }}
                        tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--tooltip-bg, white)',
                            color: 'var(--tooltip-text, black)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.15)',
                        }}
                        cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                    />
                    <Bar
                        dataKey="count"
                        fill="url(#colorGradient)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={50}
                    />
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
            <style jsx global>{`
                :root {
                    --tooltip-bg: white;
                    --tooltip-text: black;
                }
                
                @media (prefers-color-scheme: dark) {
                    :root {
                        --tooltip-bg: #1f2937;
                        --tooltip-text: white;
                    }
                }
            `}</style>
        </div>
    );
};

export default CustomerChart; 