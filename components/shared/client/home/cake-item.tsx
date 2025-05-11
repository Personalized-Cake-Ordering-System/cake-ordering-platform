import { Button } from "@/components/ui/button" ;
import { getBakeryById } from "@/features/barkeries/actions/barkeries-action" ;
import Image from "next/image" ;
import Link from "next/link" ;

export interface CakeItemProps {
  discount?: any ;
  imageUrl: string | null ;
  title: string ;
  store: string ;
  price: any ;
  id: string ;
}

export const CakeItem: React.FC<CakeItemProps> = async ({
  discount ,
  imageUrl ,
  title ,
  store ,
  price ,
  id ,
}) => {
  const bakery = await getBakeryById(store) ;

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
      {discount && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 shadow-lg">
          Giảm {discount}%
        </div>
      )}
      <div className="relative h-72 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={300}
            height={300}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <Link href={`/cakes/${id}`}>
            <Button
              size="sm"
              className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white hover:text-red-500 transition-colors"
            >
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-gray-800 dark:text-gray-200 font-semibold text-base line-clamp-2 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          Cửa hàng: {bakery.data?.bakery_name}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-500 dark:text-red-400 font-bold text-lg">
              {price.toLocaleString()}đ
            </span>
            {discount && (
              <span className="text-gray-400 dark:text-gray-500 text-sm line-through">
                {Math.round((price * 100) / (100 - discount)).toLocaleString()}đ
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  ) ;
} ;
