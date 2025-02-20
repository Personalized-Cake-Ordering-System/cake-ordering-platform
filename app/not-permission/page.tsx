"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import gif from "@/public/images/gif/dribbble_1.gif";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function NotPermission() {
  const router = useRouter();
  const bgUrl = "/images/gif/bg.jpg";
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 md:p-8 dark:bg-gray-900">
      <Card className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="relative text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-0"></div>
              <h1
                className="text-7xl font-extrabold bg-no-repeat bg-center bg-cover text-transparent bg-clip-text relative z-10"
                style={{ backgroundImage: `url(${bgUrl})` }}
              >
                Truy cập bị từ chối
              </h1>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6 space-y-4">
            <div className="relative h-64 w-full">
              <Image
                src={gif} // Use an appropriate image representing "access denied"
                alt="Hình minh họa không có quyền"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight md:text-3xl dark:text-white">
              Bạn không có quyền truy cập vào trang này
            </h3>
            <p className="text-muted-foreground dark:text-gray-400">
              Vui lòng kiểm tra với quản trị viên nếu bạn nghĩ đây là một sự
              nhầm lẫn.
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="min-w-[200px] bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            Về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
