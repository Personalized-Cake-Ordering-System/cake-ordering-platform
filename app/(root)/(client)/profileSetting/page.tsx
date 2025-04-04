"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save } from "lucide-react";

export default function ProfileSettings() {
    const [name, setName] = useState("Nguyễn Văn A");
    const [email, setEmail] = useState("nguyenvana@example.com");
    const [phone, setPhone] = useState("+84 123 456 789");
    const [bio, setBio] = useState("Người yêu thích bánh ngọt và thợ làm bánh chuyên nghiệp");
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Cài đặt Hồ sơ</h1>
                    <p className="text-muted-foreground">Quản lý thông tin cá nhân và tùy chọn tài khoản của bạn</p>
                </div>

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
                                    <AvatarFallback className="text-4xl">NVA</AvatarFallback>
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
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger>
                                <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal">
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
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Số điện thoại</Label>
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Giới thiệu</Label>
                                            <Textarea
                                                id="bio"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="min-h-[120px] resize-none"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="preferences">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tùy chọn</CardTitle>
                                        <CardDescription>Tùy chỉnh trải nghiệm của bạn</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Thông báo qua Email</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Nhận thông báo qua email về đơn hàng của bạn
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications}
                                                onCheckedChange={setNotifications}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Chế độ tối</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Chuyển đổi giữa giao diện sáng và tối
                                                </p>
                                            </div>
                                            <Switch
                                                checked={darkMode}
                                                onCheckedChange={setDarkMode}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-8 flex justify-end">
                            <Button className="gap-2 h-12 px-6">
                                <Save className="w-4 h-4" />
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
