"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import gif from "@/public/images/gif/dribbble_1.gif";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useRouter } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';

export default function NotFound() {
  const router = useRouter();
  const bgUrl = '/images/gif/bg.jpg'; 

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8 dark:bg-gray-900">
      <Card className="w-full max-w-3xl bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="relative text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-0"></div>
              <h1 
                className="text-8xl font-montserrat font-black bg-no-repeat bg-center bg-cover text-transparent bg-clip-text relative z-10"
                style={{ backgroundImage: `url(${bgUrl})` }}
              >
                Ôi!! Lỗi 404
              </h1>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6 space-y-4">
            <div className="relative h-64 w-full">
              <Image
                src={gif}
                alt="Hình minh họa lỗi"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight md:text-3xl dark:text-white">
              Trang không tồn tại
            </h3>
            <p className="text-muted-foreground dark:text-gray-400">
              Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="min-w-[200px] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}