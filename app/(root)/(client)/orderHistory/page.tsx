'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Package, ArrowRight, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { decodeJWT } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Order {
    id: string;
    orderCode: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total: number;
    createdAt: string;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        imageUrl?: string;
    }[];
    deliveryAddress: string;
    deliveryMethod: 'standard' | 'express';
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'status';
type StatusFilter = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

const OrderHistoryPage = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setError('Please login to view your orders');
                    setLoading(false);
                    return;
                }

                const decodedToken = decodeJWT(accessToken);
                if (!decodedToken?.id) {
                    setError('Invalid authentication');
                    setLoading(false);
                    return;
                }

                // TODO: Replace with actual API call
                // const response = await fetch(`/api/orders?userId=${decodedToken.id}`);
                // const data = await response.json();

                // Mock data for now
                const mockOrders: Order[] = [
                    {
                        id: '1',
                        orderCode: 'ORD-2024-001',
                        status: 'completed',
                        total: 500000,
                        createdAt: '2024-03-20T10:00:00Z',
                        items: [
                            {
                                id: '1',
                                name: 'Chocolate Cake',
                                quantity: 1,
                                price: 300000,
                                imageUrl: '/imagecake3.jpg'
                            },
                            {
                                id: '2',
                                name: 'Vanilla Cupcake',
                                quantity: 2,
                                price: 100000,
                                imageUrl: '/imagecake.jpg'
                            }
                        ],
                        deliveryAddress: '123 Main St, District 1, Ho Chi Minh City',
                        deliveryMethod: 'standard'
                    },
                    {
                        id: '2',
                        orderCode: 'ORD-2024-002',
                        status: 'processing',
                        total: 750000,
                        createdAt: '2024-03-25T15:30:00Z',
                        items: [
                            {
                                id: '3',
                                name: 'Strawberry Cake',
                                quantity: 1,
                                price: 500000,
                                imageUrl: '/imagecake1.jpeg'
                            },
                            {
                                id: '4',
                                name: 'Red Velvet Cupcake',
                                quantity: 5,
                                price: 250000,
                                imageUrl: '/imagecake2.jpeg'
                            }
                        ],
                        deliveryAddress: '456 Le Loi St, District 1, Ho Chi Minh City',
                        deliveryMethod: 'express'
                    }
                ];

                setOrders(mockOrders);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch orders');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-500';
            case 'processing':
                return 'bg-blue-500/10 text-blue-500';
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-500';
            case 'cancelled':
                return 'bg-red-500/10 text-red-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    const handleViewOrder = (orderId: string) => {
        router.push(`/orderHistory/${orderId}`);
    };

    const sortOrders = (orders: Order[], sortBy: SortOption) => {
        return [...orders].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'highest':
                    return b.total - a.total;
                case 'lowest':
                    return a.total - b.total;
                case 'status':
                    const statusOrder = { 'completed': 0, 'processing': 1, 'pending': 2, 'cancelled': 3 };
                    return statusOrder[a.status] - statusOrder[b.status];
                default:
                    return 0;
            }
        });
    };

    const filterOrders = (orders: Order[], status: StatusFilter) => {
        if (status === 'all') return orders;
        return orders.filter(order => order.status === status);
    };

    const filteredOrders = filterOrders(orders, statusFilter);
    const sortedOrders = sortOrders(filteredOrders, sortBy);
    const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
    const paginatedOrders = sortedOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-500">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push('/login')}
                        >
                            Đăng nhập
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Lịch sử đơn hàng
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                <Select
                                    value={sortBy}
                                    onValueChange={(value) => {
                                        setSortBy(value as SortOption);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sắp xếp theo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Mới nhất</SelectItem>
                                        <SelectItem value="oldest">Cũ nhất</SelectItem>
                                        <SelectItem value="highest">Giá cao nhất</SelectItem>
                                        <SelectItem value="lowest">Giá thấp nhất</SelectItem>
                                        <SelectItem value="status">Trạng thái</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => {
                                        setStatusFilter(value as StatusFilter);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Lọc theo trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="pending">Đang chờ</SelectItem>
                                        <SelectItem value="processing">Đang xử lý</SelectItem>
                                        <SelectItem value="completed">Đã hoàn thành</SelectItem>
                                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 hover:bg-primary/10"
                            onClick={() => router.push('/cakes')}
                        >
                            <Package className="h-4 w-4" />
                            Mua sắm ngay
                        </Button>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="max-w-2xl mx-auto border-2 border-dashed border-primary/20">
                            <CardContent className="p-8 text-center">
                                <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-4">
                                    <Package className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-2">Chưa có đơn hàng</h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Bạn chưa đặt đơn hàng nào. Hãy bắt đầu mua sắm để xem đơn hàng của bạn tại đây.
                                </p>
                                <Button
                                    size="lg"
                                    className="gap-2"
                                    onClick={() => router.push('/cakes')}
                                >
                                    Bắt đầu mua sắm
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {paginatedOrders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.01 }}
                                    className="cursor-pointer"
                                    onClick={() => handleViewOrder(order.id)}
                                >
                                    <Card className="overflow-hidden border-2 hover:border-primary/20 transition-colors">
                                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent p-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-xl font-bold mb-2">
                                                        Đơn hàng #{order.orderCode}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Calendar className="h-4 w-4" />
                                                            <span className="text-sm">
                                                                {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            <span className="text-sm">
                                                                {format(new Date(order.createdAt), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`${getStatusColor(order.status)} px-4 py-1.5 rounded-full font-medium`}
                                                >
                                                    {order.status === 'completed' ? 'Đã hoàn thành' :
                                                        order.status === 'processing' ? 'Đang xử lý' :
                                                            order.status === 'pending' ? 'Đang chờ' :
                                                                order.status === 'cancelled' ? 'Đã hủy' : order.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold mb-3 text-lg">Sản phẩm</h4>
                                                    <div className="space-y-3">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                                <div className="h-14 w-14 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                                                                    {item.imageUrl ? (
                                                                        <img
                                                                            src={item.imageUrl}
                                                                            alt={item.name}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{item.name}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {item.quantity} x {formatVND(item.price)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-3 text-lg">Thông tin giao hàng</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="bg-primary/10 p-2 rounded-full">
                                                                <MapPin className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm">{order.deliveryAddress}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="bg-primary/10 p-2 rounded-full">
                                                                <Package className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm">
                                                                {order.deliveryMethod === 'express' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator className="my-6" />
                                            <div className="flex justify-between items-center">
                                                <div className="text-xl font-bold text-primary">
                                                    Tổng tiền: {formatVND(order.total)}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="flex items-center gap-2 hover:bg-primary/10"
                                                >
                                                    Xem chi tiết
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex justify-center items-center gap-2 mt-8"
                            >
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="hover:bg-primary/10"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => handlePageChange(page)}
                                        className={`${currentPage === page
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-primary/10'
                                            }`}
                                    >
                                        {page}
                                    </Button>
                                ))}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="hover:bg-primary/10"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default OrderHistoryPage;
