import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
    id: number;
    customer: string;
    amount: number;
    date: string;
    items: string[];
    status: 'completed' | 'pending' | 'failed';
}

const TransactionList = () => {
    const transactions: Transaction[] = [
        {
            id: 1,
            customer: "John Doe",
            amount: 58.50,
            date: "2024-03-20",
            items: ["Sourdough Bread", "Croissants"],
            status: "completed"
        },
        {
            id: 2,
            customer: "Jane Smith",
            amount: 75.00,
            date: "2024-03-22",
            items: ["Baguette", "Muffins"],
            status: "pending"
        },
        {
            id: 3,
            customer: "Michael Johnson",
            amount: 120.00,
            date: "2024-03-25",
            items: ["Sourdough Bread", "Cakes"],
            status: "completed"
        },
        {
            id: 4,
            customer: "Emily Davis",
            amount: 40.00,
            date: "2024-03-28",
            items: ["Croissants", "Cookies"],
            status: "failed"
        },
        {
            id: 5,
            customer: "Sarah Taylor",
            amount: 90.00,
            date: "2024-03-29",
            items: ["Baguette", "Cakes"],
            status: "completed"
        },
        {
            id: 6,
            customer: "Kevin White",
            amount: 60.00,
            date: "2024-03-30",
            items: ["Sourdough Bread", "Muffins"],
            status: "pending"
        },
        {
            id: 7,
            customer: "Lisa Brown",
            amount: 100.00,
            date: "2024-03-31",
            items: ["Croissants", "Cookies"],
            status: "completed"
        },
        {
            id: 8,
            customer: "David Lee",
            amount: 50.00,
            date: "2024-04-01",
            items: ["Baguette", "Cakes"],
            status: "failed"
        },
        {
            id: 9,
            customer: "Jessica Martin",
            amount: 80.00,
            date: "2024-04-02",
            items: ["Sourdough Bread", "Muffins"],
            status: "pending"
        },
        {
            id: 10,
            customer: "Brian Hall",
            amount: 110.00,
            date: "2024-04-03",
            items: ["Croissants", "Cookies"],
            status: "completed"
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500';
            case 'failed': return 'bg-red-500/10 text-red-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <span className="font-semibold text-xs">
                                    {transaction.customer.split(' ').map(n => n[0]).join('')}
                                </span>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{transaction.customer}</p>
                                <p className="text-sm text-muted-foreground">
                                    {transaction.items.join(', ')}
                                </p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-sm font-medium">${transaction.amount.toFixed(2)}</p>
                                <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${getStatusColor(transaction.status)}`}>
                                    {transaction.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TransactionList; 