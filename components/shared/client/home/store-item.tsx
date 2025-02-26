import React from "react";

export interface StoreItemProps {
  icon: React.ReactNode;
  name: string;
  rating: number;
  speciality: string;
}

export const StoreItem: React.FC<StoreItemProps> = ({
  icon,
  name,
  rating,
  speciality,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center transition-all hover:shadow-md cursor-pointer">
      <div className="mb-3">{icon}</div>
      <span className="text-gray-800 dark:text-gray-200 font-medium text-center">
        {name}
      </span>
      <div className="flex items-center mt-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
      <span className="text-gray-500 dark:text-gray-400 text-xs mt-1">
        {speciality}
      </span>
    </div>
  );
};
