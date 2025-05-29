'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, CardStackIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, ReloadIcon } from '@radix-ui/react-icons';

interface Transaction {
    id: string;
    amount: number;
    transaction_type: string;
    created_at: string;
}

interface WalletData {
    balance: number;
    transactions: Transaction[];
    totalPages: number;
    currentPage: number;
}

// Transaction type color mapping
const transactionTypeColors = {
    PENDING_PAYMENT: 'text-yellow-600 dark:text-yellow-400',
    SHOP_REVENUE_TRANSFER: 'text-blue-600 dark:text-blue-400',
    ADMIN_TO_BAKERY_TRANSFER: 'text-purple-600 dark:text-purple-400',
    ROLL_BACK: 'text-orange-600 dark:text-orange-400',
    WITHDRAWAL: 'text-red-600 dark:text-red-400',
    TRANSFER: 'text-indigo-600 dark:text-indigo-400',
    REFUND: 'text-emerald-600 dark:text-emerald-400',
    DEPOSIT: 'text-green-600 dark:text-green-400',
    PAYMENT: 'text-red-600 dark:text-red-400',
};

const transactionTypeBackgrounds = {
    PENDING_PAYMENT: 'bg-yellow-100 dark:bg-yellow-500/20',
    SHOP_REVENUE_TRANSFER: 'bg-blue-100 dark:bg-blue-500/20',
    ADMIN_TO_BAKERY_TRANSFER: 'bg-purple-100 dark:bg-purple-500/20',
    ROLL_BACK: 'bg-orange-100 dark:bg-orange-500/20',
    WITHDRAWAL: 'bg-red-100 dark:bg-red-500/20',
    TRANSFER: 'bg-indigo-100 dark:bg-indigo-500/20',
    REFUND: 'bg-emerald-100 dark:bg-emerald-500/20',
    DEPOSIT: 'bg-green-100 dark:bg-green-500/20',
    PAYMENT: 'bg-red-100 dark:bg-red-500/20',
};

// Helper function to format VND currency
const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Helper function to format date in Vietnamese
const formatVietnameseDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

export default function WalletPage() {
    const router = useRouter();
    const [walletData, setWalletData] = useState<WalletData>({
        balance: 0,
        transactions: [],
        totalPages: 0,
        currentPage: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const fetchWalletData = useCallback(async (page: number) => {
        try {
            setIsLoading(true);
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                router.push('/sign-in');
                return;
            }

            const walletId = localStorage.getItem('walletId');
            console.log("Wallet ID:", walletId);

            // First fetch the wallet balance
            const balanceResponse = await fetch(
                `https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/wallets/${walletId}/transactions`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'accept': '*/*',
                    },
                }
            );
            const balanceData = await balanceResponse.json();
            console.log("Balance API Response:", balanceData);
            const balance = balanceData.status_code === 200 ? balanceData.payload?.balance || 0 : 0;

            // Then fetch transactions
            const response = await fetch(
                `https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/wallets/${walletId}/transactions?pageIndex=${page}&pageSize=${pageSize}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'accept': '*/*',
                    },
                }
            );

            const data = await response.json();
            console.log("Transactions API Response:", data);
            if (data.status_code === 200 && data.payload && data.payload.length > 0) {
                setWalletData({
                    balance: data.payload[0].wallet.balance || 0,
                    transactions: data.payload || [],
                    totalPages: Math.ceil((data.meta_data?.total_items_count || 0) / pageSize),
                    currentPage: page,
                });
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchWalletData(currentPage);
    }, [currentPage, fetchWalletData]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < walletData.totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center flex flex-col items-center"
                >
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-lg font-medium">Đang tải dữ liệu ví...</div>
                </motion.div>
            </div>
        );
    }

    // Translate transaction types
    const translateTransactionType = (type: string) => {
        switch (type) {
            case 'PENDING_PAYMENT':
                return 'Tiền tạm giữ';
            case 'SHOP_REVENUE_TRANSFER':
                return 'Doanh thu cửa hàng';
            case 'ADMIN_TO_BAKERY_TRANSFER':
                return 'Chuyển tiền admin';
            case 'ROLL_BACK':
                return 'Hoàn tiền';
            case 'WITHDRAWAL':
                return 'Rút tiền';
            case 'TRANSFER':
                return 'Chuyển tiền';
            case 'REFUND':
                return 'Hoàn tiền';
            case 'DEPOSIT':
                return 'Nạp tiền';
            case 'PAYMENT':
                return 'Thanh toán';
            default:
                return type;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-4xl bg-gradient-to-b from-background to-background/50 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
                <Card className="relative overflow-hidden backdrop-blur-sm border-2 border-primary/20 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
                    <CardHeader className="relative">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-primary/10">
                                <CardStackIcon className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text dark:text-primary-foreground">
                                Số Dư Ví
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <motion.div
                            className="text-5xl font-bold text-foreground dark:text-primary-foreground tracking-tight"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            {formatVND(walletData.balance)}
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="shadow-xl border-2 border-muted">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-muted">
                                <ClockIcon className="w-6 h-6 text-foreground" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                Lịch Sử Giao Dịch
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {walletData.transactions.length > 0 ? (
                            <>
                                <div className="overflow-x-auto rounded-lg border border-muted">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="font-bold text-foreground">Thời Gian</TableHead>
                                                <TableHead className="font-bold text-foreground">Loại Giao Dịch</TableHead>
                                                <TableHead className="text-right font-bold text-foreground">Số Tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {walletData.transactions.map((transaction, index) => (
                                                <motion.tr
                                                    key={transaction.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    className="group hover:bg-muted/50 transition-colors relative overflow-hidden"
                                                >
                                                    <TableCell className="font-medium text-foreground">
                                                        {formatVietnameseDate(transaction.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-full ${transactionTypeBackgrounds[transaction.transaction_type as keyof typeof transactionTypeBackgrounds] || 'bg-gray-100 dark:bg-gray-500/20'}`}>
                                                                {transaction.transaction_type === 'DEPOSIT' ||
                                                                    transaction.transaction_type === 'SHOP_REVENUE_TRANSFER' ||
                                                                    transaction.transaction_type === 'REFUND' ? (
                                                                    <ArrowUpIcon className={`w-4 h-4 ${transactionTypeColors[transaction.transaction_type as keyof typeof transactionTypeColors]}`} />
                                                                ) : (
                                                                    <ArrowDownIcon className={`w-4 h-4 ${transactionTypeColors[transaction.transaction_type as keyof typeof transactionTypeColors]}`} />
                                                                )}
                                                            </div>
                                                            <span className={`font-medium ${transactionTypeColors[transaction.transaction_type as keyof typeof transactionTypeColors] || 'text-gray-600 dark:text-gray-400'}`}>
                                                                {translateTransactionType(transaction.transaction_type)}
                                                            </span>
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className={`text-right font-bold ${transactionTypeColors[transaction.transaction_type as keyof typeof transactionTypeColors] || 'text-gray-600 dark:text-gray-400'}`}>
                                                        {formatVND(transaction.amount)}
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="mt-4 flex items-center justify-between px-2">
                                    <div className="text-sm text-muted-foreground">
                                        Trang {walletData.currentPage + 1} / {Math.max(1, walletData.totalPages)}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0 || isLoading}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronLeftIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchWalletData(currentPage)}
                                            disabled={isLoading}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ReloadIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= walletData.totalPages - 1 || isLoading}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 px-4"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-4xl">💰</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-foreground">Chưa Có Giao Dịch</h3>
                                <p className="text-muted-foreground">Lịch sử giao dịch của bạn sẽ xuất hiện tại đây</p>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
