import { Card , CardContent } from "@/components/ui/card" ;
import Image from "next/image" ;

export interface CategoryItemProps {
  title: string ;
  storeCount: string ;
  imageUrl: string ;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  title ,
  storeCount ,
  imageUrl ,
}) => {
  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
      <CardContent className="p-0">
        <div className="relative h-40">
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={400}
            className="object-cover w-full h-full"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
             <div className="p-4 text-white">
               <h3 className="font-bold text-lg">{title}</h3>
               <p className="text-sm">{storeCount}</p>
            </div>
          </div>
        </div>
       </CardContent>
     </Card>
  ) ;
} ;
