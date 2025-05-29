'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Package, ArrowRight, ChevronLeft, ChevronRight, ArrowUpDown, Truck, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { decodeJWT, cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Order status constants
const OrderStatus = {
    WAITING_BAKERY_CONFIRM: 1,
    PROCESSING: 2,
    SHIPPING: 3,
    SHIPPING_COMPLETED: 4,
    COMPLETED: 5,
    PICKUP: 3,
    READY_FOR_PICKUP: 3,
    REPORT_PENDING: -2,
    FAULTY: -3,
    CANCELED: -1,
    PENDING: 0,
};

interface Order {
    id: string;
    order_code: string;
    order_status: string;
    total_customer_paid: number;
    created_at: string;
    shipping_address: string;
    shipping_type: string;
    shipping_fee: number;
    total_product_price: number;
    bakery: {
        bakery_name: string;
        address: string;
    };
    paid_at: string | null;
    pickup_time: string;
    payment_type: string;
    canceled_reason?: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'status';
type StatusFilter = 'all' | 'PENDING' | 'WAITING_BAKERY_CONFIRM' | 'PROCESSING' | 'SHIPPING' | 'SHIPPING_COMPLETED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELED' | 'REPORT_PENDING' | 'FAULTY';

const OrderHistoryPage = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const itemsPerPage = 1000;

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

                const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/customers/${decodedToken.id}/orders?pageIndex=${currentPage - 1}&pageSize=${itemsPerPage}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'accept': '*/*'
                    }
                });
                const data = await response.json();

                if (data.status_code === 200) {
                    setOrders(data.payload);
                } else {
                    setError('Failed to fetch orders');
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch orders');
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentPage]);

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500/10 dark:bg-green-500/20 text-green-500 dark:text-green-400';
            case 'PROCESSING':
                return 'bg-custom-teal/10 dark:bg-custom-teal/20 text-custom-teal dark:text-custom-teal/90';
            case 'WAITING_BAKERY_CONFIRM':
                return 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-500 dark:text-yellow-400';
            case 'PENDING':
                return 'bg-blue-400/10 dark:bg-blue-400/20 text-blue-500 dark:text-blue-400';
            case 'SHIPPING':
            case 'READY_FOR_PICKUP':
                return 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400';
            case 'SHIPPING_COMPLETED':
                return 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400';
            case 'CANCELED':
                return 'bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400';
            case 'REPORT_PENDING':
                return 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400';
            case 'FAULTY':
                return 'bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400';
            default:
                return 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400';
        }
    };

    const getStatusText = (status: string, shippingType?: string) => {
        const isPickup = shippingType?.toUpperCase() === 'PICKUP';

        switch (status) {
            case 'COMPLETED':
                return 'Đã hoàn thành';
            case 'SHIPPING':
                return isPickup ? 'Lấy tại cửa hàng' : 'Đang giao hàng';
            case 'SHIPPING_COMPLETED':
                return 'Giao hàng hoàn tất';
            case 'READY_FOR_PICKUP':
                return 'Sẵn sàng nhận hàng';
            case 'PENDING':
                return 'Chưa thanh toán';
            case 'WAITING_BAKERY_CONFIRM':
                return 'Chờ xác nhận';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'CANCELED':
                return 'Đã hủy';
            case 'REPORT_PENDING':
                return 'Đang xử lý khiếu nại';
            case 'FAULTY':
                return 'Đơn hàng lỗi';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CANCELED':
                return <AlertTriangle className="h-4 w-4 mr-1" />;
            case 'SHIPPING':
            case 'SHIPPING_COMPLETED':
                return <Truck className="h-4 w-4 mr-1" />;
            case 'READY_FOR_PICKUP':
                return <MapPin className="h-4 w-4 mr-1" />;
            default:
                return null;
        }
    };

    const handleViewOrder = (orderId: string) => {
        router.push(`/orderHistory/${orderId}`);
    };

    const sortOrders = (orders: Order[], sortBy: SortOption) => {
        return [...orders].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'highest':
                    return b.total_customer_paid - a.total_customer_paid;
                case 'lowest':
                    return a.total_customer_paid - b.total_customer_paid;
                case 'status':
                    const statusOrder = (status: string) => {
                        return OrderStatus[status as keyof typeof OrderStatus] || 999;
                    };
                    return statusOrder(a.order_status) - statusOrder(b.order_status);
                default:
                    return 0;
            }
        });
    };

    const filterOrders = (orders: Order[], status: StatusFilter) => {
        if (status === 'all') return orders;
        return orders.filter(order => order.order_status === status);
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
                            onClick={() => router.push('/sign-in')}
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
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Lịch sử đơn hàng
                        </h1>
                        <p className="text-muted-foreground mt-2">Xem và quản lý đơn hàng của bạn</p>
                    </div>
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
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Lọc theo trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="PENDING">Chưa thanh toán</SelectItem>
                                        <SelectItem value="WAITING_BAKERY_CONFIRM">Chờ xác nhận</SelectItem>
                                        <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                        <SelectItem value="SHIPPING">Đang giao hàng</SelectItem>
                                        <SelectItem value="READY_FOR_PICKUP">Sẵn sàng nhận hàng</SelectItem>
                                        <SelectItem value="SHIPPING_COMPLETED">Giao hàng hoàn tất</SelectItem>
                                        <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                                        <SelectItem value="CANCELED">Đã hủy</SelectItem>
                                        <SelectItem value="REPORT_PENDING">Đang xử lý khiếu nại</SelectItem>
                                        <SelectItem value="FAULTY">Đơn hàng lỗi</SelectItem>
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
                                                        Đơn hàng #{order.order_code}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Calendar className="h-4 w-4" />
                                                            <span className="text-sm">
                                                                {format(new Date(order.created_at), 'dd/MM/yyyy')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            <span className="text-sm">
                                                                {format(new Date(order.created_at), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-full font-medium flex items-center",
                                                        getStatusColor(order.order_status)
                                                    )}
                                                >
                                                    {getStatusIcon(order.order_status)}
                                                    {getStatusText(order.order_status, order.shipping_type)}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold mb-3 text-lg">Thông tin đơn hàng</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="bg-primary/10 p-2 rounded-full">
                                                                <Package className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Tổng tiền sản phẩm</p>
                                                                <p className="text-sm text-muted-foreground">{formatVND(order.total_product_price)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="bg-primary/10 p-2 rounded-full">
                                                                <Truck className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Phí vận chuyển</p>
                                                                <p className="text-sm text-muted-foreground">{formatVND(order.shipping_fee)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="bg-primary/10 p-2 rounded-full">
                                                                <Package className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Tổng thanh toán</p>
                                                                <p className="text-sm text-muted-foreground">{formatVND(order.total_customer_paid)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-3 text-lg">Thông tin giao hàng</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="bg-primary/10 p-2 rounded-full">
                                                                <MapPin className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm">{order.shipping_address || 'Nhận tại cửa hàng'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="bg-primary/10 p-2 rounded-full">
                                                                <Package className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm">
                                                                {order.shipping_type === 'DELIVERY' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng'}
                                                            </p>
                                                        </div>
                                                        {/* <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="bg-primary/10 p-2 rounded-full">
                                                                <Calendar className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm">
                                                                Thời gian nhận: {format(new Date(order.pickup_time) , 'dd/MM/yyyy')}
                                                            </p>
                                                        </div> */}
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator className="my-6" />
                                            <div className="flex justify-between items-center">
                                                <div className="text-xl font-bold text-primary">
                                                    Tổng tiền: {formatVND(order.total_customer_paid)}
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
