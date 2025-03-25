'use client'
import CategoryChart from '@/components/dashboard-components/CategoryChart';
import CustomerChart from '@/components/dashboard-components/CustomerChart';
import StatisticCard from '@/components/dashboard-components/StatisticCard';
import StockStatus from '@/components/dashboard-components/StockStatus';
import TransactionList from '@/components/dashboard-components/TransactionList';
import { BellIcon, Search } from 'lucide-react';
import React, { useState } from 'react';
import SalesTrendChart from '@/components/dashboard-components/SalesTrendChart';
import ProductPerformanceChart from '@/components/dashboard-components/ProductPerformanceChart';
import { DashboardOverview } from '@/components/dashboard-components/DashboardOverview';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

interface DashboardProps {
    bakeryName: string;
}

const BakeryDashboard: React.FC<DashboardProps> = ({ bakeryName }) => {
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

    const staticData = {
        revenue: {
            value: "$25,500",
            percentage: 12.5,
            chartData: [
                { month: 'Jan', amount: 15000 },
                { month: 'Feb', amount: 18000 },
                { month: 'Mar', amount: 22000 },
                { month: 'Apr', amount: 25500 },
            ]
        },
        customers: {
            value: "1,234",
            percentage: 8.3,
            chartData: [
                { month: 'Jan', count: 900 },
                { month: 'Feb', count: 1050 },
                { month: 'Mar', count: 1150 },
                { month: 'Apr', count: 1234 },
            ]
        },
        income: {
            value: "$18,200",
            percentage: 15.2
        },
        expense: {
            value: "$7,300",
            percentage: -5.8
        },
        categories: {
            data: [
                { name: 'Bread', sales: 450 },
                { name: 'Pastries', sales: 300 },
                { name: 'Cakes', sales: 200 },
                { name: 'Cookies', sales: 150 }
            ]
        },
        stock: {
            items: [
                { name: 'Sourdough Bread', status: 'In Stock', quantity: 45 },
                { name: 'Croissants', status: 'Low Stock', quantity: 8 },
                { name: 'Baguettes', status: 'Out of Stock', quantity: 0 },
                { name: 'Chocolate Cake', status: 'In Stock', quantity: 12 }
            ]
        },
        transactions: [
            { id: 1, customer: 'John Doe', amount: 58.50, date: '2024-03-20', items: ['Sourdough Bread', 'Croissants'] },
            { id: 2, customer: 'Jane Smith', amount: 125.00, date: '2024-03-20', items: ['Birthday Cake', 'Cookies'] },
            { id: 3, customer: 'Mike Johnson', amount: 42.75, date: '2024-03-19', items: ['Baguette', 'Danish Pastry'] }
        ]
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/imagecake.jpg"
                            alt="Bakery Logo"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <h2 className="text-lg font-semibold">{bakeryName}</h2>
                    </div>

                    {/* Search and Navigation */}
                    <div className="ml-auto flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="w-[200px] pl-8"
                            />
                        </div>
                        <button className="p-2 rounded-full hover:bg-accent">
                            <BellIcon className="h-5 w-5" />
                        </button>
                        <Avatar>
                            <AvatarImage src="/avatar.png" alt="User" />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* Dashboard Overview Section */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="reports">Reports</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            {/* Metrics Overview */}
                            <DashboardOverview />

                            {/* Charts Section */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Revenue Trend</CardTitle>
                                        <CardDescription>Monthly revenue performance</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <SalesTrendChart />
                                    </CardContent>
                                </Card>

                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Product Performance</CardTitle>
                                        <CardDescription>Top selling products</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ProductPerformanceChart />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Category and Customer Analysis */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Category Distribution</CardTitle>
                                        <CardDescription>Sales by category</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <CategoryChart data={staticData.categories.data} />
                                    </CardContent>
                                </Card>

                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Customer Growth</CardTitle>
                                        <CardDescription>Monthly customer acquisition</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <CustomerChart />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Stock and Transactions */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Inventory Status</CardTitle>
                                        <CardDescription>Current stock levels</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <StockStatus />
                                    </CardContent>
                                </Card>

                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Recent Transactions</CardTitle>
                                        <CardDescription>Latest orders and sales</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <TransactionList />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Additional Metrics */}
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                <StatisticCard
                                    title="Monthly Revenue"
                                    value={staticData.revenue.value}
                                    percentage={staticData.revenue.percentage}
                                    timeframe={timeframe}
                                />
                                <StatisticCard
                                    title="Total Customers"
                                    value={staticData.customers.value}
                                    percentage={staticData.customers.percentage}
                                    timeframe={timeframe}
                                />
                                <StatisticCard
                                    title="Net Income"
                                    value={staticData.income.value}
                                    percentage={staticData.income.percentage}
                                    timeframe={timeframe}
                                />
                                <StatisticCard
                                    title="Expenses"
                                    value={staticData.expense.value}
                                    percentage={staticData.expense.percentage}
                                    timeframe={timeframe}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-4">
                            {/* Add Analytics Content */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Analytics</CardTitle>
                                    <CardDescription>Coming soon...</CardDescription>
                                </CardHeader>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reports" className="space-y-4">
                            {/* Add Reports Content */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reports</CardTitle>
                                    <CardDescription>Coming soon...</CardDescription>
                                </CardHeader>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default BakeryDashboard; 