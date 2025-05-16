'use client' ;

import Link from 'next/link' ;
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa' ;

const Footer = () =>  {
    return (
    <footer className="bg-gradient-to-r from-pink-100 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold">Nền Tảng Đặt Bánh</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Làm cho lễ kỷ niệm của bạn ngọt ngào hơn, từng chiếc bánh một.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-gray-900 dark:text-white text-lg font-bold">Liên Kết Nhanh</h4>
            <ul className="space-y-2">
              {[
                { en: 'Home', vi: 'Trang Chủ' },
                { en: 'About', vi: 'Giới Thiệu' },
                { en: 'Menu', vi: 'Thực Đơn' },
                { en: 'Order Now', vi: 'Đặt Hàng Ngay' }
              ].map((item) => (
                <li key={item.en}>
                  <Link
                    href="/"
                    className="text-gray-600 dark:text-gray-300 hover:text-custom-teal dark:hover:text-custom-teal transition-colors"
                  >
                    {item.vi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-gray-900 dark:text-white text-lg font-bold">Liên Hệ Chúng Tôi</h4>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>Email: contact@cakeplatform.com</p>
              <p>Điện thoại: (555) 123-4567</p>
              <p>Địa chỉ: 123 Đường Bánh</p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-gray-900 dark:text-white text-lg font-bold">Bản Tin</h4>
            <p className="text-gray-600 dark:text-gray-300">Cập nhật với các ưu đãi mới nhất của chúng tôi!</p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-custom-teal"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-custom-teal hover:bg-custom-pink text-white rounded-lg font-semibold transition-colors"
              >
                Đăng Ký
              </button>
            </form>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
                <Link
                  key={index}
                  href="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-custom-teal dark:hover:text-custom-teal transition-colors"
                >
                  <Icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              © {new Date().getFullYear()} <span className="font-bold">Nền Tảng Đặt Bánh</span>. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </footer>
  ) ;
} ;

export default Footer ;
