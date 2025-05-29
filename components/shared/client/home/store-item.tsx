import React from "react" ;

export interface StoreItemProps {
  icon: React.ReactNode ;
  name: string ;
  rating: number ;
  speciality: string ;
}

export const StoreItem: React.FC<StoreItemProps> = ({
  icon ,
  name ,
  rating ,
  speciality ,
}) => {
  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-800">
      <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <span className="text-gray-800 dark:text-gray-200 font-semibold text-lg text-center">
        {name}
      </span>
      <div className="flex items-center mt-3 space-x-0.5">
        {[...Array(5)].map((_ , i) => {
          const starValue = i + 1;
          const isHalfStar = rating >= starValue - 0.5 && rating < starValue;
          const isFullStar = rating >= starValue;
          
          return (
            <svg
              key={i}
              className={`w-5 h-5 transition-colors duration-300 ${
                isFullStar 
                  ? "text-yellow-400 fill-yellow-400"
                  : isHalfStar
                  ? "text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
              fill={isFullStar ? "currentColor" : "none"}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          );
        })}
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          ({rating.toFixed(1)})
        </span>
      </div>
      <span className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">
        {speciality}
      </span>
    </div>
  ) ;
} ;
