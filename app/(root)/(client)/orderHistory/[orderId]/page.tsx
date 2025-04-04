'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Package, ArrowLeft, CreditCard, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { decodeJWT } from '@/lib/utils';
import Image from 'next/image';

interface Order {
    id: string;
    orderCode: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    createdAt: string;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        imageUrl?: string;
        note?: string;
    }[];
    deliveryAddress: string;
    deliveryMethod: 'standard' | 'express';
    paymentMethod: string;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
}

const OrderDetailsPage = ({ params }: { params: { orderId: string } }) => {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setError('Vui lòng đăng nhập để xem chi tiết đơn hàng');
                    setLoading(false);
                    return;
                }

                const decodedToken = decodeJWT(accessToken);
                if (!decodedToken?.id) {
                    setError('Xác thực không hợp lệ');
                    setLoading(false);
                    return;
                }

                // TODO: Replace with actual API call
                // const response = await fetch(`/api/orders/${params.orderId}`);
                // const data = await response.json();

                // Mock data for now
                const mockOrder: Order = {
                    id: params.orderId,
                    orderCode: 'ORD-2024-001',
                    status: 'completed',
                    total: 500000,
                    subtotal: 450000,
                    tax: 36000,
                    deliveryFee: 14000,
                    createdAt: '2024-03-20T10:00:00Z',
                    items: [
                        {
                            id: '1',
                            name: 'Bánh Sô-cô-la',
                            quantity: 1,
                            price: 300000,
                            imageUrl: '/imagecake2.jpeg',
                            note: 'Lời chúc mừng sinh nhật'
                        },
                        {
                            id: '2',
                            name: 'Bánh Cupcake Vani',
                            quantity: 2,
                            price: 100000,
                            imageUrl: '/imagecake1.jpeg'
                        }
                    ],
                    deliveryAddress: '123 Đường Chính, Quận 1, Thành phố Hồ Chí Minh',
                    deliveryMethod: 'standard',
                    paymentMethod: 'Thẻ tín dụng',
                    customerInfo: {
                        name: 'Nguyễn Văn A',
                        email: 'nguyenvana@example.com',
                        phone: '+84 123 456 789'
                    }
                };

                setOrder(mockOrder);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch order details');
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.orderId]);

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

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push('/orderHistory')}
                        >
                            Quay lại danh sách đơn hàng
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
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/orderHistory')}
                        className="hover:bg-primary/10 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Chi tiết đơn hàng
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Order Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl font-bold">Đơn hàng #{order.orderCode}</CardTitle>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                            </span>
                                            <Clock className="h-4 w-4 text-primary ml-2" />
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(order.createdAt), 'hh:mm a')}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge className={`${getStatusColor(order.status)} px-4 py-1 rounded-full font-medium`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Sản phẩm đã đặt</h3>
                                        <div className="space-y-4">
                                            {order.items.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                                                    whileHover={{ scale: 1.01 }}
                                                >
                                                    <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                                                        {item.imageUrl ? (
                                                            <Image
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                                                                <Package className="h-8 w-8 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-lg">{item.name}</h4>
                                                        {item.note && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Ghi chú: {item.note}
                                                            </p>
                                                        )}
                                                        <div className="flex justify-between items-center mt-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.quantity} x {formatVND(item.price)}
                                                            </p>
                                                            <p className="font-medium text-primary">
                                                                {formatVND(item.price * item.quantity)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Tổng đơn hàng</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Tạm tính</span>
                                                <span>{formatVND(order.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Thuế (8%)</span>
                                                <span>{formatVND(order.tax)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {order.deliveryMethod === 'express' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn'}
                                                </span>
                                                <span>{formatVND(order.deliveryFee)}</span>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Tổng cộng</span>
                                                <span className="text-primary">{formatVND(order.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer and Delivery Information */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="p-6">
                                <CardTitle className="text-lg font-bold">Thông tin khách hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-muted-foreground">Họ tên:</span>
                                        <span className="font-medium">{order.customerInfo.name}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{order.customerInfo.email}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-muted-foreground">Số điện thoại:</span>
                                        <span className="font-medium">{order.customerInfo.phone}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="p-6">
                                <CardTitle className="text-lg font-bold">Thông tin giao hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <p className="text-sm">{order.deliveryAddress}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Truck className="h-5 w-5 text-primary" />
                                        <p className="text-sm">
                                            {order.deliveryMethod === 'express' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="p-6">
                                <CardTitle className="text-lg font-bold">Thông tin thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <p className="text-sm font-medium">{order.paymentMethod}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderDetailsPage; 