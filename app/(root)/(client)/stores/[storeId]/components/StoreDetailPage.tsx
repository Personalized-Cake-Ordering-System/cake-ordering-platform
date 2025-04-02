"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Mail, Calendar, Store, Image as ImageIcon } from 'lucide-react';
import StoreHeader from './StoreHeader';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from 'next/image';
import axios from 'axios';
import CakeCustomizer from '@/components/3d-custom/cake-customize';

// API response interfaces
interface FileData {
  file_name: string;
  file_url: string;
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  is_deleted: boolean;
}

interface BakeryData {
  bakery_name: string;
  email: string;
  phone: string;
  address: string;
  latitude?: string;
  longitude?: string;
  bank_account?: string | null;
  owner_name: string;
  avatar_file?: {
    file_url: string;
  };
  identity_card_number?: string;
  front_card_file_id?: string;
  front_card_file?: FileData;
  back_card_file_id?: string;
  back_card_file?: FileData;
  tax_code?: string;
  status: string;
  confirmed_at?: string;
  shop_image_files?: Array<{
    file_url: string;
  }>;
  id: string;
  created_at: string;
  created_by?: string;
  updated_at?: string | null;
  updated_by?: string | null;
  is_deleted?: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
}

// Store information interface
interface StoreInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ownerName: string;
  avatar: string;
  bannerImages: string[];
  status: string;
  createdAt: string;
  taxCode?: string;
}

export default function StoreDetailPage({ bakery }: { bakery: BakeryData }) {
  const [activeTab, setActiveTab] = useState('info');
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!bakery) return;

    try {
      const storeData: StoreInfo = {
        id: bakery.id,
        name: bakery.bakery_name,
        email: bakery.email,
        phone: bakery.phone,
        address: bakery.address,
        ownerName: bakery.owner_name,
        avatar: bakery.avatar_file?.file_url || '/images/default-avatar.png',
        bannerImages: [
          ...(bakery.shop_image_files?.map(img => img.file_url) || []),
          bakery.avatar_file?.file_url,
        ].filter(Boolean) as string[],
        status: bakery.status,
        createdAt: new Date(bakery.created_at).toLocaleDateString(),
        taxCode: bakery.tax_code
      };

      setStoreInfo(storeData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing bakery data:", error);
      toast({
        title: "Error processing data",
        description: "There was a problem preparing the store information",
        variant: "destructive"
      });
    }
  }, [bakery, toast]);

  if (isLoading || !storeInfo) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <StoreHeader storeInfo={storeInfo} />

      <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6 rounded-lg bg-gray-100/80 p-1">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Store className="w-3 h-3" />
            Store Info
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="w-3 h-3" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="customCake" className="flex items-center gap-2">
            <ImageIcon className="w-3 h-3" />
            Custom Cake
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-custom-teal">Store Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Store className="w-5 h-5 text-custom-teal" />
                  <div>
                    <p className="text-sm text-gray-500">Store Name</p>
                    <p className="font-medium">{storeInfo.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <MapPin className="w-5 h-5 text-custom-teal" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{storeInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-custom-teal" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{storeInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Mail className="w-5 h-5 text-custom-teal" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{storeInfo.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-custom-teal">Additional Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Calendar className="w-5 h-5 text-custom-teal" />
                  <div>
                    <p className="text-sm text-gray-500">Established</p>
                    <p className="font-medium">{storeInfo.createdAt}</p>
                  </div>
                </div>

                <div className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${storeInfo.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {storeInfo.status}
                  </span>
                </div>

                {storeInfo.taxCode && (
                  <div className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <p className="text-sm text-gray-500">Tax Code</p>
                    <p className="font-medium">{storeInfo.taxCode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-custom-teal">Store Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {storeInfo.bannerImages.map((imageUrl, index) => (
                <Dialog key={index}>
                  <DialogTrigger>
                    <div className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
                      <Image
                        src={imageUrl}
                        alt={`Store image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <div className="aspect-square w-full relative">
                      <Image
                        src={imageUrl}
                        alt={`Store image ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customCake">
          <CakeCustomizer storeId={storeInfo.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 