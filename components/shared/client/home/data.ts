// src/data/stores.ts
export interface Store {
  id: number;
  name: string;
  rating: number;
  speciality: string;
  iconBg: string;
  iconColor: string;
}

export const featuredStores: Store[] = [
  {
    id: 1,
    name: "Tiệm Bánh Hạnh Phúc",
    rating: 5,
    speciality: "Bánh kem sinh nhật",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 2,
    name: "Bánh Mì Phương",
    rating: 4,
    speciality: "Bánh mì truyền thống",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: 3,
    name: "Tiệm Bánh Ngọt Minh",
    rating: 5,
    speciality: "Bánh mousse & bánh ngọt Pháp",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    id: 4,
    name: "Sweet Bakery",
    rating: 4,
    speciality: "Bánh cupcake & bánh ngọt",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 5,
    name: "Ngọc Bakery",
    rating: 5,
    speciality: "Bánh su kem & bánh ngọt",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    id: 6,
    name: "Le Petit Paris",
    rating: 5,
    speciality: "Bánh ngọt Pháp",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    id: 7,
    name: "Bánh Trung Thu Kinh Đô",
    rating: 4,
    speciality: "Bánh trung thu",
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    id: 8,
    name: "Bánh Chay Nam Từ Liêm",
    rating: 4,
    speciality: "Bánh chay & bánh thuần chay",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
];

// src/data/products.ts
export interface Product {
  id: number;
  discount?: number;
  imageUrl: string;
  title: string;
  store: string;
  price: number;
  category: string;
}

export const popularProducts: Product[] = [
  {
    id: 1,
    discount: 9,
    imageUrl: "/api/placeholder/300/300",
    title: "Bánh kem hoa hồng tặng người yêu",
    store: "Tiệm Bánh Hạnh Phúc",
    price: 350000,
    category: "BÁNH KEM",
  },
  {
    id: 2,
    discount: 7,
    imageUrl: "/api/placeholder/300/300",
    title: "Bánh mì hoa cúc truyền thống",
    store: "Bánh Mì Phương",
    price: 15000,
    category: "BÁNH MÌ",
  },
  {
    id: 3,
    discount: 12,
    imageUrl: "/api/placeholder/300/300",
    title: "Bánh mousse chanh dây thơm ngon",
    store: "Tiệm Bánh Ngọt Minh",
    price: 120000,
    category: "BÁNH NGỌT",
  },
  {
    id: 4,
    discount: 13,
    imageUrl: "/api/placeholder/300/300",
    title: "Bánh cupcake chocolate trang trí ngộ nghĩnh",
    store: "Sweet Bakery",
    price: 35000,
    category: "BÁNH NGỌT",
  },
  {
    id: 5,
    discount: 8,
    imageUrl: "/api/placeholder/300/300",
    title: "Bánh su kem trà xanh vỏ giòn",
    store: "Ngọc Bakery",
    price: 20000,
    category: "BÁNH NGỌT",
  },
];

// src/data/categories.ts
export interface Category {
  id: number;
  title: string;
  storeCount: string;
  imageUrl: string;
}

export const categoryData: Category[] = [
  {
    id: 1,
    title: "Bánh Kem",
    storeCount: "10+ cửa hàng",
    imageUrl: "/api/placeholder/400/400",
  },
  {
    id: 2,
    title: "Bánh Mì",
    storeCount: "8+ cửa hàng",
    imageUrl: "/api/placeholder/400/400",
  },
  {
    id: 3,
    title: "Bánh Ngọt",
    storeCount: "15+ cửa hàng",
    imageUrl: "/api/placeholder/400/400",
  },
  {
    id: 4,
    title: "Bánh Mặn",
    storeCount: "6+ cửa hàng",
    imageUrl: "/api/placeholder/400/400",
  },
  {
    id: 5,
    title: "Bánh Trung Thu",
    storeCount: "4+ cửa hàng",
    imageUrl: "/api/placeholder/400/400",
  },
  {
    id: 6,
    title: "Bánh Chay",
    storeCount: "3+ cửa hàng",
    imageUrl: "/api/placeholder/400/400",
  },
  {
    id: 7,
    title: "Cupcake",
    storeCount: "5+ cửa hàng",
    imageUrl: "/api/placeholder/400/400",
  },
  {
    id: 8,
    title: "Bánh Theo Mùa",
    storeCount: "7+ cửa hàng",
    imageUrl: "/api/placeholder/400/400",
  },
];
