import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface ProductData {
    name: string;
    sales: number;
    returns: number;
}

const data: ProductData[] = [
    { name: 'Croissants', sales: 590, returns: 12 },
    { name: 'Baguettes', sales: 868, returns: 15 },
    { name: 'Cakes', sales: 1397, returns: 20 },
    { name: 'Cookies', sales: 1480, returns: 18 },
    { name: 'Muffins', sales: 1520, returns: 22 },
    { name: 'Bread', sales: 1400, returns: 10 },
];

const ProductPerformanceChart = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="sales"
                                fill="#8884d8"
                                name="Sales"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="returns"
                                fill="#82ca9d"
                                name="Returns"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductPerformanceChart; 