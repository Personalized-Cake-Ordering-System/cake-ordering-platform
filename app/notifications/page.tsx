"use client";

import React, { useEffect, useState, useCallback } from "react";
import { NotificationService } from "@/services/notification.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Filter, Check, Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Footer from "@/components/shared/client/footer/footer";
import Header from "@/components/shared/client/header/header";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
    id: string;
    title: string;
    content: string;
    type: string;
    is_read: boolean;
    created_at: string;
    target_entity_id: string;
}

const NOTIFICATION_TYPES = {
    PAYMENT_SUCCESS: "Thanh toán",
    PROCESSING_ORDER: "Xử lý đơn hàng",
    READY_FOR_PICKUP: "Sẵn sàng nhận",
    COMPLETED_ORDER: "Hoàn tất",
};

const NOTIFICATION_COLORS = {
    PAYMENT_SUCCESS: "bg-green-100 text-green-800 hover:bg-green-200",
    PROCESSING_ORDER: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    READY_FOR_PICKUP: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    COMPLETED_ORDER: "bg-purple-100 text-purple-800 hover:bg-purple-200",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await NotificationService.getNotifications(currentPage, pageSize);
            setNotifications(response.payload);
            setTotalPages(response.meta_data.total_pages_count);
            setTotalItems(response.meta_data.total_items_count);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications, selectedType]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await handleMarkAsRead(notification.id);
        }
        // Navigate to the specific page based on notification type and target_entity_id
        switch (notification.type) {
            case "PAYMENT_SUCCESS":
            case "PROCESSING_ORDER":
            case "READY_FOR_PICKUP":
            case "COMPLETED_ORDER":
                window.location.href = `/notifications/${notification.id}`;
                break;
            default:
                break;
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const filteredNotifications = selectedType
        ? notifications.filter(n => n.type === selectedType)
        : notifications;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                            Thông báo
                        </h1>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
                                <Filter className="h-4 w-4" />
                                {selectedType ? NOTIFICATION_TYPES[selectedType as keyof typeof NOTIFICATION_TYPES] : "Tất cả"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedType(null)}>
                                Tất cả
                            </DropdownMenuItem>
                            {Object.entries(NOTIFICATION_TYPES).map(([type, label]) => (
                                <DropdownMenuItem
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                >
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 bg-background/50 rounded-xl border shadow-sm"
                    >
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">
                            Không có thông báo
                        </p>
                    </motion.div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {filteredNotifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={cn(
                                            "p-6 rounded-xl border shadow-sm transition-all duration-200 cursor-pointer",
                                            !notification.is_read
                                                ? "bg-background hover:shadow-md"
                                                : "bg-muted/30 hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-lg">{notification.title}</h3>
                                                <p className="text-muted-foreground">
                                                    {notification.content}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span>
                                                        {formatDistanceToNow(new Date(notification.created_at), {
                                                            addSuffix: true,
                                                            locale: vi,
                                                        })}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            "capitalize",
                                                            NOTIFICATION_COLORS[notification.type as keyof typeof NOTIFICATION_COLORS]
                                                        )}
                                                    >
                                                        {NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES]}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!notification.is_read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="hover:bg-primary/10"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-8 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Hiển thị {notifications.length} trong tổng số {totalItems} thông báo
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                >
                                    Trước
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <Button
                                            key={i}
                                            variant={currentPage === i ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(i)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
} 