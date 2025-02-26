import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";

export interface CakeItemProps {
  discount?: number;
  imageUrl: string;
  title: string;
  store: string;
  price: number;
}

export const CakeItem: React.FC<CakeItemProps> = ({
  discount,
  imageUrl,
  title,
  store,
  price,
}) => {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm group">
      {discount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
          Giảm {discount}%
        </div>
      )}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={300}
          height={300}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-gray-800 mr-2"
          >
            <Heart className="h-4 w-4 mr-1" />
            Yêu thích
          </Button>
          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-gray-800 dark:text-gray-200 font-medium text-sm line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          Cửa hàng: {store}
        </p>
        <div className="mt-2 flex items-center">
          <span className="text-red-500 dark:text-red-400 font-semibold">
            {price.toLocaleString()}đ
          </span>
          {discount && (
            <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm line-through">
              {Math.round((price * 100) / (100 - discount)).toLocaleString()}đ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
