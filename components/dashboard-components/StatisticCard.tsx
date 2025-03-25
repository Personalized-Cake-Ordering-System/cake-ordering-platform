import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatisticCardProps {
    title: string;
    value: string;
    percentage: number;
    timeframe: 'daily' | 'weekly' | 'monthly';
    children?: ReactNode;
    onTimeframeChange?: (value: string) => void;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
    title,
    value,
    percentage,
    timeframe,
    children,
    onTimeframeChange
}) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Select defaultValue={timeframe} onValueChange={onTimeframeChange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className={`text-sm ${percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {percentage >= 0 ? '+' : ''}{percentage}%
                    </div>
                </div>
                <div className="mt-4">
                    {children}
                </div>
            </CardContent>
        </Card>
    );
};

export default StatisticCard; 