'use client' 

import Link from "next/link" ;
import { FooterLinkSectionProps } from "./footer-data" ;

export const FooterLinkSection = ({ title, links }: FooterLinkSectionProps) => {
  return (
    <div>
      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <div key={index}>
            <Link
              href={link.href}
              className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors duration-200"
            >
              {link.label}
            </Link>
          </div>
        ))}
      </ul>
    </div>
  ) ;
} ;
