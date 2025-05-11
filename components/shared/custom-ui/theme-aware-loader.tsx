"use client" ;

import { useTheme } from "next-themes" 
import { useEffect, useState } from "react" 
import NextTopLoader from "nextjs-toploader" 

export function ThemeAwareLoader() {
  const { theme } = useTheme() 
  const [mounted, setMounted] = useState(false) 
  
  // Only show the loader once the component has mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true) 
  }, []) 
  
  if (!mounted) {
    return null 
  }
  
  const loaderColor = theme === "dark" ? "#E87931" : "#14b8a6" 
  
  return (
    <NextTopLoader
      height={5}
      color={loaderColor}
      shadow="0 0 10px #E87931, 0 0 5px #E87931"
    />
  ) 
} 