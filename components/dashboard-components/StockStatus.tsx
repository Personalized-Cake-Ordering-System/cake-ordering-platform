import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StockItem {
    name: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    quantity: number;
}

interface StockStatusProps {
    items?: StockItem[];
}

const StockStatus: React.FC<StockStatusProps> = ({ items = [
    { name: 'Sourdough Bread', status: 'In Stock', quantity: 45 },
    { name: 'Croissants', status: 'Low Stock', quantity: 8 },
    { name: 'Baguettes', status: 'Out of Stock', quantity: 0 },
    { name: 'Chocolate Cake', status: 'In Stock', quantity: 12 }
] }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock': return 'bg-green-500/15 text-green-700';
            case 'Low Stock': return 'bg-yellow-500/15 text-yellow-700';
            case 'Out of Stock': return 'bg-red-500/15 text-red-700';
            default: return 'bg-gray-500/15 text-gray-700';
        }
    };

    const getProgressColor = (status: string) => {
        switch (status) {
            case 'In Stock': return 'bg-green-500';
            case 'Low Stock': return 'bg-yellow-500';
            case 'Out of Stock': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="secondary" className={getStatusColor(item.status)}>
                                {item.status}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <Progress
                                value={Math.min((item.quantity / 50) * 100, 100)}
                                className={getProgressColor(item.status)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default StockStatus; 