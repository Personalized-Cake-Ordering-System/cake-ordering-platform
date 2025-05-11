"use client" ;

import React , { useState , useCallback } from "react" ;
import Image from "next/image" ;
import Link from "next/link" ;
import { Button } from "@/components/ui/button" ;
import {
  Carousel ,
  CarouselContent ,
  CarouselItem ,
  CarouselNext ,
  CarouselPrevious ,
} from "@/components/ui/carousel" ;
import { ChevronLeft , ChevronRight , Store } from "lucide-react" ;
import { useEffect } from "react" ;
import { type CarouselApi } from "@/components/ui/carousel" ;

interface BannerSlide {
  id: number ;
  imageUrl: string ;
  label: string ;
  title: string ;
  subtitle: string ;
  price: string ;
  priceLabel: string ;
  buttonText: string ;
  buttonUrl: string ;
}

interface MainBannerProps {
  slides?: BannerSlide[] ;
}

const defaultSlides: BannerSlide[] = [
  {
    id: 1 ,
    imageUrl:
      "https://images.unsplash.com/photo-1630144252987-8733b6ac2ab8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fGNha2UlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D" ,
    label: "Cửa hàng nổi bật tháng 2" ,
    title: "Tiệm Bánh Hạnh Phúc" ,
    subtitle: "Chuyên bánh kem sinh nhật và bánh cưới" ,
    price: "320.000đ" ,
    priceLabel: "Giá chỉ từ" ,
    buttonText: "XEM CỬA HÀNG" ,
    buttonUrl: "/stores/tiem-banh-hanh-phuc" ,
  } ,
  {
    id: 2 ,
    imageUrl:
      "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D" ,
    label: "Cửa hàng yêu thích" ,
    title: "Paris Bakery" ,
    subtitle: "Bánh ngọt Pháp chính hiệu" ,
    price: "280.000đ" ,
    priceLabel: "Giá chỉ từ" ,
    buttonText: "XEM CỬA HÀNG" ,
    buttonUrl: "/stores/paris-bakery" ,
  } ,
  {
    id: 3 ,
    imageUrl:
      "https://images.unsplash.com/photo-1489790925940-daac6dcc7c7d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fGNha2UlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D" ,
    label: "Khuyến mãi tháng này" ,
    title: "Cheesecake Factory" ,
    subtitle: "Bánh phô mai thơm ngon" ,
    price: "350.000đ" ,
    priceLabel: "Giá chỉ từ" ,
    buttonText: "XEM CỬA HÀNG" ,
    buttonUrl: "/stores/cheesecake-factory" ,
  } ,
] ;

const MainBanner = ({ slides = defaultSlides }: MainBannerProps) => {
  const [api , setApi] = useState<CarouselApi>() ;
  const [current , setCurrent] = useState(0) ;

  useEffect(() => {
    if (!api) {
      return ;
    }

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap()) ;
    } ;

    api.on("select" , handleSelect) ;

    // Cleanup
    return () => {
      api.off("select" , handleSelect) ;
    } ;
  } , [api]) ;

  const goToSlide = useCallback(
    (index: number) => {
      if (api) {
        api.scrollTo(index) ;
      }
    } ,
    [api]
  ) ;

  return (
    <div className="h-full relative rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-pink-50 to-teal-50 dark:from-pink-900/30 dark:to-teal-900/30">
      <Carousel
        className="h-full w-full"
        setApi={setApi}
        opts={{
          loop: true ,
          align: "start" ,
        }}
      >
        <CarouselContent className="h-full">
          {slides.map((slide , index) => (
            <CarouselItem key={slide.id} className="h-full">
              <div className="flex h-full w-full flex-col md:flex-row">
                <div className="w-full md:w-1/2 h-52 l md:h-[480px] relative flex justify-center items-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent dark:from-black/20 dark:to-transparent z-10"></div>
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw , 50vw"
                  />
                </div>
                <div className="w-full md:w-1/2 h-full p-6 md:p-10 flex flex-col justify-center">
                  <div className="mb-2">
                    <span className="inline-block bg-custom-teal/10 text-custom-teal dark:bg-custom-teal/20 dark:text-custom-teal px-3 py-1 rounded-full text-sm font-medium">
                      {slide.label}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="bg-custom-pink/20 dark:bg-custom-pink/30 p-2 rounded-full mr-3">
                      <Store className="h-5 w-5 text-custom-teal dark:text-custom-teal" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white leading-tight">
                      {slide.title}
                    </h2>
                  </div>
                  <div className="mb-4 mt-2">
                    <span className="text-gray-700 dark:text-gray-300 text-lg">
                      {slide.subtitle}
                    </span>
                  </div>
                  <div className="mb-6 flex items-baseline">
                    <span className="text-gray-600 dark:text-gray-400">
                      {slide.priceLabel}
                    </span>
                    <span className="text-2xl md:text-3xl font-semibold text-custom-teal dark:text-custom-teal ml-2">
                      {slide.price}
                    </span>
                  </div>
                  <Link href={slide.buttonUrl}>
                    <Button className="bg-custom-teal hover:bg-custom-pink text-white w-full md:w-44 transition-colors duration-300">
                      {slide.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200 p-0"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeft className="h-6 w-6 text-custom-teal dark:text-custom-teal" />
          </Button>
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200 p-0"
            onClick={() => api?.scrollNext()}
          >
            <ChevronRight className="h-6 w-6 text-custom-teal dark:text-custom-teal" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_ , index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 p-0 rounded-full transition-colors duration-200 ${index === current
                  ? "bg-custom-teal dark:bg-custom-teal scale-125"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-custom-pink dark:hover:bg-custom-pink"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  ) ;
} ;

export default MainBanner ;
