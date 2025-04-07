"use client";

import React, { useEffect, useState } from "react";
import { Bell, Check, Filter, X } from "lucide-react";
import { NotificationService } from "@/services/notification.service";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

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

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await NotificationService.getNotifications();
            setNotifications(response.payload);
            setUnreadCount(response.payload.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
            // Update UI state even if API call fails
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const filteredNotifications = selectedType
        ? notifications.filter(n => n.type === selectedType)
        : notifications;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-80 max-h-[500px] overflow-y-auto bg-white shadow-lg"
                align="end"
            >
                <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-medium">Thông báo</span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => window.location.href = "/notifications"}
                        >
                            Xem tất cả
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7">
                                    <Filter className="h-4 w-4 mr-2" />
                                    {selectedType ? NOTIFICATION_TYPES[selectedType as keyof typeof NOTIFICATION_TYPES] : "Tất cả"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
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
                </div>
                <DropdownMenuSeparator />

                {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Đang tải thông báo...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Không có thông báo
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={cn(
                                "flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-gray-100",
                                !notification.is_read && "bg-muted/50"
                            )}
                            onClick={() => {
                                handleMarkAsRead(notification.id);
                                // Navigate to notification details page
                                // window.location.href = `/notifications/${notification.id}`;
                            }}
                        >
                            <div className="flex items-start justify-between w-full">
                                <div className="flex-1">
                                    <p className="font-medium">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {notification.content}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <Badge variant="secondary" className="ml-2">
                                        Mới
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                                <span>
                                    {formatDistanceToNow(new Date(notification.created_at), {
                                        addSuffix: true,
                                        locale: vi,
                                    })}
                                </span>
                                <span className="capitalize">
                                    {NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES]}
                                </span>
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 