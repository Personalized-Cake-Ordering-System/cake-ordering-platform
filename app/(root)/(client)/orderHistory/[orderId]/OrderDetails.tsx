'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Package, ArrowLeft, CreditCard, Truck, Star, RefreshCw, AlertTriangle, FileText, Upload, X, Flag, AlertCircle, Check } from 'lucide-react';
import { format, parse } from 'date-fns';
import { decodeJWT } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Order status constants used for progress tracking
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
};

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
        review?: {
            image_id: string;
            rating: number;
            content: string;
            created_at: string;
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

                const uploadResponse = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/files', {
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
                bakery_id: bakeryId,
                customer_id: customerId,
                review_type: "AVAILABLE_CAKE_REVIEW"
            });

            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/reviews`, {
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
                    bakery_id: bakeryId,
                    customer_id: customerId,
                    review_type: "AVAILABLE_CAKE_REVIEW"
                })
            });

            if (response.status === 200) {
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
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2">Đánh Giá</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-all duration-200 focus:outline-none transform hover:scale-110"
                        >
                            <Star
                                className={`h-8 w-8 ${star <= rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2">Phản Hồi Của Bạn</label>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:border-custom-teal dark:focus:border-custom-teal focus:ring-custom-teal dark:focus:ring-custom-teal/70 dark:bg-gray-800 dark:text-gray-200"
                    placeholder="Nhập đánh giá của bạn về sản phẩm..."
                />
            </div>
            <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2">Thêm Ảnh (Tùy Chọn)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="feedback-image"
                    />
                    <label htmlFor="feedback-image" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-custom-teal dark:text-custom-teal/80 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {imageFile ? imageFile.name : "Chọn hoặc kéo thả ảnh vào đây"}
                        </span>
                    </label>
                </div>
                {imageFile && (
                    <div className="mt-3 relative">
                        <div className="relative h-36 w-full rounded-md overflow-hidden">
                            <Image
                                src={URL.createObjectURL(imageFile)}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setImageFile(null)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-end">
                <Button
                    type="submit"
                    className="bg-gradient-to-r from-custom-teal to-custom-pink hover:from-custom-teal/90 hover:to-custom-pink/90 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    Gửi Phản Hồi
                </Button>
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-black/30 p-6 w-full max-w-md relative border border-gray-200 dark:border-gray-700"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Đóng</span>
                </button>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-custom-teal to-custom-pink bg-clip-text text-transparent">Gửi Phản Hồi</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Chia sẻ trải nghiệm của bạn với chúng tôi</p>
                </div>
                <div className="bg-gradient-to-r from-custom-teal/5 to-custom-pink/5 dark:from-custom-teal/10 dark:to-custom-pink/10 p-6 rounded-lg mb-4">
                    {children}
                </div>
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

    const isPickupOrder = shippingType?.toUpperCase() === "PICKUP";

    // Map various statuses to our simplified flow
    let mappedStatus = currentStatus;

    // For pickup orders , map READY_FOR_PICKUP , SHIPPING to PICKUP
    if (isPickupOrder) {
        if (currentStatus === "READY_FOR_PICKUP" || currentStatus === "SHIPPING") {
            mappedStatus = "PICKUP";
        } else if (currentStatus === "SHIPPING_COMPLETED") {
            mappedStatus = "COMPLETED";
        }
    } else {
        // For regular orders , keep original mapping
        if (currentStatus === "READY_FOR_PICKUP") {
            mappedStatus = "PROCESSING";
        }
    }

    const currentStep = OrderStatus[mappedStatus as keyof typeof OrderStatus] || 0;

    // Check if order is in report flow
    const isReportFlow =
        currentStatus === "REPORT_PENDING" ||
        currentStatus === "FAULTY";

    const isCanceled = currentStatus === "CANCELED";

    // Determine step labels based on shipping_type
    const getStepLabel = (stepId: string) => {
        if (stepId === "SHIPPING" || stepId === "PICKUP" || stepId === "READY_FOR_PICKUP") {
            // Check shipping type to differentiate between pickup and delivery
            if (isPickupOrder) {
                return "Lấy tại chỗ";
            } else {
                return "Giao hàng";
            }
        } else if (stepId === "WAITING_BAKERY_CONFIRM") {
            return "Chờ xác nhận";
        } else if (stepId === "PROCESSING") {
            return "Đang xử lý";
        } else if (stepId === "SHIPPING_COMPLETED") {
            if (isPickupOrder) {
                return "Hoàn thành";
            }
            return "Giao hàng hoàn tất";
        } else if (stepId === "COMPLETED") {
            return "Hoàn thành";
        } else if (stepId === "REPORT_PENDING") {
            return "Đang xử lý khiếu nại";
        } else if (stepId === "FAULTY") {
            return "Đơn hàng lỗi";
        }
        return stepId;
    };

    // Define normal flow steps based on shipping type
    const normalSteps = isPickupOrder
        ? [
            { id: "WAITING_BAKERY_CONFIRM", label: getStepLabel("WAITING_BAKERY_CONFIRM") },
            { id: "PROCESSING", label: getStepLabel("PROCESSING") },
            { id: "PICKUP", label: getStepLabel("PICKUP") },
            { id: "COMPLETED", label: getStepLabel("COMPLETED") },
        ]
        : [
            { id: "WAITING_BAKERY_CONFIRM", label: getStepLabel("WAITING_BAKERY_CONFIRM") },
            { id: "PROCESSING", label: getStepLabel("PROCESSING") },
            { id: "SHIPPING", label: getStepLabel("SHIPPING") },
            { id: "SHIPPING_COMPLETED", label: getStepLabel("SHIPPING_COMPLETED") },
            { id: "COMPLETED", label: getStepLabel("COMPLETED") },
        ];

    // Define report flow steps
    const reportSteps = [
        { id: "WAITING_BAKERY_CONFIRM", label: getStepLabel("WAITING_BAKERY_CONFIRM") },
        { id: "PROCESSING", label: getStepLabel("PROCESSING") },
        { id: "SHIPPING", label: getStepLabel("SHIPPING") },
        { id: "SHIPPING_COMPLETED", label: getStepLabel("SHIPPING_COMPLETED") },
        { id: "REPORT_PENDING", label: getStepLabel("REPORT_PENDING") },
        { id: "FAULTY", label: getStepLabel("FAULTY") },
    ];

    // Choose which steps to display based on flow
    const steps = isReportFlow ? reportSteps : normalSteps;

    if (isCanceled) {
        return (
            <div className="w-full p-5 bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-800/40 rounded-lg shadow-sm dark:shadow-md dark:shadow-black/5">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400 mb-3">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="text-lg font-semibold text-red-700 dark:text-red-400">
                        Đơn hàng đã bị hủy
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400/80 mt-1 max-w-md mx-auto">
                        Đơn hàng này đã bị hủy và không thể tiếp tục xử lý
                    </p>
                </div>
            </div>
        );
    }

    if (isReportFlow) {
        return (
            <div className="w-full">
                <div className="w-full p-4 mb-4 bg-yellow-50/80 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-800/40 rounded-lg shadow-sm dark:shadow-md dark:shadow-black/5">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                                {currentStatus === "REPORT_PENDING"
                                    ? "Khiếu nại đang xử lý"
                                    : "Đơn hàng bị lỗi"}
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                {currentStatus === "REPORT_PENDING"
                                    ? "Đơn hàng đang trong quá trình xử lý khiếu nại từ khách hàng"
                                    : "Đơn hàng đã được xác nhận lỗi sau khi xử lý khiếu nại"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full py-8 px-4 bg-zinc-50 dark:bg-slate-900/60 rounded-lg border border-gray-200 dark:border-slate-800/60 shadow-sm dark:shadow-md dark:shadow-black/5">
                    <div className="w-full relative flex items-center justify-between px-2 sm:px-8 max-w-4xl mx-auto">
                        {/* Background connecting line (gray) */}
                        <div className="absolute top-6 left-0 right-0 h-[4px] bg-gray-200 dark:bg-gray-700/60 rounded-full"></div>

                        {/* Progress line */}
                        <div
                            className={cn(
                                "absolute top-6 left-0 h-[4px] rounded-full transition-all duration-500",
                                currentStatus === "REPORT_PENDING"
                                    ? "bg-yellow-500 dark:bg-yellow-500/70"
                                    : "bg-red-500 dark:bg-red-500/70"
                            )}
                            style={{
                                width: `calc(${Math.max(
                                    0,
                                    Math.min(
                                        100,
                                        (steps.indexOf(
                                            steps.find((s) => s.id === mappedStatus) || steps[0]
                                        ) /
                                            (steps.length - 1)) *
                                        100
                                    )
                                )}% + ${steps.indexOf(
                                    steps.find((s) => s.id === mappedStatus) || steps[0]
                                ) > 0
                                    ? "10px"
                                    : "0px"
                                    })`,
                                zIndex: 1,
                            }}
                        ></div>

                        {steps.map((step, index) => {
                            const isCompleted =
                                index <
                                steps.indexOf(
                                    steps.find((s) => s.id === mappedStatus) || steps[0]
                                );
                            const isActive = step.id === mappedStatus;
                            const isPending =
                                index >
                                steps.indexOf(
                                    steps.find((s) => s.id === mappedStatus) || steps[0]
                                );

                            // Special styling for report flow
                            const isReportStep = step.id === "REPORT_PENDING" || step.id === "FAULTY";

                            // Determine circle colors
                            let circleClasses = "";
                            let iconColor = "";

                            if (isActive && isReportStep && step.id === "REPORT_PENDING") {
                                circleClasses =
                                    "bg-yellow-500 border-yellow-200 text-white dark:bg-yellow-600 dark:border-yellow-400";
                                iconColor = "text-white";
                            } else if (isActive && isReportStep && step.id === "FAULTY") {
                                circleClasses =
                                    "bg-red-500 border-red-200 text-white dark:bg-red-600 dark:border-red-400";
                                iconColor = "text-white";
                            } else if (isActive) {
                                circleClasses =
                                    "bg-custom-teal border-custom-teal text-white dark:bg-custom-teal dark:border-custom-teal";
                                iconColor = "text-white";
                            } else if (isCompleted) {
                                circleClasses =
                                    "bg-custom-teal border-custom-teal text-white dark:bg-custom-teal dark:border-custom-teal";
                                iconColor = "text-white";
                            } else {
                                circleClasses =
                                    "bg-white border-gray-300 text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400";
                                iconColor = "text-gray-400 dark:text-slate-400";
                            }

                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center"
                                    style={{ zIndex: 2 }}
                                >
                                    {/* Step number indicator */}
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-full border-2 flex items-center justify-center text-base font-semibold mb-2 shadow-sm transition-all",
                                            circleClasses
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className={`h-5 w-5 ${iconColor}`} />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>

                                    {/* Step label */}
                                    <div className="text-center max-w-[120px]">
                                        <span
                                            className={cn(
                                                "text-sm font-medium",
                                                isActive
                                                    ? "text-gray-800 dark:text-gray-100"
                                                    : isCompleted
                                                        ? "text-gray-800 dark:text-gray-100"
                                                        : "text-gray-500 dark:text-gray-400"
                                            )}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-8 px-4 bg-zinc-50 dark:bg-slate-900/60 rounded-lg border border-gray-200 dark:border-slate-800/60 shadow-sm dark:shadow-md dark:shadow-black/5">
            <div className="w-full relative flex items-center justify-between px-2 sm:px-8 max-w-4xl mx-auto">
                {/* Background connecting line (gray) */}
                <div className="absolute top-6 left-0 right-0 h-[4px] bg-gray-200 dark:bg-gray-700/60 rounded-full"></div>

                {/* Completed connecting line (blue) */}
                <div
                    className="absolute top-6 left-0 h-[4px] bg-custom-teal dark:bg-custom-teal/70 rounded-full transition-all duration-500"
                    style={{
                        width: `calc(${Math.max(
                            0,
                            Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100)
                        )}% + ${currentStep > 1 ? "10px" : "0px"})`,
                        zIndex: 1,
                    }}
                ></div>

                {steps.map((step, index) => {
                    const stepValue = OrderStatus[step.id as keyof typeof OrderStatus];
                    const isCompleted = stepValue < currentStep;
                    const isActive = stepValue === currentStep;
                    const isPending = stepValue > currentStep;

                    // Special icon for shipping completed (waiting period)
                    const isWaitingPeriod = step.id === "SHIPPING_COMPLETED" && isActive;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center"
                            style={{ zIndex: 2 }}
                        >
                            {/* Step number indicator */}
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-full border-2 flex items-center justify-center text-base font-semibold mb-2 shadow-sm transition-all",
                                    isActive
                                        ? "bg-custom-teal border-custom-teal text-white dark:bg-custom-teal dark:border-custom-teal"
                                        : isCompleted
                                            ? "bg-custom-teal border-custom-teal text-white dark:bg-custom-teal dark:border-custom-teal"
                                            : "bg-white border-gray-300 text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5 text-white" />
                                ) : isWaitingPeriod ? (
                                    <Clock className="h-5 w-5 text-white" />
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Step label */}
                            <div className="text-center max-w-[120px]">
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        isActive
                                            ? "text-gray-800 dark:text-gray-100"
                                            : isCompleted
                                                ? "text-gray-800 dark:text-gray-100"
                                                : "text-gray-500 dark:text-gray-400"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    function getCurrentStepDescription(stepId: string): string {
        switch (stepId) {
            case "WAITING_BAKERY_CONFIRM":
                return "Đơn hàng đang chờ cửa hàng xác nhận";
            case "PROCESSING":
                return "Tiệm bánh đang chuẩn bị đơn hàng";
            case "SHIPPING":
                return "Đơn hàng đang được giao đến bạn";
            case "SHIPPING_COMPLETED":
                return "Đơn hàng đã giao thành công";
            case "PICKUP":
                return "Đơn hàng đã sẵn sàng để nhận tại cửa hàng";
            case "COMPLETED":
                return "Đơn hàng đã được hoàn thành";
            default:
                return "";
        }
    }
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
    const [storeReportDialogOpen, setStoreReportDialogOpen] = useState(false);
    const [storeReportContent, setStoreReportContent] = useState('');
    const [isSubmittingStoreReport, setIsSubmittingStoreReport] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string, name: string }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [reviewImage, setReviewImage] = useState<string | null>(null);

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

            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/orders/${orderId}`, {
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
                    review: detail.review
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

    const formatDeliveryTime = (shippingTimeValue: number, distance?: number) => {
        // If we have distance, calculate a more realistic time
        // Assume average speed of 30 km/h in city traffic
        let totalMinutes: number;

        if (distance && distance > 0) {
            // Calculate time based on distance (30 km/h average speed)
            const timeInHours = distance / 30;
            totalMinutes = Math.ceil(timeInHours * 60);

            // Add buffer time for preparation and delivery logistics
            totalMinutes += 15; // 15 minutes buffer

            // Minimum delivery time should be 30 minutes
            totalMinutes = Math.max(totalMinutes, 30);
        } else {
            // Fallback to API value, but check if it seems to be in hours or minutes
            if (shippingTimeValue < 5) {
                // Likely in hours, convert to minutes
                totalMinutes = Math.ceil(shippingTimeValue * 60);
            } else {
                // Likely already in minutes
                totalMinutes = Math.ceil(shippingTimeValue);
            }
        }

        if (totalMinutes < 60) {
            return `${totalMinutes} phút`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            if (minutes === 0) {
                return `${hours} tiếng`;
            } else {
                return `${hours} tiếng ${minutes} phút`;
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500/10 dark:bg-green-500/20 text-green-500 dark:text-green-400';
            case 'PROCESSING':
                return 'bg-custom-teal/10 dark:bg-custom-teal/20 text-custom-teal dark:text-custom-teal/90';
            case 'WAITING_BAKERY_CONFIRM':
                return 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-500 dark:text-yellow-400';
            case 'CANCELLED':
                return 'bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400';
            default:
                return 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400';
        }
    } ;

    // Add this function to get Vietnamese status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'WAITING_BAKERY_CONFIRM':
                return 'Chờ xác nhận';
            case 'SHIPPING':
                return 'Đang giao hàng';
            case 'SHIPPING_COMPLETED':
                return 'Giao hàng hoàn tất';
            case 'PICKUP':
                return 'Nhận tại cửa hàng';
            case 'READY_FOR_PICKUP':
                return 'Sẵn sàng nhận hàng';
            case 'REPORT_PENDING':
                return 'Đang xử lý khiếu nại';
            case 'FAULTY':
                return 'Đơn hàng lỗi';
            case 'CANCELED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    // fetch cake details by api call available_cakes/{cakeId}
    const fetchCakeDetails = async (cakeId: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Access token not found');
            }

            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/available_cakes/${cakeId}`, {
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

            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/orders/${orderId}/cancel`, {
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

            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/orders/${orderId}/move-to-next`, {
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

            const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/orders', {
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();

        try {
            for (let i = 0; i < files.length; i++) {
                formData.set('formFile', files[i]);

                const response = await axios.post(
                    'https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/files',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                if (response.data.status_code === 200) {
                    setUploadedFiles(prev => [...prev, {
                        id: response.data.payload.id,
                        name: response.data.payload.file_name
                    }]);
                }
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error("Có lỗi xảy ra khi tải lên tệp");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const handleStoreReport = async () => {
        if (!storeReportContent.trim()) {
            toast.error("Vui lòng nhập nội dung báo cáo");
            return;
        }

        setIsSubmittingStoreReport(true);
        try {
            const accessToken = localStorage.getItem('accessToken');

            if (!accessToken) {
                toast.error("Vui lòng đăng nhập để báo cáo đơn hàng");
                return;
            }

            const reportData = {
                content: storeReportContent,
                report_files: uploadedFiles.map(file => file.id),
                order_id: orderId,
                bakery_id: order?.bakery.id
            };

            const response = await axios.post(
                'https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/reports',
                reportData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                toast.success("Báo cáo thành công! Chúng tôi đã nhận được báo cáo của bạn và sẽ xem xét trong thời gian sớm nhất");
                setStoreReportDialogOpen(false);
                setStoreReportContent('');
                setUploadedFiles([]);
            }
        } catch (error: any) {
            console.error("Error reporting order:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi báo cáo");
        } finally {
            setIsSubmittingStoreReport(false);
        }
    };

    // Add this function to fetch review image
    const fetchReviewImage = async (imageId: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Access token not found');
            }

            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/files/${imageId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch review image');
            }

            const data = await response.json();
            if (data.status_code === 200 && data.payload.file_url) {
                setReviewImage(data.payload.file_url);
            }
        } catch (err: any) {
            console.error('Error fetching review image:', err);
        }
    };

    // Add this useEffect to fetch review image when order has a review
    useEffect(() => {
        if (order?.order_details[0]?.review?.image_id) {
            fetchReviewImage(order.order_details[0].review.image_id);
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
                className="bg-gradient-to-r from-pink-100 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-lg shadow-xl"
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
                                    // localStorage.removeItem('paymentCountdown') ;
                                    // localStorage.removeItem('paymentTimestamp') ;

                                    // // Save to localStorage
                                    // localStorage.setItem('currentOrder' , JSON.stringify(orderDetails)) ;

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

                        {(order?.order_status === 'PENDING' || order?.order_status === 'WAITING_BAKERY_CONFIRM') && (
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
                                                <li>Nếu bạn đã thanh toán , số tiền sẽ được hoàn trả trong vòng 3-5 ngày làm việc</li>
                                                <li>Sau khi hủy , bạn sẽ được chuyển về trang lịch sử đơn hàng</li>
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
                            <CardHeader className="bg-gradient-to-r from-custom-teal/10 to-custom-pink/10 dark:from-custom-teal/20 dark:to-custom-pink/20 p-6 rounded-t-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Đơn hàng #{order.order_code}</CardTitle>
                                    </div>
                                    <Badge className={`${getStatusColor(order.order_status)} px-4 py-1 rounded-full font-medium`}>
                                        {getStatusText(order.order_status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Sản phẩm đã đặt</h3>
                                        <div className="space-y-4">
                                            {order.order_details.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    className="flex gap-4 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    whileHover={{ scale: 1.01 }}
                                                >
                                                    <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                                                        {item.custom_cake_id ? (
                                                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                                                <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                            </div>
                                                            // <Image
                                                            //     src={cakeImages[item.custom_cake_id]}
                                                            //     alt={item.custom_cake_id}
                                                            //     fill
                                                            //     className="object-cover"
                                                            // />
                                                        ) : cakeImages[item.available_cake_id] ? (
                                                            <Image
                                                                src={cakeImages[item.available_cake_id]}
                                                                alt={item.available_cake_id}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                                                <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-lg text-custom-teal dark:text-custom-teal">
                                                            {item.custom_cake_id ? "Custom Cake" : (cakeNames[item.available_cake_id] || 'Cake Custom')}
                                                        </h4>
                                                        {item.cake_note && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                Ghi chú bánh: {item.cake_note}
                                                            </p>
                                                        )}
                                                        <div className="flex justify-between items-center mt-2">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {item.quantity} x {formatVND(item.sub_total_price)}
                                                            </p>
                                                            <p className="font-medium text-custom-teal dark:text-custom-teal/90">
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
                                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Tổng đơn hàng</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Tạm tính</span>
                                                <span className="text-gray-800 dark:text-gray-200">{formatVND(order.total_product_price)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Phí vận chuyển</span>
                                                <span className="text-gray-800 dark:text-gray-200">{formatVND(order.shipping_fee)}</span>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span className="text-gray-900 dark:text-gray-100">Tổng cộng</span>
                                                <span className="text-custom-teal dark:text-custom-teal/90">{formatVND(order.total_customer_paid)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {order.order_note && (
                                        <>
                                            <Separator className="my-4" />
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">Ghi chú đơn hàng</h3>
                                                <div className="bg-custom-teal/10 dark:bg-custom-teal/20 p-4 rounded-lg">
                                                    <p className="text-gray-700 dark:text-gray-300">{order.order_note}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Add this section after the order details card */}
                        {order?.order_details[0]?.review && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 mt-6 bg-gradient-to-br from-white to-custom-pink/10 dark:from-gray-800 dark:to-custom-pink/30">
                                    <CardHeader className="p-6 bg-gradient-to-r from-custom-teal to-custom-pink dark:from-custom-teal/90 dark:to-custom-pink/90 rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold text-white">Đánh giá của bạn</CardTitle>
                                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-white text-sm font-medium">
                                                    {order.order_details[0].review?.rating || 0}/5
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 bg-white dark:bg-gray-800">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, index) => (
                                                        <Star
                                                            key={index}
                                                            className={`h-6 w-6 transition-all duration-200 ${index < (order.order_details[0].review?.rating || 0)
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-200'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {order.order_details[0].review?.content}
                                                </p>
                                            </div>

                                            {reviewImage && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="relative h-64 w-full rounded-xl overflow-hidden shadow-lg"
                                                >
                                                    <Image
                                                        src={reviewImage}
                                                        alt="Review image"
                                                        fill
                                                        className="object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                </motion.div>
                                            )}

                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Đánh giá vào: {format(new Date(order.order_details[0].review?.created_at || ''), 'dd/MM/yyyy HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>

                    {/* Customer and Delivery Information */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="p-6 bg-gradient-to-r from-custom-teal/10 to-custom-pink/10 dark:from-custom-teal/20 dark:to-custom-pink/20 rounded-t-lg">
                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Thông tin khách hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                                <div className="space-y-3">
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">Họ tên:</span>
                                        <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.customer.name}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                        <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.customer.email}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">Số điện thoại:</span>
                                        <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.customer.phone}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="p-6 bg-gradient-to-r from-custom-teal/10 to-custom-pink/10 dark:from-custom-teal/20 dark:to-custom-pink/20 rounded-t-lg">
                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Thông tin giao hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Truck className="h-5 w-5 text-custom-teal dark:text-custom-teal/90" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {order.shipping_type === 'DELIVERY' ? 'Giao hàng' : 'Nhận tại cửa hàng'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-custom-teal dark:text-custom-teal/90" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Thời gian giao hàng dự kiến: {formatDeliveryTime(order.shipping_time, order.shipping_distance)}
                                        </p>
                                    </div> 
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-custom-teal dark:text-custom-teal/90" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Khoảng cách: {order.shipping_distance.toFixed(2)} km
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bakery Information */}
                        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="p-6 bg-gradient-to-r from-custom-teal/10 to-custom-pink/10 dark:from-custom-teal/20 dark:to-custom-pink/20 rounded-t-lg">
                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Thông tin tiệm bánh</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                                <div className="space-y-3">
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">Tên tiệm:</span>
                                        <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.bakery.bakery_name}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                        <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.bakery.email}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">Số điện thoại:</span>
                                        <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.bakery.phone}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">Địa chỉ:</span>
                                        <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.bakery.address}</span>
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">ID tiệm bánh:</span>
                                        <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.bakery.id}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Transaction Details */}
                        {order.transaction && (
                            <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
                                <CardHeader className="p-6 bg-gradient-to-r from-custom-teal/10 to-custom-pink/10 dark:from-custom-teal/20 dark:to-custom-pink/20 rounded-t-lg">
                                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Chi tiết giao dịch</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                                    <div className="space-y-3">
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="text-gray-600 dark:text-gray-400">Số tiền:</span>
                                            <span className="font-medium text-custom-teal dark:text-custom-teal/90">{formatVND(order.transaction.amount)}</span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="text-gray-600 dark:text-gray-400">Ngân hàng:</span>
                                            <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.transaction.gate_way}</span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="text-gray-600 dark:text-gray-400">Ngày giao dịch:</span>
                                            <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.transaction.transaction_date}</span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <span className="text-gray-600 dark:text-gray-400">Số tài khoản:</span>
                                            <span className="font-medium text-custom-teal dark:text-custom-teal/90">{order.transaction.account_number}</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="mt-4 bg-gradient-to-r from-custom-teal to-custom-pink text-white hover:from-custom-teal/90 hover:to-custom-pink/90 dark:hover:from-custom-teal/80 dark:hover:to-custom-pink/80"
                                onClick={() => setIsFeedbackModalOpen(true)}
                            >
                                Gửi Phản Hồi
                            </Button>
                            <Button
                                variant="outline"
                                className="mt-4 bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 dark:hover:from-red-500/90 dark:hover:to-pink-500/90"
                                onClick={() => setStoreReportDialogOpen(true)}
                            >
                                <Flag className="w-4 h-4 mr-2" />
                                Báo Cáo
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

                {/* Report Dialog */}
                <Dialog open={storeReportDialogOpen} onOpenChange={setStoreReportDialogOpen}>
                    <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 max-h-[80vh] overflow-y-auto">
                        <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100 pb-2 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-xl font-semibold">Báo cáo đơn hàng</span>
                        </DialogTitle>

                        <div className="space-y-6 mt-6">
                            {/* Report Categories */}
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Chọn loại báo cáo</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group text-left"
                                        onClick={() => setStoreReportContent(prev => prev + "\n• Sản phẩm không đúng như mô tả")}
                                    >
                                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/40">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-red-500 dark:group-hover:text-red-400">Vấn đề về sản phẩm</h4>
                                            <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">Chất lượng , mô tả không chính xác , giá cả</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group text-left"
                                        onClick={() => setStoreReportContent(prev => prev + "\n• Dịch vụ khách hàng kém")}
                                    >
                                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/40">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-red-500 dark:group-hover:text-red-400">Vấn đề về dịch vụ</h4>
                                            <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">Thái độ phục vụ , thời gian phản hồi</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Report Content */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Chi tiết báo cáo</Label>
                                    <span className="text-sm text-gray-700 dark:text-gray-400">Vui lòng cung cấp thông tin chi tiết</span>
                                </div>
                                <Textarea
                                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                    className="min-h-[120px] resize-none border-2 border-gray-300 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800"
                                    value={storeReportContent}
                                    onChange={(e) => setStoreReportContent(e.target.value)}
                                />
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-700" />
                                        Tệp đính kèm
                                    </Label>
                                    <span className="text-sm text-gray-700">Hỗ trợ: JPG , PNG , PDF , DOC (tối đa 5MB)</span>
                                </div>

                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                                    <div className="flex flex-col items-center gap-3">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            multiple
                                            accept="image/* ,.pdf ,.doc ,.docx"
                                        />
                                        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-full">
                                            <Upload className="w-6 h-6 text-red-500 dark:text-red-400" />
                                        </div>
                                        <div className="text-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                                disabled={isUploading}
                                                className="bg-white dark:bg-gray-800 border-2 border-red-500 dark:border-red-500/70 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 mb-2 font-semibold"
                                            >
                                                {isUploading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-red-500 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
                                                        <span>Đang tải lên...</span>
                                                    </div>
                                                ) : (
                                                    <span>Chọn tệp đính kèm</span>
                                                )}
                                            </Button>
                                            <p className="text-sm text-gray-700 dark:text-gray-400">hoặc kéo thả tệp vào đây</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Uploaded Files List */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Tệp đã tải lên ({uploadedFiles.length})</h4>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                                            {uploadedFiles.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                                                            <FileText className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                                        </div>
                                                        <span className="text-sm text-gray-900 dark:text-gray-200 truncate">{file.name}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveFile(file.id)}
                                                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStoreReportDialogOpen(false);
                                        setStoreReportContent('');
                                        setUploadedFiles([]);
                                    }}
                                    className="bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-700 font-semibold"
                                >
                                    Hủy báo cáo
                                </Button>
                                <Button
                                    onClick={handleStoreReport}
                                    disabled={isSubmittingStoreReport || !storeReportContent.trim()}
                                    className="bg-red-500 hover:bg-red-600 dark:hover:bg-red-600/90 text-white min-w-[120px] disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 font-semibold"
                                >
                                    {isSubmittingStoreReport ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Đang gửi...</span>
                                        </div>
                                    ) : (
                                        'Gửi báo cáo'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </div>
    );
} 