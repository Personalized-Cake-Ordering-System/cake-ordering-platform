'use client' 

import React from 'react' 
import { FeatureBannerProps } from './footer-data'  ;

const FeatureBanner = ({
    icon ,
    title ,
    description ,
    color ,
  }:  FeatureBannerProps) => {
     return (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex items-center space-x-3 transition-all duration-300 hover:shadow-md hover:bg-white dark:hover:bg-gray-800">
          <div className={color}>{icon}</div>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          </div>
        </div>
      ) ;
  } ;

export default FeatureBanner ;