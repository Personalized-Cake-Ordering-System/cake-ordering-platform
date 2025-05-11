// src/data/stores.ts
export interface IStore   {
  id: number ;
  name: string ;
  avatar: string ;
  rating: number ;
  reviewCount: number ;
  distance: string ;
  priceRange: string ;
  categories: string[] ;
  openTime: string ;
  address: string ;
  isNew: boolean ;
  isFeatured: boolean ;
}

export const stores: IStore[] =  [
  {
    id: 1 ,
    name: "Bánh Mì Phương" ,
    avatar: "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D" ,
    rating: 4.9 ,
    reviewCount: 328 ,
    distance: "1.2km" ,
    priceRange: "15.000đ - 45.000đ" ,
    categories: ["Bánh mì" , "Bánh ngọt"] ,
    openTime: "07:00 - 22:00" ,
    address: "15 Lê Lợi , Quận 1 , TP.HCM" ,
    isNew: false ,
    isFeatured: true ,
  } ,
  {
    id: 2 ,
    name: "Sweet Bakery" ,
    avatar: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D" ,
    rating: 4.7 ,
    reviewCount: 156 ,
    distance: "0.8km" ,
    priceRange: "25.000đ - 75.000đ" ,
    categories: ["Bánh kem" , "Bánh ngọt"] ,
    openTime: "08:00 - 21:00" ,
    address: "42 Nguyễn Huệ , Quận 1 , TP.HCM" ,
    isNew: true ,
    isFeatured: true ,
  } ,
  {
    id: 3 ,
    name: "Tiệm Bánh Hạnh Phúc" ,
    avatar: "https://images.unsplash.com/photo-1559620192-032c4bc4674e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D" ,
    rating: 4.8 ,
    reviewCount: 412 ,
    distance: "1.5km" ,
    priceRange: "200.000đ - 450.000đ" ,
    categories: ["Bánh kem" , "Bánh sinh nhật"] ,
    openTime: "08:00 - 21:30" ,
    address: "28 Nguyễn Đình Chiểu , Quận 3 , TP.HCM" ,
    isNew: false ,
    isFeatured: true ,
  } ,
  {
    id: 4 ,
    name: "Tiệm Bánh Ngọt Minh" ,
    avatar: "https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGNha2V8ZW58MHx8MHx8fDA%3D" ,
    rating: 4.5 ,
    reviewCount: 189 ,
    distance: "2.1km" ,
    priceRange: "80.000đ - 150.000đ" ,
    categories: ["Bánh mousse" , "Bánh ngọt Pháp"] ,
    openTime: "09:00 - 20:00" ,
    address: "65 Lý Tự Trọng , Quận 1 , TP.HCM" ,
    isNew: false ,
    isFeatured: true ,
  } ,
  {
    id: 5 ,
    name: "Ngọc Bakery" ,
    avatar: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNha2V8ZW58MHx8MHx8fDA%3D" ,
    rating: 4.6 ,
    reviewCount: 231 ,
    distance: "1.8km" ,
    priceRange: "18.000đ - 40.000đ" ,
    categories: ["Bánh su kem" , "Bánh ngọt"] ,
    openTime: "06:30 - 22:00" ,
    address: "12 Trần Hưng Đạo , Quận 5 , TP.HCM" ,
    isNew: false ,
    isFeatured: true ,
  } ,
  {
    id: 6 ,
    name: "Le Petit Paris" ,
    avatar: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNha2V8ZW58MHx8MHx8fDA%3D" ,
    rating: 4.9 ,
    reviewCount: 278 ,
    distance: "2.5km" ,
    priceRange: "60.000đ - 180.000đ" ,
    categories: ["Bánh ngọt Pháp" , "Croissant"] ,
    openTime: "07:00 - 21:00" ,
    address: "56 Hồ Tùng Mậu , Quận 1 , TP.HCM" ,
    isNew: true ,
    isFeatured: true ,
  } ,
  {
    id: 7 ,
    name: "Bánh Trung Thu Kinh Đô" ,
    avatar: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNha2V8ZW58MHx8MHx8fDA%3D" ,
    rating: 4.5 ,
    reviewCount: 156 ,
    distance: "3.2km" ,
    priceRange: "45.000đ - 250.000đ" ,
    categories: ["Bánh trung thu" , "Bánh quy"] ,
    openTime: "08:00 - 20:00" ,
    address: "33 Võ Văn Tần , Quận 3 , TP.HCM" ,
    isNew: false ,
    isFeatured: true ,
  } ,
  {
    id: 8 ,
    name: "Bánh Chay Nam Từ Liêm" ,
    avatar: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGNha2V8ZW58MHx8MHx8fDA%3D" ,
    rating: 4.4 ,
    reviewCount: 112 ,
    distance: "4.5km" ,
    priceRange: "25.000đ - 65.000đ" ,
    categories: ["Bánh chay" , "Bánh thuần chay"] ,
    openTime: "07:30 - 19:30" ,
    address: "22 Phan Đăng Lưu , Quận Phú Nhuận , TP.HCM" ,
    isNew: false ,
    isFeatured: true ,
  } ,
] ;

// src/data/products.ts
export interface IProduct {
  id: number ;
  discount?: number ;
  imageUrl: string ;
  title: string ;
  store: string ;
  price: number ;
  category: string ;
  rating?: number ;
  reviewCount?: number ;
  isBestseller?: boolean ;
  isNew?: boolean ;
}

export const popularProducts: IProduct[] = [
  {
    id: 1 ,
    discount: 9 ,
    imageUrl:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D" ,
    title: "Bánh kem hoa hồng tặng người yêu" ,
    store: "Tiệm Bánh Hạnh Phúc" ,
    price: 350000 ,
    category: "BÁNH KEM" ,
    rating: 4.8 ,
    reviewCount: 124 ,
    isBestseller: true ,
    isNew: false ,
  } ,
  {
    id: 2 ,
    discount: 7 ,
    imageUrl:
      "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D" ,
    title: "Bánh mì hoa cúc truyền thống" ,
    store: "Bánh Mì Phương" ,
    price: 15000 ,
    category: "BÁNH MÌ" ,
    rating: 4.9 ,
    reviewCount: 328 ,
    isBestseller: true ,
    isNew: false ,
  } ,
  {
    id: 3 ,
    discount: 12 ,
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1713447395823-2e0b40b75a89?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D" ,
    title: "Bánh mousse chanh dây thơm ngon" ,
    store: "Tiệm Bánh Ngọt Minh" ,
    price: 120000 ,
    category: "BÁNH NGỌT" ,
    rating: 4.6 ,
    reviewCount: 87 ,
    isBestseller: false ,
    isNew: true ,
  } ,
  {
    id: 4 ,
    discount: 13 ,
    imageUrl:
      "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNha2V8ZW58MHx8MHx8fDA%3D" ,
    title: "Bánh cupcake chocolate trang trí ngộ nghĩnh" ,
    store: "Sweet Bakery" ,
    price: 35000 ,
    category: "BÁNH NGỌT" ,
    rating: 4.7 ,
    reviewCount: 65 ,
    isBestseller: false ,
    isNew: true ,
  } ,
  {
    id: 5 ,
    discount: 8 ,
    imageUrl:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNha2V8ZW58MHx8MHx8fDA%3D" ,
    title: "Bánh su kem trà xanh vỏ giòn" ,
    store: "Ngọc Bakery" ,
    price: 20000 ,
    category: "BÁNH NGỌT" ,
    rating: 4.5 ,
    reviewCount: 102 ,
    isBestseller: true ,
    isNew: false ,
  } ,
] ;

// src/data/categories.ts
export interface ICategory {
  id: number ;
  title: string ;
  storeCount: string ;
  imageUrl: string ;
  featured?: boolean ;
}

export const categoryData: ICategory[] = [
  {
    id: 1 ,
    title: "Bánh Kem" ,
    storeCount: "10+ cửa hàng" ,
    imageUrl:
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNha2V8ZW58MHx8MHx8fDA%3D" ,
    featured: true ,
  } ,
  {
    id: 2 ,
    title: "Bánh Mì" ,
    storeCount: "8+ cửa hàng" ,
    imageUrl:
      "https://images.unsplash.com/photo-1505285360-458ff677f029?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNha2UlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D" ,
    featured: true ,
  } ,
  {
    id: 3 ,
    title: "Bánh Ngọt" ,
    storeCount: "15+ cửa hàng" ,
    imageUrl:
      "https://images.unsplash.com/photo-1505066827145-34bcde228211?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNha2UlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D" ,
    featured: true ,
  } ,
  {
    id: 4 ,
    title: "Bánh Mặn" ,
    storeCount: "6+ cửa hàng" ,
    imageUrl:
      "https://images.unsplash.com/photo-1505066827145-34bcde228211?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNha2UlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D" ,
    featured: false ,
  } ,
  {
    id: 5 ,
    title: "Bánh Trung Thu" ,
    storeCount: "4+ cửa hàng" ,
    imageUrl:
      "https://images.unsplash.com/photo-1505066827145-34bcde228211?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNha2UlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D" ,
    featured: true ,
  } ,
  {
    id: 6 ,
    title: "Bánh Chay" ,
    storeCount: "3+ cửa hàng" ,
    imageUrl:
      "https://images.unsplash.com/photo-1635099605416-6f176ea64c75?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fGNha2UlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D" ,
    featured: false ,
  } ,
  {
    id: 7 ,
    title: "Cupcake" ,
    storeCount: "5+ cửa hàng" ,
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1675857867349-2f69f45aebcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGNha2UlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D" ,
    featured: true ,
  } ,
  {
    id: 8 ,
    title: "Bánh Theo Mùa" ,
    storeCount: "7+ cửa hàng" ,
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1690214491960-d447e38d0bd0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" ,
    featured: false ,
  } ,
] ;