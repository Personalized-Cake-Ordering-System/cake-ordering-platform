import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Updated data with weekly and monthly entries
const data = [
    // January
    {
        revenue: 2400,
        orders: 35,
        customers: 30,
        date: "2024-01-07",
        week: "Week 1"
    },
    {
        revenue: 2600,
        orders: 38,
        customers: 32,
        date: "2024-01-14",
        week: "Week 2"
    },
    {
        revenue: 2500,
        orders: 36,
        customers: 31,
        date: "2024-01-21",
        week: "Week 3"
    },
    {
        revenue: 2740,
        orders: 36,
        customers: 32,
        date: "2024-01-28",
        week: "Week 4"
    },
    // February
    {
        revenue: 2800,
        orders: 40,
        customers: 35,
        date: "2024-02-04",
        week: "Week 1"
    },
    {
        revenue: 3100,
        orders: 42,
        customers: 36,
        date: "2024-02-11",
        week: "Week 2"
    },
    {
        revenue: 3200,
        orders: 43,
        customers: 35,
        date: "2024-02-18",
        week: "Week 3"
    },
    {
        revenue: 3380,
        orders: 43,
        customers: 36,
        date: "2024-02-25",
        week: "Week 4"
    },
    // March
    {
        revenue: 3500,
        orders: 45,
        customers: 38,
        date: "2024-03-03",
        week: "Week 1"
    },
    {
        revenue: 3600,
        orders: 46,
        customers: 39,
        date: "2024-03-10",
        week: "Week 2"
    },
    {
        revenue: 3700,
        orders: 47,
        customers: 40,
        date: "2024-03-17",
        week: "Week 3"
    },
    {
        revenue: 3800,
        orders: 48,
        customers: 41,
        date: "2024-03-24",
        week: "Week 4"
    },
    // April
    {
        revenue: 3900,
        orders: 49,
        customers: 42,
        date: "2024-04-01",
        week: "Week 1"
    },
    {
        revenue: 4000,
        orders: 50,
        customers: 43,
        date: "2024-04-08",
        week: "Week 2"
    },
    {
        revenue: 4100,
        orders: 51,
        customers: 44,
        date: "2024-04-15",
        week: "Week 3"
    },
    {
        revenue: 4200,
        orders: 52,
        customers: 45,
        date: "2024-04-22",
        week: "Week 4"
    },
    // May
    {
        revenue: 4300,
        orders: 53,
        customers: 46,
        date: "2024-05-01",
        week: "Week 1"
    },
    {
        revenue: 4400,
        orders: 54,
        customers: 47,
        date: "2024-05-08",
        week: "Week 2"
    },
    {
        revenue: 4500,
        orders: 55,
        customers: 48,
        date: "2024-05-15",
        week: "Week 3"
    },
    {
        revenue: 4600,
        orders: 56,
        customers: 49,
        date: "2024-05-22",
        week: "Week 4"
    },
    // June
    {
        revenue: 4700,
        orders: 57,
        customers: 50,
        date: "2024-06-01",
        week: "Week 1"
    },
    {
        revenue: 4800,
        orders: 58,
        customers: 51,
        date: "2024-06-08",
        week: "Week 2"
    },
    {
        revenue: 4900,
        orders: 59,
        customers: 52,
        date: "2024-06-15",
        week: "Week 3"
    },
    {
        revenue: 5000,
        orders: 60,
        customers: 53,
        date: "2024-06-22",
        week: "Week 4"
    },
    // July
    {
        revenue: 5100,
        orders: 61,
        customers: 54,
        date: "2024-07-01",
        week: "Week 1"
    },
    {
        revenue: 5200,
        orders: 62,
        customers: 55,
        date: "2024-07-08",
        week: "Week 2"
    },
    {
        revenue: 5300,
        orders: 63,
        customers: 56,
        date: "2024-07-15",
        week: "Week 3"
    },
    {
        revenue: 5400,
        orders: 64,
        customers: 57,
        date: "2024-07-22",
        week: "Week 4"
    },
    // August
    {
        revenue: 5500,
        orders: 65,
        customers: 58,
        date: "2024-08-01",
        week: "Week 1"
    },
    {
        revenue: 5600,
        orders: 66,
        customers: 59,
        date: "2024-08-08",
        week: "Week 2"
    },
    {
        revenue: 5700,
        orders: 67,
        customers: 60,
        date: "2024-08-15",
        week: "Week 3"
    },
    {
        revenue: 5800,
        orders: 68,
        customers: 61,
        date: "2024-08-22",
        week: "Week 4"
    },
    // September
    {
        revenue: 5900,
        orders: 69,
        customers: 62,
        date: "2024-09-01",
        week: "Week 1"
    },
    {
        revenue: 6000,
        orders: 70,
        customers: 63,
        date: "2024-09-08",
        week: "Week 2"
    },
    {
        revenue: 6100,
        orders: 71,
        customers: 64,
        date: "2024-09-15",
        week: "Week 3"
    },
    {
        revenue: 6200,
        orders: 72,
        customers: 65,
        date: "2024-09-22",
        week: "Week 4"
    },
    // October
    {
        revenue: 6300,
        orders: 73,
        customers: 66,
        date: "2024-10-01",
        week: "Week 1"
    },
    {
        revenue: 6400,
        orders: 74,
        customers: 67,
        date: "2024-10-08",
        week: "Week 2"
    },
    {
        revenue: 6500,
        orders: 75,
        customers: 68,
        date: "2024-10-15",
        week: "Week 3"
    },
    {
        revenue: 6600,
        orders: 76,
        customers: 69,
        date: "2024-10-22",
        week: "Week 4"
    },
    // November
    {
        revenue: 6700,
        orders: 77,
        customers: 70,
        date: "2024-11-01",
        week: "Week 1"
    },
    {
        revenue: 6800,
        orders: 78,
        customers: 71,
        date: "2024-11-08",
        week: "Week 2"
    },
    {
        revenue: 6900,
        orders: 79,
        customers: 72,
        date: "2024-11-15",
        week: "Week 3"
    },
    {
        revenue: 7000,
        orders: 80,
        customers: 73,
        date: "2024-11-22",
        week: "Week 4"
    },
    // December
    {
        revenue: 7100,
        orders: 81,
        customers: 74,
        date: "2024-12-01",
        week: "Week 1"
    },
    {
        revenue: 7200,
        orders: 82,
        customers: 75,
        date: "2024-12-08",
        week: "Week 2"
    },
    {
        revenue: 7300,
        orders: 83,
        customers: 76,
        date: "2024-12-15",
        week: "Week 3"
    },
    {
        revenue: 7400,
        orders: 84,
        customers: 77,
        date: "2024-12-22",
        week: "Week 4"
    },
];

export default function SalesTrendChart() {
    const [timeRange, setTimeRange] = React.useState('month');
    const [metric, setMetric] = React.useState('revenue');

    const getFilteredData = () => {
        const now = new Date();
        const filtered = data.filter(item => {
            const itemDate = new Date(item.date);
            if (timeRange === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return itemDate >= weekAgo;
            } else if (timeRange === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                return itemDate >= monthAgo;
            }
            return true;
        });

        // If viewing yearly data, aggregate by month
        if (timeRange === 'year') {
            const monthlyData = filtered.reduce((acc, curr) => {
                const date = new Date(curr.date);
                const monthYear = date.toISOString().substring(0, 7);

                if (!acc[monthYear]) {
                    acc[monthYear] = {
                        revenue: 0,
                        orders: 0,
                        customers: 0,
                        date: new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0],
                        week: ""
                    };
                }
                acc[monthYear].revenue += curr.revenue;
                acc[monthYear].orders += curr.orders;
                acc[monthYear].customers += curr.customers;
                return acc;
            }, {} as Record<string, typeof data[0]>);

            return Object.values(monthlyData).sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        }

        return filtered.sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    return (
        <Card className="col-span-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Your sales performance over time</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-2 py-1 border rounded-md"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                        </select>
                        <select
                            className="px-2 py-1 border rounded-md"
                            value={metric}
                            onChange={(e) => setMetric(e.target.value)}
                        >
                            <option value="revenue">Revenue</option>
                            <option value="orders">Orders</option>
                            <option value="customers">Customers</option>
                        </select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getFilteredData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => {
                                            const d = new Date(date);
                                            if (timeRange === 'week') {
                                                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            } else if (timeRange === 'month') {
                                                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            }
                                            return d.toLocaleDateString('en-US', { month: 'short' });
                                        }}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => metric === 'revenue' ? `$${value}` : value}
                                        labelFormatter={(date) => {
                                            const d = new Date(date);
                                            if (timeRange === 'week' || timeRange === 'month') {
                                                return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                            }
                                            return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        strokeWidth={2}
                                        dataKey={metric}
                                        name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                                        style={
                                            {
                                                stroke: "hsl(var(--primary))",
                                            } as React.CSSProperties
                                        }
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 