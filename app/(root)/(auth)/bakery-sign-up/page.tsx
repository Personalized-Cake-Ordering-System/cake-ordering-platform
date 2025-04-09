"use client";
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Store, Upload, X, ImagePlus, Loader } from "lucide-react";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";

// Define the bakery registration schema
const bakerySchema = z.object({
  bakery_name: z.string().min(3, "Tên cửa hàng phải có ít nhất 3 ký tự"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.string().min(5, "Vui lòng nhập địa chỉ hợp lệ"),
  owner_name: z.string().min(3, "Tên chủ cửa hàng phải có ít nhất 3 ký tự"),
  tax_code: z.string().min(10, "Mã số thuế không hợp lệ"),
  identity_card_number: z.string().min(9, "Số CMND/CCCD không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  // Default values for coordinates
  latitude: z.string().default("0"),
  longitude: z.string().default("0"),
  // File IDs for each image type
  shop_image_file_ids: z.array(z.string()).min(1, "Cần có hình ảnh cửa hàng"),
  avatar_file_id: z.string().min(1, "Vui lòng tải lên logo cửa hàng"),
  front_card_file_id: z.string().min(1, "Vui lòng tải lên mặt trước CMND/CCCD"),
  back_card_file_id: z.string().min(1, "Vui lòng tải lên mặt sau CMND/CCCD")
});

type BakeryFormData = z.infer<typeof bakerySchema>;

/**
 * Uploads a file and returns the file ID and URL
 */
async function uploadFile(
  base64: string,
  fileName: string
): Promise<{ success: boolean, data?: { id: string, file_url: string }, error?: string }> {
  try {
    // Convert base64 to blob
    const base64Response = await fetch(base64);
    const blob = await base64Response.blob();
    
    // Create form data
    const formData = new FormData();
    formData.append("formFile", blob, fileName);
    
    // Make the API request to upload the image
    const response = await fetch("https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/files", {
      method: "POST",
      body: formData,
    });
    
    console.log(response);
    const data = await response.json();
    
    if (data.status_code === 201 || data.status_code === 200) {
      // Extract data from payload structure
      const payload = data.payload || data;
      
      // Return the file data
      return { 
        success: true, 
        data: {
          id: payload.id,
          file_url: payload.file_url,
        } 
      };
    } else {
      return { 
        success: false, 
        error: data.errors?.join(', ') || "Failed to upload file" 
      };
    }
  } catch (error: any) {
    console.error("Failed to upload file:", error);
    return { 
      success: false, 
      error: error.message || "Failed to upload file" 
    };
  }
}

// Helper function to convert file to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface ImageUploaderProps {
  label: string;
  imageUrl: string | null;
  isLoading: boolean;
  onUpload: (file: File) => Promise<void>;
  icon?: React.ReactNode;
}

const ImageUploader = ({ label, imageUrl, isLoading, onUpload, icon }: ImageUploaderProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative w-full h-40 border rounded-md border-dashed flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/30 group">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin text-custom-teal" />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={label}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 text-center px-2">
            {icon || <ImagePlus className="h-8 w-8 mb-1" />}
            <p className="text-xs">{label}</p>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => document.getElementById(`${label.replace(/\s+/g, '-').toLowerCase()}-upload`)?.click()}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? "Đang tải..." : "Chọn ảnh"}
          </Button>
        </div>
        
        <Input
          type="file"
          accept="image/*"
          id={`${label.replace(/\s+/g, '-').toLowerCase()}-upload`}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
              e.target.value = ''; // Reset input
            }
          }}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

const BakerySignUpPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Image loading states
  const [shopImageLoading, setShopImageLoading] = useState(false);
  const [avatarImageLoading, setAvatarImageLoading] = useState(false);
  const [frontCardImageLoading, setFrontCardImageLoading] = useState(false);
  const [backCardImageLoading, setBackCardImageLoading] = useState(false);
  
  // Image URLs for preview
  const [shopImageUrl, setShopImageUrl] = useState<string | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [frontCardImageUrl, setFrontCardImageUrl] = useState<string | null>(null);
  const [backCardImageUrl, setBackCardImageUrl] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit,
    formState: { errors },
    setValue,
    control
  } = useForm<BakeryFormData>({
    resolver: zodResolver(bakerySchema),
    defaultValues: {
      bakery_name: "",
      password: "",
      phone: "",
      address: "",
      owner_name: "",
      tax_code: "",
      identity_card_number: "",
      email: "",
      latitude: "0",
      longitude: "0",
      shop_image_file_ids: [],
      avatar_file_id: "",
      front_card_file_id: "",
      back_card_file_id: ""
    }
  });

  // Handle shop image upload
  const handleShopImageUpload = async (file: File) => {
    try {
      setShopImageLoading(true);
      
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setShopImageUrl(previewUrl);
      
      // Convert to base64 and upload
      const base64 = await convertFileToBase64(file);
      const result = await uploadFile(base64, `shop_${Date.now()}.jpg`);
      
      if (!result.success) {
        toast.error(result.error || "Failed to upload shop image");
        setShopImageUrl(null);
        return;
      }
      
      // Update form value with file ID
      setValue('shop_image_file_ids', [result.data!.id]);
      setShopImageUrl(result.data!.file_url);
      
      toast.success("Tải lên hình ảnh cửa hàng thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải hình ảnh cửa hàng");
      setShopImageUrl(null);
    } finally {
      setShopImageLoading(false);
    }
  };
  
  // Handle avatar image upload
  const handleAvatarImageUpload = async (file: File) => {
    try {
      setAvatarImageLoading(true);
      
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setAvatarImageUrl(previewUrl);
      
      // Convert to base64 and upload
      const base64 = await convertFileToBase64(file);
      const result = await uploadFile(base64, `avatar_${Date.now()}.jpg`);
      
      if (!result.success) {
        toast.error(result.error || "Failed to upload avatar image");
        setAvatarImageUrl(null);
        return;
      }
      
      // Update form value with file ID
      setValue('avatar_file_id', result.data!.id);
      setAvatarImageUrl(result.data!.file_url);
      
      toast.success("Tải lên logo cửa hàng thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải logo cửa hàng");
      setAvatarImageUrl(null);
    } finally {
      setAvatarImageLoading(false);
    }
  };
  
  // Handle front card image upload
  const handleFrontCardImageUpload = async (file: File) => {
    try {
      setFrontCardImageLoading(true);
      
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setFrontCardImageUrl(previewUrl);
      
      // Convert to base64 and upload
      const base64 = await convertFileToBase64(file);
      const result = await uploadFile(base64, `front_card_${Date.now()}.jpg`);
      
      if (!result.success) {
        toast.error(result.error || "Failed to upload front card image");
        setFrontCardImageUrl(null);
        return;
      }
      
      // Update form value with file ID
      setValue('front_card_file_id', result.data!.id);
      setFrontCardImageUrl(result.data!.file_url);
      
      toast.success("Tải lên mặt trước CMND/CCCD thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải mặt trước CMND/CCCD");
      setFrontCardImageUrl(null);
    } finally {
      setFrontCardImageLoading(false);
    }
  };
  
  // Handle back card image upload
  const handleBackCardImageUpload = async (file: File) => {
    try {
      setBackCardImageLoading(true);
      
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setBackCardImageUrl(previewUrl);
      
      // Convert to base64 and upload
      const base64 = await convertFileToBase64(file);
      const result = await uploadFile(base64, `back_card_${Date.now()}.jpg`);
      
      if (!result.success) {
        toast.error(result.error || "Failed to upload back card image");
        setBackCardImageUrl(null);
        return;
      }
      
      // Update form value with file ID
      setValue('back_card_file_id', result.data!.id);
      setBackCardImageUrl(result.data!.file_url);
      
      toast.success("Tải lên mặt sau CMND/CCCD thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải mặt sau CMND/CCCD");
      setBackCardImageUrl(null);
    } finally {
      setBackCardImageLoading(false);
    }
  };

  const onSubmit = async (data: BakeryFormData) => {
    console.log(data);
    setIsLoading(true);
    
    try {
      // Validate that all required images are uploaded
      if (!data.shop_image_file_ids || data.shop_image_file_ids.length === 0) {
        toast.error("Vui lòng tải lên hình ảnh cửa hàng");
        setIsLoading(false);
        return;
      }
      
      if (!data.avatar_file_id) {
        toast.error("Vui lòng tải lên logo cửa hàng");
        setIsLoading(false);
        return;
      }
      
      if (!data.front_card_file_id) {
        toast.error("Vui lòng tải lên mặt trước CMND/CCCD");
        setIsLoading(false);
        return;
      }
      
      if (!data.back_card_file_id) {
        toast.error("Vui lòng tải lên mặt sau CMND/CCCD");
        setIsLoading(false);
        return;
      }

      // Submit bakery registration
      const toastId = toast.loading("Đang đăng ký cửa hàng...");
      
      const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/bakeries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.status_code === 201 || responseData.status_code === 200) {
        toast.update(toastId, {
          render: "Đăng ký cửa hàng thành công! Vui lòng đăng nhập.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        
        // Redirect to sign-in page after successful registration
        setTimeout(() => {
          router.push('/sign-in');
        }, 3000);
      } else {
        toast.update(toastId, {
          render: 'Đăng ký thất bại: ' + (responseData.errors?.join(', ') || 'Đã xảy ra lỗi'),
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`Đăng ký thất bại: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto py-10 px-4">
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl max-w-4xl mx-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-custom-teal" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Đăng ký cửa hàng bánh
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Hoàn tất thông tin để trở thành đối tác bán bánh trên nền tảng CusCake
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Thông tin cửa hàng</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bakery_name">Tên cửa hàng</Label>
                    <Input
                      id="bakery_name"
                      placeholder="Nhập tên cửa hàng"
                      {...register("bakery_name")}
                      className="bg-white dark:bg-gray-700"
                    />
                    {errors.bakery_name && (
                      <p className="text-sm text-red-500">{errors.bakery_name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Tên chủ cửa hàng</Label>
                    <Input
                      id="owner_name"
                      placeholder="Nhập tên chủ cửa hàng"
                      {...register("owner_name")}
                      className="bg-white dark:bg-gray-700"
                    />
                    {errors.owner_name && (
                      <p className="text-sm text-red-500">{errors.owner_name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@gmail.com"
                      {...register("email")}
                      className="bg-white dark:bg-gray-700"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      {...register("password")}
                      className="bg-white dark:bg-gray-700"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      placeholder="+84xxxxxxxxx"
                      {...register("phone")}
                      className="bg-white dark:bg-gray-700"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      placeholder="Nhập địa chỉ cửa hàng"
                      {...register("address")}
                      className="bg-white dark:bg-gray-700"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tax_code">Mã số thuế</Label>
                    <Input
                      id="tax_code"
                      placeholder="Nhập mã số thuế"
                      {...register("tax_code")}
                      className="bg-white dark:bg-gray-700"
                    />
                    {errors.tax_code && (
                      <p className="text-sm text-red-500">{errors.tax_code.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="identity_card_number">Số CMND/CCCD</Label>
                    <Input
                      id="identity_card_number"
                      placeholder="Nhập số CMND/CCCD"
                      {...register("identity_card_number")}
                      className="bg-white dark:bg-gray-700"
                    />
                    {errors.identity_card_number && (
                      <p className="text-sm text-red-500">{errors.identity_card_number.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Hình ảnh cửa hàng
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUploader
                    label="Logo cửa hàng"
                    imageUrl={avatarImageUrl}
                    isLoading={avatarImageLoading}
                    onUpload={handleAvatarImageUpload}
                    icon={<Store className="h-10 w-10 text-gray-400" />}
                  />
                  
                  <ImageUploader
                    label="Hình ảnh cửa hàng"
                    imageUrl={shopImageUrl}
                    isLoading={shopImageLoading}
                    onUpload={handleShopImageUpload}
                    icon={<ImagePlus className="h-10 w-10 text-gray-400" />}
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ảnh CMND/CCCD
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUploader
                    label="Mặt trước CMND/CCCD"
                    imageUrl={frontCardImageUrl}
                    isLoading={frontCardImageLoading}
                    onUpload={handleFrontCardImageUpload}
                  />
                  
                  <ImageUploader
                    label="Mặt sau CMND/CCCD"
                    imageUrl={backCardImageUrl}
                    isLoading={backCardImageLoading}
                    onUpload={handleBackCardImageUpload}
                  />
                </div>
              </div>
              
              <div className="flex flex-col pt-6">
                <Button
                  type="submit"
                  disabled={isLoading || shopImageLoading || avatarImageLoading || frontCardImageLoading || backCardImageLoading}
                  className="w-full bg-custom-teal hover:bg-custom-teal/90 text-white rounded-lg py-2.5"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    "Đăng ký cửa hàng"
                  )}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  Bằng cách đăng ký, bạn đồng ý với các Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BakerySignUpPage; 