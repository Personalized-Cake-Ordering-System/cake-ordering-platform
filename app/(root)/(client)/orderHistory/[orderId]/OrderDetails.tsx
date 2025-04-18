'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Package, ArrowLeft, CreditCard, Truck, Star, RefreshCw } from 'lucide-react';
import { format, parse } from 'date-fns';
import { decodeJWT } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
        cake_name?: string;
        shop_image_files?: {
            file_url: string;
        };
        custom_cake_id?: string;
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

interface ProgressStep {
    status: string;
    label: string;
    description: string;
}

const OrderProgressBar = ({ currentStatus, shippingType }: { currentStatus: string, shippingType: string }) => {
    console.log('Current Status:', currentStatus);
    console.log('Shipping Type:', shippingType);

    const getSteps = (): ProgressStep[] => {
        const baseSteps: ProgressStep[] = [
            {
                status: 'PENDING',
                label: 'Chưa quét mã',
                description: 'Đơn hàng đang chờ xác nhận'
            },
            {
                status: 'WAITING_BAKERY_CONFIRM',
                label: 'Chờ cừa hàng xác nhận',
                description: 'Đơn hàng đang chờ cửa hàng xác nhận'
            },
            {
                status: 'PROCESSING',
                label: 'Đang xử lý',
                description: 'Tiệm bánh đang chuẩn bị đơn hàng'
            }
        ];

        console.log('Condition check:', shippingType === 'PICKUP');
        console.log('Available statuses in order:');

        if (shippingType === 'PICKUP') {
            baseSteps.push({
                status: 'READY_FOR_PICKUP',
                label: 'Bánh đã sẵng sàng tại cửa hàng',
                description: 'Đơn hàng đã sẵn sàng để nhận tại cửa hàng'
            });
        } else {
            baseSteps.push({
                status: 'SHIPPING',
                label: 'Đang giao hàng',
                description: 'Đơn hàng đang được giao đến bạn'
            });
        }

        baseSteps.push({
            status: 'COMPLETED',
            label: 'Hoàn thành',
            description: 'Đơn hàng đã được hoàn thành'
        });

        return baseSteps;
    };

    const steps = getSteps();
    const currentStepIndex = steps.findIndex(step => step.status === currentStatus);
    const isCancelled = currentStatus === 'CANCELED';

    return (
        <div className="w-full py-6">
            <div className="relative">
                {/* Progress line */}
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200">
                    <div
                        className={`h-full transition-all duration-500 ${isCancelled ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                        style={{
                            width: isCancelled ? '100%' : `${(currentStepIndex + 1) * (100 / steps.length)}%`
                        }}
                    />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const isActive = index <= currentStepIndex;
                        const isCurrent = step.status === currentStatus;

                        return (
                            <div key={step.status} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${isCancelled ? 'bg-red-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'
                                    }`}>
                                    {isCancelled ? (
                                        <span className="text-white text-sm">×</span>
                                    ) : (
                                        <span className={`text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p className={`text-sm font-medium ${isCurrent ? 'text-blue-500' : isActive ? 'text-gray-700' : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default function OrderDetails({ orderId }: OrderDetailsProps) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cakeImages, setCakeImages] = useState<{ [key: string]: string }>({});
    const [cakeNames, setCakeNames] = useState<{ [key: string]: string }>({});
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isMovingNext, setIsMovingNext] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    const fetchOrder = useCallback(async () => {
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

            console.log('Order Data:', orderData);
            console.log('Shipping Type:', orderData.shipping_type);
            console.log('Order Status:', orderData.order_status);

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
                    cake_name: detail.available_cake?.cake_name,
                    shop_image_files: detail.available_cake?.shop_image_files?.[0],
                    custom_cake_id: detail.custom_cake_id,
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
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

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

    // fetch cake details by api call available_cakes/{cakeId}
    const fetchCakeDetails = async (cakeId: string) => {
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
            const cakeName = data.payload.available_cake_name;

            if (imageUrl) {
                setCakeImages(prev => ({ ...prev, [cakeId]: imageUrl }));
            }
            if (cakeName) {
                setCakeNames(prev => ({ ...prev, [cakeId]: cakeName }));
            }
        } catch (err: any) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        if (order) {
            order.order_details.forEach(detail => {
                fetchCakeDetails(detail.available_cake_id);
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

    const handleCancelOrder = async () => {
        try {
            setIsCancelling(true);
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Vui lòng đăng nhập để hủy đơn hàng');
                return;
            }

            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/orders/${orderId}/cancel`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accept': '*/*'
                }
            });

            if (response.ok) {
                toast.success('Đơn hàng đã được hủy thành công');
                // Wait a moment for the toast to be visible before redirecting
                setTimeout(() => {
                    router.push('/orderHistory');
                }, 1000);
            } else {
                const data = await response.json();
                throw new Error(data.errors?.[0] || 'Không thể hủy đơn hàng');
            }
        } catch (err: any) {
            toast.error(err.message || 'Không thể hủy đơn hàng');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleMoveToNext = async () => {
        try {
            setIsMovingNext(true);
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Vui lòng đăng nhập để cập nhật trạng thái');
                return;
            }

            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/orders/${orderId}/move-to-next`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accept': '*/*'
                }
            });

            if (response.status === 200) {
                toast.success('Cập nhật trạng thái đơn hàng thành công');
                router.refresh();
                // Refresh the order data
                fetchOrder();
            } else {
                const data = await response.json();
                throw new Error(data.errors?.[0] || 'Không thể cập nhật trạng thái đơn hàng');
            }
        } catch (err: any) {
            toast.error(err.message || 'Không thể cập nhật trạng thái đơn hàng');
        } finally {
            setIsMovingNext(false);
        }
    };

    const handleReorder = async () => {
        try {
            setIsReordering(true);
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('Vui lòng đăng nhập để đặt lại đơn hàng');
                return;
            }

            if (!order) {
                toast.error('Không tìm thấy thông tin đơn hàng');
                return;
            }

            // Create the reorder request body
            const reorderBody = {
                bakery_id: order.bakery.id,
                order_note: order.order_note || "",
                phone_number: order.phone_number || order.customer.phone,
                shipping_address: order.shipping_address || order.customer.address,
                latitude: order.latitude || "0",
                longitude: order.longitude || "0",
                pickup_time: order.pickup_time,
                shipping_type: order.shipping_type,
                payment_type: order.payment_type,
                voucher_code: "",
                order_detail_create_models: order.order_details.map(detail => ({
                    available_cake_id: detail.available_cake_id,
                    custom_cake_id: null,
                    cake_note: detail.cake_note || "",
                    quantity: detail.quantity,
                    price: detail.sub_total_price
                }))
            };

            const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(reorderBody)
            });

            const data = await response.json();

            if (response.ok && data.status_code === 200) {
                toast.success('Đặt lại đơn hàng thành công!');

                // Create the order details for QR payment page
                const orderDetails = {
                    customerInfo: {
                        fullName: order.customer.name,
                        email: order.customer.email,
                        phone: order.phone_number || order.customer.phone,
                        address: order.shipping_address || order.customer.address,
                    },
                    orderInfo: {
                        items: order.order_details.map(detail => ({
                            cake_name: detail.custom_cake_id ? "Custom Cake" : (cakeNames[detail.available_cake_id] || "Cake"),
                            quantity: detail.quantity,
                            sub_total_price: detail.sub_total_price,
                            main_image: {
                                file_url: detail.custom_cake_id ? null : (cakeImages[detail.available_cake_id] || null)
                            },
                            custom_cake_id: detail.custom_cake_id || null,
                            available_cake_id: detail.custom_cake_id ? null : detail.available_cake_id
                        })),
                        total: data.payload.total_customer_paid,
                        orderCode: data.payload.order_code,
                        totalProductPrice: data.payload.total_product_price,
                        shippingDistance: data.payload.shipping_distance || 0,
                        shippingFee: data.payload.shipping_fee || 0,
                        discountAmount: data.payload.discount_amount || 0
                    },
                    qrLink: `https://img.vietqr.io/image/TPBank-00005992966-qr_only.jpg?amount=${data.payload.total_customer_paid}&addInfo=${data.payload.order_code}`
                };

                // Reset payment countdown timer
                localStorage.removeItem('paymentCountdown');
                localStorage.removeItem('paymentTimestamp');

                // Save to localStorage for QR payment page to use
                localStorage.setItem('currentOrder', JSON.stringify(orderDetails));

                // Navigate to payment page
                router.push('/qr-payment');
            } else {
                throw new Error(data.errors?.[0] || 'Không thể đặt lại đơn hàng');
            }
        } catch (err: any) {
            console.error('Reorder error:', err);
            toast.error(err.message || 'Không thể đặt lại đơn hàng');
        } finally {
            setIsReordering(false);
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
                className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-lg shadow-xl"
            >
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
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

                    <div className="flex gap-2">
                        {order?.order_status === 'COMPLETED' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={isReordering}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                                    >
                                        {isReordering ? (
                                            <span className="flex items-center">
                                                <span className="animate-spin mr-2">
                                                    <RefreshCw className="h-4 w-4" />
                                                </span>
                                                Đang xử lý...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Đặt lại đơn hàng
                                            </span>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white rounded-lg p-6">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-semibold">Xác nhận đặt lại đơn hàng</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-600 space-y-2">
                                            <p>Bạn có chắc chắn muốn đặt lại đơn hàng này?</p>
                                            <ul className="list-disc pl-4 space-y-1 mt-2">
                                                <li>Một đơn hàng mới sẽ được tạo với cùng sản phẩm</li>
                                                <li>Bạn sẽ được chuyển đến trang thanh toán</li>
                                                <li>Đơn hàng hiện tại vẫn được giữ nguyên</li>
                                            </ul>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-6">
                                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Hủy bỏ</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleReorder}
                                            className="bg-blue-500 hover:bg-blue-600 text-white"
                                        >
                                            Xác nhận đặt lại
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {order?.order_status === 'PENDING' && (
                            <Button
                                variant="default"
                                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                                onClick={() => {
                                    // Prepare order details for QR payment page
                                    const orderDetails = {
                                        customerInfo: {
                                            fullName: order.customer.name,
                                            email: order.customer.email,
                                            phone: order.phone_number || order.customer.phone,
                                            address: order.shipping_address || order.customer.address,
                                        },
                                        orderInfo: {
                                            items: order.order_details.map(detail => ({
                                                cake_name: detail.custom_cake_id ? "Custom Cake" : (cakeNames[detail.available_cake_id] || "Cake"),
                                                quantity: detail.quantity,
                                                sub_total_price: detail.sub_total_price,
                                                main_image: {
                                                    file_url: detail.custom_cake_id ? null : (cakeImages[detail.available_cake_id] || null)
                                                },
                                                custom_cake_id: detail.custom_cake_id || null,
                                                available_cake_id: detail.custom_cake_id ? null : detail.available_cake_id
                                            })),
                                            total: order.total_customer_paid,
                                            orderCode: order.order_code,
                                            totalProductPrice: order.total_product_price,
                                            shippingDistance: order.shipping_distance || 0,
                                            shippingFee: order.shipping_fee || 0,
                                            discountAmount: 0
                                        },
                                        qrLink: `https://img.vietqr.io/image/TPBank-00005992966-qr_only.jpg?amount=${order.total_customer_paid}&addInfo=${order.order_code}`
                                    };

                                    // // Reset payment countdown timer
                                    // localStorage.removeItem('paymentCountdown');
                                    // localStorage.removeItem('paymentTimestamp');

                                    // // Save to localStorage
                                    // localStorage.setItem('currentOrder', JSON.stringify(orderDetails));

                                    // Navigate to QR payment page
                                    const paymentUrl = `/qr-payment`;
                                    router.push(paymentUrl);
                                }}
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Thanh toán đơn hàng
                            </Button>
                        )}

                        {(order?.order_status === 'SHIPPING' || order?.order_status === 'READY_FOR_PICKUP') && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="default"
                                        disabled={isMovingNext}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        {isMovingNext ? 'Đang cập nhật...' : 'Xác nhận đã nhận hàng'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white rounded-lg p-6">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-semibold">Xác nhận đã nhận hàng</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-600 space-y-2">
                                            <p>Bạn có chắc chắn đã nhận được đơn hàng này?</p>
                                            <ul className="list-disc pl-4 space-y-1 mt-2">
                                                <li>Đơn hàng sẽ được chuyển sang trạng thái hoàn thành</li>
                                                <li>Bạn có thể đánh giá đơn hàng sau khi xác nhận</li>
                                                <li>Hành động này không thể hoàn tác</li>
                                            </ul>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-6">
                                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Quay lại</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleMoveToNext}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                        >
                                            Xác nhận
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {(order?.order_status === 'PENDING') && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={isCancelling}
                                    >
                                        {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white rounded-lg p-6">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-semibold">Xác nhận hủy đơn hàng</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-600 space-y-2">
                                            <p>Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.</p>
                                            <ul className="list-disc pl-4 space-y-1 mt-2">
                                                <li>Đơn hàng sẽ được hủy ngay lập tức</li>
                                                <li>Nếu bạn đã thanh toán, số tiền sẽ được hoàn trả trong vòng 3-5 ngày làm việc</li>
                                                <li>Sau khi hủy, bạn sẽ được chuyển về trang lịch sử đơn hàng</li>
                                                <li>Bạn có thể đặt lại đơn hàng mới bất cứ lúc nào</li>
                                            </ul>
                                            <p className="text-sm text-red-500 mt-2">Lưu ý: Không được hủy quá nhiều đơn hàng nếu quá số lượng hủy được phép thì tài khoản sẽ bị khóa</p>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-6">
                                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Quay lại</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleCancelOrder}
                                            className="bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            Xác nhận hủy
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                {/* Add Progress Bar */}
                <Card className="mb-8 border-none shadow-lg">
                    <CardContent className="p-6">
                        <OrderProgressBar currentStatus={order?.order_status || ''} shippingType={order?.shipping_type || 'DELIVERY'} />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Order Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-t-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Đơn hàng #{order.order_code}</CardTitle>
                                        {/* <div className="flex items-center gap-2 mt-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-gray-600">
                                                {format(new Date(order.paid_at), 'MMM dd, yyyy')}
                                            </span>
                                            <Clock className="h-4 w-4 text-blue-600 ml-2" />
                                            <span className="text-sm text-gray-600">
                                                {format(new Date(order.paid_at), 'hh:mm a')}
                                            </span>
                                        </div> */}
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
                                                        {item.custom_cake_id ? (
                                                            // <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                                            //     <Package className="h-8 w-8 text-gray-400" />
                                                            // </div>
                                                            <Image
                                                                src={cakeImages[item.custom_cake_id]}
                                                                alt={item.custom_cake_id}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : cakeImages[item.available_cake_id] ? (
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
                                                        <h4 className="font-medium text-lg text-blue-700">
                                                            {item.custom_cake_id ? "Custom Cake" : (cakeNames[item.available_cake_id] || 'Cake Custom')}
                                                        </h4>
                                                        {item.cake_note && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Ghi chú bánh: {item.cake_note}
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

                                    {order.order_note && (
                                        <>
                                            <Separator className="my-4" />
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3">Ghi chú đơn hàng</h3>
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <p className="text-gray-700">{order.order_note}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
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