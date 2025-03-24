import React from 'react';

interface RevenueData {
    month: string;
    amount: number;
}

interface RevenueChartProps {
    data?: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data = [
    { month: 'Jan', amount: 15000 },
    { month: 'Feb', amount: 18000 },
    { month: 'Mar', amount: 22000 },
    { month: 'Apr', amount: 25500 },
] }) => {
    return (
        <div className="h-48 bg-gray-50 rounded-lg p-4">
            {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.month}</span>
                    <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

export default RevenueChart; 