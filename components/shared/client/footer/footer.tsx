"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";
import {
  contactInfoItems,
  features,
  footerSections,
  socialLinks,
} from "./footer-data";
import FeatureBanner from "./feature-banner";
import { FooterLinkSection } from "./footer-link";

const Footer = () => {
  return (
    <footer className="mt-16 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Features Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((feature, index) => (
            <FeatureBanner
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <div className="relative w-10 h-10 mr-2">
                <div className="absolute inset-0 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold dark:text-white">Cuscake</h1>
                <p className="text-xs tracking-widest text-gray-500 dark:text-gray-400">
                  SÀN BÁNH NGON
                </p>
              </div>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Website mua sắm bánh ngọt chất lượng cao với đa dạng loại bánh từ
              các cửa hàng uy tín tại Việt Nam
            </p>

            <div className="space-y-2">
              {contactInfoItems.map((item, index) => (
                <div key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                  <div className="min-w-8 text-green-500">{item.icon}</div>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section, index) => (
            <FooterLinkSection key={index} title={section.title} links={section.links} />
          ))}
        </div>
      </div>

      {/* Copyright and Social */}
      <div className="container mx-auto px-4 py-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
            © 2025, BÁNHNGON - Sàn bánh ngọt. Tất cả quyền được bảo lưu.
          </p>

          <div className="flex items-center space-x-4">
            <p className="text-gray-800 dark:text-gray-200 font-medium mr-2">
              Theo dõi chúng tôi:
            </p>
            {socialLinks.map((socialLink, index) => (
              <Link
                key={index}
                href={socialLink.href}
                className={cn(socialLink.bgColor, socialLink.hoverColor, "text-white p-2 rounded-full transition-colors duration-200")}
              >
                {socialLink.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
