"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface CustomerData {
    name: string;
    phone: string;
    address: string;
    latitude: string;
    longitude: string;
    email: string;
    password: string;
    account_type: string;
    id: string;
    created_at: string;
    created_by: string;
    updated_at: string | null;
    updated_by: string | null;
    is_deleted: boolean;
}

export default function ProfileSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        latitude: "",
        longitude: "",
        password: ""
    });

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/sign-in");
                    return;
                }

                // Get customer ID from token
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                const customerId = tokenPayload.id;

                const response = await fetch(
                    `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/customers/${customerId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch customer data");
                }

                const data = await response.json();
                setCustomerData(data.payload);
                setFormData({
                    name: data.payload.name,
                    phone: data.payload.phone,
                    address: data.payload.address,
                    latitude: data.payload.latitude,
                    longitude: data.payload.longitude,
                    password: ""
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load profile data",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomerData();
    }, [toast, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/sign-in");
                return;
            }

            // Get customer ID from token
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const customerId = tokenPayload.id;

            const response = await fetch(
                `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/customers/${customerId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Cài đặt Hồ sơ</h1>
                    <p className="text-muted-foreground">Quản lý thông tin cá nhân và tùy chọn tài khoản của bạn</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Picture Section */}
                        <Card className="w-full md:w-1/3 h-fit">
                            <CardHeader>
                                <CardTitle>Ảnh đại diện</CardTitle>
                                <CardDescription>Thêm ảnh đại diện để cá nhân hóa tài khoản của bạn</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6">
                                <div className="relative group">
                                    <Avatar className="w-40 h-40 ring-4 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20">
                                        <AvatarImage src="/placeholder-avatar.jpg" className="object-cover" />
                                        <AvatarFallback className="text-4xl">
                                            {customerData?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full gap-2">
                                    <Camera className="w-4 h-4" />
                                    Thay đổi ảnh
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Main Settings Section */}
                        <div className="w-full md:w-2/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin cá nhân</CardTitle>
                                    <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Họ và tên</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={customerData?.email}
                                            disabled
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Địa chỉ</Label>
                                        <Textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="min-h-[120px] resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="latitude">Vĩ độ</Label>
                                            <Input
                                                id="latitude"
                                                name="latitude"
                                                value={formData.latitude}
                                                onChange={handleChange}
                                                className="h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="longitude">Kinh độ</Label>
                                            <Input
                                                id="longitude"
                                                name="longitude"
                                                value={formData.longitude}
                                                onChange={handleChange}
                                                className="h-12"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Mật khẩu mới</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="h-12"
                                            placeholder="Để trống nếu không muốn thay đổi"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-8 flex justify-end">
                                <Button type="submit" className="gap-2 h-12 px-6" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
