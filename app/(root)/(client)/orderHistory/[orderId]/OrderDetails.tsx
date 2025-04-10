'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Package, ArrowLeft, CreditCard, Truck, Star } from 'lucide-react';
import { format, parse } from 'date-fns';
import { decodeJWT } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Order {
    id: string;
    order_code: string;
    order_status: string;
    total_customer_paid: number;
    total_product_price: number;
    shipping_fee: number;
    shipping_distance: number;
    shipping_time: number;
    shipping_type: string;
    commission_rate: number;
    app_commission_fee: number;
    shop_revenue: number;
    order_note: string;
    pickup_time: string;
    payment_type: string;
    phone_number: string;
    shipping_address: string;
    latitude: string;
    longitude: string;
    paid_at: string;
    order_details: {
        id: string;
        quantity: number;
        sub_total_price: number;
        cake_note: string;
        available_cake_id: string;
        shop_image_files?: {
            file_url: string;
        };
    }[];
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    bakery: {
        bakery_name: string;
        email: string;
        phone: string;
        address: string;
        id: string;
    };
    transaction?: {
        amount: number;
        gate_way: string;
        transaction_date: string;
        account_number: string;
    };
}

interface OrderDetailsProps {
    orderId: string;
}

interface FeedbackFormProps {
    orderId: string;
    orderDetailId: string;
    availableCakeId: string;
    bakeryId: string;
}

const FeedbackForm = ({ orderId, orderDetailId, availableCakeId, bakeryId }: FeedbackFormProps) => {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Vui lòng đăng nhập để gửi phản hồi');
                return;
            }

            const decodedToken = decodeJWT(accessToken);
            const customerId = decodedToken?.id;
            if (!customerId) {
                toast.error('Xác thực không hợp lệ');
                return;
            }

            let imageId = null;
            if (imageFile) {
                const formData = new FormData();
                formData.append('formFile', imageFile);

                const uploadResponse = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Không thể tải lên hình ảnh');
                }

                const uploadData = await uploadResponse.json();
                imageId = uploadData.payload.id;
            }

            console.log('Feedback Submission Body:', {
                content,
                rating,
                image_id: imageId,
                order_detail_id: orderDetailId,
                available_cake_id: availableCakeId,
                bakery_id: bakeryId
            });

            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/cake_reviews`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    rating,
                    image_id: imageId,
                    order_detail_id: orderDetailId,
                    available_cake_id: availableCakeId,
                    bakery_id: bakeryId
                })
            });

            if (response.ok) {
                toast.success('Phản hồi đã được gửi thành công!');
                router.push('/orderHistory');
            } else {
                throw new Error('Không thể gửi phản hồi');
            }
        } catch (err) {
            toast.error('Không thể gửi phản hồi');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Đánh Giá</label>
                <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setRating(star)}>
                            <Star className={star <= rating ? 'text-yellow-400' : 'text-gray-300'} />
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label>Phản Hồi Của Bạn</label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div>
                <label>Thêm Ảnh (Tùy Chọn)</label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imageFile && (
                    <div className="mt-2">
                        <Image
                            src={URL.createObjectURL(imageFile)}
                            alt="Preview"
                            width={100}
                            height={100}
                            className="object-cover rounded-md"
                        />
                    </div>
                )}
            </div>
            <div className="flex justify-end">
                <Button type="submit">Gửi Phản Hồi</Button>
            </div>
        </form>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <span className="sr-only">Đóng</span>
                    &times;
                </button>
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-primary">Gửi Phản Hồi</h2>
                    <p className="text-sm text-muted-foreground">Chia sẻ trải nghiệm của bạn với chúng tôi</p>
                </div>
                {children}
            </motion.div>
        </div>
    );
};

export default function OrderDetails({ orderId }: OrderDetailsProps) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cakeImages, setCakeImages] = useState<{ [key: string]: string }>({});
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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

                const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }

                const data = await response.json();

                if (data.status_code !== 200) {
                    throw new Error(data.errors?.[0] || 'Failed to fetch order details');
                }

                const orderData = data.payload;
                setOrder({
                    id: orderData.id,
                    order_code: orderData.order_code,
                    order_status: orderData.order_status,
                    total_customer_paid: orderData.total_customer_paid,
                    total_product_price: orderData.total_product_price,
                    shipping_fee: orderData.shipping_fee,
                    shipping_distance: orderData.shipping_distance,
                    shipping_time: orderData.shipping_time,
                    shipping_type: orderData.shipping_type,
                    commission_rate: orderData.commission_rate,
                    app_commission_fee: orderData.app_commission_fee,
                    shop_revenue: orderData.shop_revenue,
                    order_note: orderData.order_note,
                    pickup_time: orderData.pickup_time,
                    payment_type: orderData.payment_type,
                    phone_number: orderData.phone_number,
                    shipping_address: orderData.shipping_address,
                    latitude: orderData.latitude,
                    longitude: orderData.longitude,
                    paid_at: orderData.paid_at,
                    order_details: orderData.order_details.map((detail: any) => ({
                        id: detail.id,
                        quantity: detail.quantity,
                        sub_total_price: detail.sub_total_price,
                        cake_note: detail.cake_note,
                        available_cake_id: detail.available_cake_id,
                        shop_image_files: detail.available_cake?.shop_image_files?.[0]
                    })),
                    customer: {
                        name: orderData.customer.name,
                        email: orderData.customer.email,
                        phone: orderData.customer.phone,
                        address: orderData.customer.address
                    },
                    bakery: {
                        bakery_name: orderData.bakery.bakery_name,
                        email: orderData.bakery.email,
                        phone: orderData.bakery.phone,
                        address: orderData.bakery.address,
                        id: orderData.bakery.id
                    },
                    transaction: orderData.transaction ? {
                        amount: orderData.transaction.amount,
                        gate_way: orderData.transaction.gate_way,
                        transaction_date: orderData.transaction.transaction_date,
                        account_number: orderData.transaction.account_number
                    } : undefined
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch order details');
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500/10 text-green-500';
            case 'PROCESSING':
                return 'bg-blue-500/10 text-blue-500';
            case 'WAITING_BAKERY_CONFIRM':
                return 'bg-yellow-500/10 text-yellow-500';
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    const fetchCakeImage = async (cakeId: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Access token not found');
            }

            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/available_cakes/${cakeId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cake details');
            }

            const data = await response.json();

            if (data.status_code !== 200) {
                throw new Error(data.errors?.[0] || 'Failed to fetch cake details');
            }

            const imageUrl = data.payload.available_cake_image_files?.[0]?.file_url;
            if (imageUrl) {
                setCakeImages(prev => ({ ...prev, [cakeId]: imageUrl }));
            } else {
                console.log('No image available for this cake');
            }
        } catch (err: any) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        if (order) {
            order.order_details.forEach(detail => {
                fetchCakeImage(detail.available_cake_id);
            });
        }
    }, [order]);

    useEffect(() => {
        if (order) {
            order.order_details.forEach(detail => {
                console.log('Cake ID:', detail.available_cake_id);
            });
        }
    }, [order]);

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
                className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-lg shadow-xl"
            >
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/orderHistory')}
                        className="hover:bg-blue-200 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-blue-600" />
                    </Button>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Chi tiết đơn hàng
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Order Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-t-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Đơn hàng #{order.order_code}</CardTitle>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-gray-600">
                                                {format(new Date(order.paid_at), 'MMM dd, yyyy')}
                                            </span>
                                            <Clock className="h-4 w-4 text-blue-600 ml-2" />
                                            <span className="text-sm text-gray-600">
                                                {format(new Date(order.paid_at), 'hh:mm a')}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge className={`${getStatusColor(order.order_status)} px-4 py-1 rounded-full font-medium`}>
                                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 bg-white rounded-b-lg">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Sản phẩm đã đặt</h3>
                                        <div className="space-y-4">
                                            {order.order_details.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    className="flex gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                                                    whileHover={{ scale: 1.01 }}
                                                >
                                                    <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                                                        {cakeImages[item.available_cake_id] ? (
                                                            <Image
                                                                src={cakeImages[item.available_cake_id]}
                                                                alt={item.available_cake_id}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                                                <Package className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-lg text-blue-700">{item.available_cake_id}</h4>
                                                        {item.cake_note && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Ghi chú: {item.cake_note}
                                                            </p>
                                                        )}
                                                        <div className="flex justify-between items-center mt-2">
                                                            <p className="text-sm text-gray-600">
                                                                {item.quantity} x {formatVND(item.sub_total_price)}
                                                            </p>
                                                            <p className="font-medium text-blue-700">
                                                                {formatVND(item.sub_total_price * item.quantity)}
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
                                                <span className="text-gray-600">Tạm tính</span>
                                                <span>{formatVND(order.total_product_price)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Phí vận chuyển</span>
                                                <span>{formatVND(order.shipping_fee)}</span>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Tổng cộng</span>
                                                <span className="text-blue-700">{formatVND(order.total_customer_paid)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer and Delivery Information */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                                <CardTitle className="text-lg font-bold">Thông tin khách hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-white rounded-b-lg">
                                <div className="space-y-3">
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600">Họ tên:</span>
                                        <span className="font-medium text-blue-700">{order.customer.name}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium text-blue-700">{order.customer.email}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600">Số điện thoại:</span>
                                        <span className="font-medium text-blue-700">{order.customer.phone}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                                <CardTitle className="text-lg font-bold">Thông tin giao hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-white rounded-b-lg">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-gray-600">
                                            {order.shipping_type === 'DELIVERY' ? 'Giao hàng' : 'Nhận tại cửa hàng'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-gray-600">
                                            Thời gian giao hàng dự kiến: {Math.round(order.shipping_time * 60)} phút
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-gray-600">
                                            Khoảng cách: {order.shipping_distance.toFixed(2)} km
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                                <CardTitle className="text-lg font-bold">Thông tin thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-white rounded-b-lg">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-blue-700">{order.payment_type === 'QR_CODE' ? 'Thanh toán QR Code' : 'Thanh toán trực tiếp'}</p>
                                        <p className="text-xs text-gray-600">
                                            Ngân hàng: {order.transaction?.gate_way}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Số tài khoản: {order.transaction?.account_number}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Thời gian thanh toán: {order.paid_at ? format(parse(order.paid_at, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', new Date()), 'dd/MM/yyyy HH:mm') : 'Chưa thanh toán'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card> */}

                        {/* Bakery Information */}
                        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                                <CardTitle className="text-lg font-bold">Thông tin tiệm bánh</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-white rounded-b-lg">
                                <div className="space-y-3">
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600">Tên tiệm:</span>
                                        <span className="font-medium text-blue-700">{order.bakery.bakery_name}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium text-blue-700">{order.bakery.email}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600">Số điện thoại:</span>
                                        <span className="font-medium text-blue-700">{order.bakery.phone}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600">Địa chỉ:</span>
                                        <span className="font-medium text-blue-700">{order.bakery.address}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600">ID tiệm bánh:</span>
                                        <span className="font-medium text-blue-700">{order.bakery.id}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Transaction Details */}
                        {order.transaction && (
                            <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                                <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                                    <CardTitle className="text-lg font-bold">Chi tiết giao dịch</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 bg-white rounded-b-lg">
                                    <div className="space-y-3">
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="text-gray-600">Số tiền:</span>
                                            <span className="font-medium text-blue-700">{formatVND(order.transaction.amount)}</span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="text-gray-600">Ngân hàng:</span>
                                            <span className="font-medium text-blue-700">{order.transaction.gate_way}</span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="text-gray-600">Ngày giao dịch:</span>
                                            <span className="font-medium text-blue-700">{order.transaction.transaction_date}</span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="text-gray-600">Số tài khoản:</span>
                                            <span className="font-medium text-blue-700">{order.transaction.account_number}</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                                onClick={() => setIsFeedbackModalOpen(true)}
                            >
                                Gửi Phản Hồi
                            </Button>
                        </div>
                    </div>


                </div>

                <Modal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)}>
                    <FeedbackForm
                        orderId={order?.id || ''}
                        orderDetailId={order?.order_details[0]?.id || ''}
                        availableCakeId={order?.order_details[0]?.available_cake_id || ''}
                        bakeryId={order?.bakery.id || ''}
                    />
                </Modal>
            </motion.div>
        </div>
    );
} 