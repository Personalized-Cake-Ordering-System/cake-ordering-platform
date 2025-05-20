
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, CheckCircle, Clock, Loader2, Ticket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSignalR } from "@/contexts/SingalRContext";

// Function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

const LoadingQR = () => (
  <div className="w-[300px] h-[300px] mx-auto flex items-center justify-center bg-muted/10 rounded-lg">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

const QRPaymentPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { message } = useSignalR();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(() => {
    // Get remaining time from localStorage or default to 15 minutes
    const savedCountdown = localStorage.getItem('paymentCountdown');
    const savedTimestamp = localStorage.getItem('paymentTimestamp');

    if (savedCountdown && savedTimestamp) {
      const elapsedTime = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const remainingTime = Math.max(0, parseInt(savedCountdown) - elapsedTime);
      return remainingTime;
    }
    return 900; // 15 minutes in seconds
  });
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // Add VND currency formatter
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Add animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    // Get order details from localStorage
    const savedOrder = localStorage.getItem("currentOrder");
    if (savedOrder) {
      setOrderDetails(JSON.parse(savedOrder));
    } else {
      console.error("No order data found in localStorage");
      // Show error toast when no order data is found
      toast({
        title: "Lỗi tải dữ liệu đơn hàng",
        description: "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.",
        duration: 3000,
        variant: "destructive"
      });
      // Redirect to checkout after a delay
      setTimeout(() => router.push('/checkout'), 3000);
    }

    // Get JWT token from localStorage
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log("JWT Token found in accessToken, decoding...");
      const decodedToken = decodeJWT(token);
      if (decodedToken && decodedToken.id) {
        console.log("Decoded user ID:", decodedToken.id);
        setUserId(decodedToken.id);
      } else {
        console.error("Failed to decode token or no ID found");
      }
    } else {
      console.error("No JWT token found in accessToken");
    }

    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCountdown = prev <= 1 ? 0 : prev - 1;
        // Save current countdown and timestamp to localStorage
        localStorage.setItem('paymentCountdown', newCountdown.toString());
        localStorage.setItem('paymentTimestamp', Date.now().toString());

        if (newCountdown === 0) {
          clearInterval(timer);
          // Redirect to checkout when time runs out
          toast({
            title: "Hết thời gian thanh toán",
            description: "Vui lòng thử lại.",
            variant: "destructive"
          });
          // Chỉ xóa thông tin thời gian thanh toán, không xóa giỏ hàng
          localStorage.removeItem('paymentCountdown');
          localStorage.removeItem('paymentTimestamp');
          setTimeout(() => router.push('/checkout'), 2000);
        }
        return newCountdown;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      // Clean up localStorage when component unmounts
      if (paymentSuccess) {
        localStorage.removeItem('paymentCountdown');
        localStorage.removeItem('paymentTimestamp');
      }
    };
  }, [router, toast, paymentSuccess]);

  const handlePaymentSuccess = useCallback((orderCode: string) => {
    console.log("Payment success handler called for order:", orderCode);
    setPaymentSuccess(true);
    console.log(
      "Payment success detected for user:",
      userId,
      "order:",
      orderCode
    );

    // Show success toast
    toast({
      title: "Thanh toán thành công",
      description: "Đơn hàng của bạn đã được thanh toán thành công.",
      duration: 2000,
    });

    // Redirect after toast is shown
    console.log("Starting redirect timer...");
    setTimeout(() => {
      console.log("Attempting to redirect to payment-success page...");
      try {
        router.push("/payment-success");
        console.log("Next.js router redirect attempted");

        // Fallback to window.location after a short delay
        setTimeout(() => {
          if (window.location.pathname !== "/payment-success") {
            console.log("Using window.location as fallback");
            window.location.href = "/payment-success";
          }
        }, 500);
      } catch (error) {
        console.error("Error during redirect:", error);
        window.location.href = "/payment-success";
      }
    }, 2000);
  }, [userId, router, toast]);

  // Handle SignalR message for payment success
  useEffect(() => {
    if (message && message.Type === "PAYMENT_SUCCESS") {
      handlePaymentSuccess(message.OrderCode);
    }
  }, [message, handlePaymentSuccess]);

  const handleBackToCheckout = () => {
    router.push("/checkout");
  };

  const copyOrderCode = () => {
    if (orderDetails?.orderInfo.orderCode) {
      navigator.clipboard.writeText(orderDetails.orderInfo.orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Add useEffect to handle payment success
  useEffect(() => {
    if (paymentSuccess) {
      console.log("Payment success state changed, cleaning up...");
      // Clear the current order from localStorage
      localStorage.removeItem("currentOrder");
    }
  }, [paymentSuccess]);

  if (!orderDetails) return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Đang tải thông tin thanh toán...</h2>
        <p className="text-muted-foreground">Vui lòng đợi hoặc quay lại trang thanh toán nếu không có gì hiển thị.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/checkout')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại thanh toán
        </Button>
      </Card>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          onClick={handleBackToCheckout}
          className="mb-6 flex items-center hover:scale-105 transition-transform"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại thanh toán
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              >
                Quét mã để thanh toán
              </motion.h2>
              <motion.div
                className="relative w-[300px] h-[300px] mx-auto mb-6 bg-white p-4 rounded-lg shadow-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {isLoading && <LoadingQR />}
                <Image
                  src={orderDetails.qrLink}
                  alt="Mã QR thanh toán"
                  fill
                  className={`object-contain ${isLoading ? "hidden" : ""}`}
                  onLoadingComplete={() => setIsLoading(false)}
                  onError={(e) => {
                    console.error("Lỗi tải hình ảnh QR:", e);
                    setIsLoading(false);
                  }}
                  priority
                />
              </motion.div>

              <motion.div
                className="flex items-center justify-center space-x-4 mb-6"
                animate={{ scale: countdown < 300 ? [1, 1.1, 1] : 1 }}
                transition={{
                  duration: 0.5,
                  repeat: countdown < 300 ? Infinity : 0,
                  repeatType: "reverse",
                }}
              >
                <Clock
                  className={`h-5 w-5 ${countdown < 300 ? "text-red-500" : "text-yellow-500"
                    }`}
                />
                <span
                  className={`font-medium ${countdown < 300 ? "text-red-500" : ""
                    }`}
                >
                  Thời gian thanh toán còn lại: {formatTime(countdown)}
                </span>
              </motion.div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Mã đơn hàng:
                  </span>
                  <div className="flex items-center">
                    <span className="font-mono mr-2">
                      {orderDetails.orderInfo.orderCode}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyOrderCode}
                      className="h-8 w-8 p-0"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Số tiền:
                  </span>
                  <span className="font-bold text-lg">
                    {formatVND(orderDetails.orderInfo.total)}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mt-4">
                  <p>1. Mở ứng dụng ngân hàng của bạn</p>
                  <p>2. Chọn &quot;Quét mã QR&quot;</p>
                  <p>3. Quét mã QR này</p>
                  <p>4. Xác nhận thanh toán</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Order Details Section */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              Chi tiết đơn hàng
            </motion.h2>

            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Tên:</span>{" "}
                    {orderDetails.customerInfo.fullName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {orderDetails.customerInfo.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Điện thoại:</span>{" "}
                    {orderDetails.customerInfo.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Địa chỉ:</span>{" "}
                    {orderDetails.customerInfo.address}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Sản phẩm</h3>
                <div className="space-y-4">
                  {orderDetails.orderInfo.items.map(
                    (item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          {item.main_image?.file_url ? (
                            <Image
                              src={item.main_image.file_url}
                              alt={item.cake_name}
                              fill
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted rounded-md" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.cake_name}</p>
                          {/* <p className="text-sm text-muted-foreground">
                            {item.cake_note || "Không có ghi chú đặc biệt"}
                          </p> */}
                        </div>

                        <div className="text-right">
                          <p className="font-medium">
                            {formatVND(item.sub_total_price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            SL: {item.quantity}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tổng tiền sản phẩm</span>
                    <span>{formatVND(orderDetails.orderInfo.totalProductPrice)}</span>
                  </div>

                  {orderDetails.orderInfo.voucher && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Giảm {orderDetails.orderInfo.voucher.discount_percentage}%
                      </span>
                      <span className="text-primary">
                        -{formatVND(orderDetails.orderInfo.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      Phí vận chuyển ({orderDetails.orderInfo.shippingDistance.toFixed(1)} km)
                    </span>
                    <span>{formatVND(orderDetails.orderInfo.shippingFee)}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between font-bold">
                    <span>Tổng thanh toán</span>
                    <span>{formatVND(orderDetails.orderInfo.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QRPaymentPage;
