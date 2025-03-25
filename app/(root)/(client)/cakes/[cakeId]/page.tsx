'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ShoppingCart,
  Heart,
  Share2,
  Clock,
  Check,
  Minus,
  Plus,
  Star,
  Truck,
  CalendarHeart,
  CircleDollarSign,
  ShieldCheck
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ModelGLB } from '@/components/3d-custom/modelGLB';
import { useInView } from 'react-intersection-observer';
import { useWishlist } from '@/app/store/useWishlist';
import { toast } from 'sonner';

const cakeData = {
  id: '1',
  name: 'Chocolate Truffle Celebration Cake',
  description: 'A luxurious chocolate cake with layers of rich chocolate ganache, decorated with chocolate truffles and edible gold dust. Perfect for special celebrations and chocolate lovers.',
  price: 69.99,
  discountPrice: 59.99,
  rating: 4.8,
  reviewCount: 124,
  images: [
    '/immagecake.jpg',
    '/immagecake1.jpeg',
    '/immagecake2.jpeg',
    '/immagecake3.jpg',
  ],
  mainImage: '/immagecake.jpg',
  model3D: '/cake3.glb',
  category: 'Premium',
  allergens: ['Dairy', 'Eggs', 'Gluten', 'Nuts'],
  nutritionalInfo: {
    calories: '350 kcal',
    fat: '18g',
    saturatedFat: '11g',
    carbohydrates: '42g',
    sugar: '28g',
    protein: '5g',
  },
  ingredients: [
    'Belgian Chocolate',
    'Organic Flour',
    'Free-range Eggs',
    'Unsalted Butter',
    'Cane Sugar',
    'Cocoa Powder',
    'Chocolate Truffles',
    'Edible Gold Dust'
  ],
  sizes: [
    { id: 'sm', name: 'Small (6")', servings: '6-8', price: 59.99 },
    { id: 'md', name: 'Medium (8")', servings: '10-12', price: 69.99 },
    { id: 'lg', name: 'Large (10")', servings: '14-16', price: 89.99 },
  ],
  flavors: [
    { id: 'choc', name: 'Dark Chocolate', image: '/imagecake.jpg' },
    { id: 'white', name: 'White Chocolate', image: '/imagecake1.jpeg' },
    { id: 'milk', name: 'Milk Chocolate', image: '/imagecake3.jpg' },
  ],
  toppings: [
    { id: 'truffle', name: 'Chocolate Truffles', price: 5.99 },
    { id: 'berries', name: 'Fresh Berries', price: 4.99 },
    { id: 'gold', name: 'Edible Gold Leaf', price: 8.99 },
  ],
  occasionTags: ['Birthday', 'Anniversary', 'Celebration', 'Corporate'],
  deliveryInfo: {
    standard: '2-3 days',
    express: 'Next day delivery available',
    freeShippingThreshold: 80,
  },
  relatedCakes: [
    { id: '2', name: 'Red Velvet Dream', image: '/imagecake1.jpeg', price: 49.99 },
    { id: '3', name: 'Vanilla Bean Elegance', image: '/imagecake2.jpeg', price: 54.99 },
    { id: '4', name: 'Strawberry Delight', image: '/imagecake3.jpg', price: 44.99 },
  ]
};

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    date: '2 weeks ago',
    rating: 5,
    comment: 'Absolutely delicious! The cake was moist and the chocolate flavor was rich without being overwhelming. Everyone at the party loved it!',
    avatar: '/imagecake1.jpeg',
  },
  {
    id: 2,
    name: 'Michael Chen',
    date: '1 month ago',
    rating: 4,
    comment: 'Great cake and beautiful presentation. Delivery was on time and the cake arrived in perfect condition. Would order again.',
    avatar: '/imagecake2.jpeg',
  },
  {
    id: 3,
    name: 'Emma Williams',
    date: '2 months ago',
    rating: 5,
    comment: 'The perfect celebration cake! Rich, decadent and absolutely worth every penny. My husband was thrilled with it for his birthday.',
    avatar: '/imagecake.jpg',
  },
];

// Add these animation variants before the CakeDetail component
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const CakeDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { cakeId } = params;

  // States for customization
  const [selectedSize, setSelectedSize] = useState(cakeData.sizes[1].id);
  const [selectedFlavor, setSelectedFlavor] = useState(cakeData.flavors[0].id);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [is3DMode, setIs3DMode] = useState(false);

  // Add these refs for scroll animations
  const [benefitsRef, benefitsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const [relatedRef, relatedInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Add wishlist state
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isInWishlistState, setIsInWishlistState] = useState(false);

  // Add useEffect to check initial wishlist state
  // useEffect(() => {
  //   setIsInWishlistState(isInWishlist(cakeData.id));
  // }, []);

  // Add wishlist toggle handler
  const handleWishlistToggle = () => {
    if (isInWishlistState) {
      removeFromWishlist(cakeData.id);
      setIsInWishlistState(false);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: cakeData.id,
        name: cakeData.name,
        price: cakeData.discountPrice || cakeData.price,
        image: cakeData.mainImage,
      });
      setIsInWishlistState(true);
      toast.success('Added to wishlist');
    }
  };

  // Calculate total price
  const getBasePrice = () => {
    const size = cakeData.sizes.find(s => s.id === selectedSize);
    return size ? size.price : cakeData.price;
  };

  const getToppingsPrice = () => {
    return selectedToppings.reduce((total, toppingId) => {
      const topping = cakeData.toppings.find(t => t.id === toppingId);
      return total + (topping ? topping.price : 0);
    }, 0);
  };

  const totalPrice = (getBasePrice() + getToppingsPrice()) * quantity;

  // Toggle toppings selection
  const toggleTopping = (toppingId: string) => {
    if (selectedToppings.includes(toppingId)) {
      setSelectedToppings(selectedToppings.filter(id => id !== toppingId));
    } else {
      setSelectedToppings([...selectedToppings, toppingId]);
    }
  };

  // Loading state simulation
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-pink-600 font-medium">Loading cake details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Back Button with hover effect */}
      <motion.div
        className="mb-6"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-pink-500 transition-colors duration-300"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Cakes
        </Button>
      </motion.div>

      {/* Update the main grid layout */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column - Images & 3D View */}
        <motion.div
          variants={fadeIn}
          className="relative"
        >
          <div className="sticky top-24">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                onClick={() => setIs3DMode(!is3DMode)}
                className="text-pink-600 border-pink-200 hover:bg-pink-50 hover:text-pink-700"
              >
                {is3DMode ? 'View Photos' : 'View in 3D'}
              </Button>
            </div>

            {/* Main Image or 3D Viewer */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-4 aspect-square relative">
              {is3DMode ? (
                <div className="w-full h-full bg-gradient-to-b from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <div className="w-full h-full">
                    <Canvas
                      camera={{ position: [0, 0, 5], fov: 75 }}
                      shadows
                    >
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 10]} />
                      <ModelGLB
                        config={{
                          size: '8"',
                          price: 95.99,
                          sponge: 'vanilla',
                          outerIcing: 'white-vanilla',
                          filling: 'white-vanilla',
                          board: 'white',
                          extras: [],
                          message: '',
                          messageType: 'none',
                          plaqueColor: 'white',
                          uploadedImage: null,
                          topping: null,
                          candles: 'none',
                          goo: 'none',
                          imageUrl: ''
                        }}
                        addToCart={() => { }}
                        editCartItem={() => { }}
                        items={[]}
                      />
                      <OrbitControls />
                    </Canvas>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <Image
                    // src={cakeData.images[selectedImage]}
                    src="/imagecake1.jpeg"
                    alt={cakeData.name}
                    fill
                    className="object-cover"
                  />

                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-pink-500 hover:bg-pink-600">Featured</Badge>
                    {cakeData.discountPrice && (
                      <Badge className="bg-red-500 hover:bg-red-600">
                        Sale
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Thumbnail Images */}
            {!is3DMode && (
              <motion.div
                className="grid grid-cols-4 gap-3"
                variants={staggerContainer}
              >
                {cakeData.images.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === index
                      ? 'border-pink-500 ring-2 ring-pink-200'
                      : 'border-transparent'
                      }`}
                  >
                    <Image
                      // src={image}
                      src='/imagecake2.jpeg'
                      alt={`${cakeData.name} ${index + 1}`}
                      width={120}
                      height={120}
                      className="object-cover w-full h-full"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Column - Add stagger animations to sections */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          {/* Product Title Section */}
          <motion.div variants={fadeIn} className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200">
                {cakeData.category}
              </Badge>

              {cakeData.occasionTags.map((tag, i) => (
                <Badge key={i} variant="outline" className="border-gray-200 dark:border-gray-700">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {cakeData.name}
            </h1>

            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(cakeData.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {cakeData.rating} ({cakeData.reviewCount} reviews)
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {cakeData.description}
            </p>

            <div className="flex items-center space-x-4 mb-8">
              {cakeData.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-pink-600">${cakeData.discountPrice}</span>
                  <span className="text-xl text-gray-400 line-through">${cakeData.price}</span>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                    {Math.round((1 - cakeData.discountPrice / cakeData.price) * 100)}% OFF
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-pink-600">${cakeData.price}</span>
              )}
            </div>
          </motion.div>

          <Separator className="mb-8" />

          {/* Customization Section - Add hover effects */}
          <motion.div variants={fadeIn} className="space-y-8">
            {/* Size Selection */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-lg font-medium mb-3">Select Size</h3>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                {cakeData.sizes.map((size) => (
                  <div key={size.id} className="relative">
                    <RadioGroupItem
                      value={size.id}
                      id={`size-${size.id}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`size-${size.id}`}
                      className="flex flex-col p-4 border-2 rounded-lg cursor-pointer hover:border-pink-200
                        peer-checked:border-pink-500 peer-checked:bg-pink-50 dark:peer-checked:bg-pink-950
                        peer-checked:text-pink-600 dark:hover:border-pink-800"
                    >
                      <span className="font-medium">{size.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Serves {size.servings} people
                      </span>
                      <span className="mt-1 font-medium">${size.price}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            {/* Flavor Selection */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-lg font-medium mb-3">Select Flavor</h3>
              <RadioGroup
                value={selectedFlavor}
                onValueChange={setSelectedFlavor}
                className="flex space-x-4"
              >
                {cakeData.flavors.map((flavor) => (
                  <div key={flavor.id} className="relative">
                    <RadioGroupItem
                      value={flavor.id}
                      id={`flavor-${flavor.id}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`flavor-${flavor.id}`}
                      className="flex flex-col items-center space-y-2 cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 
                        hover:border-pink-200 peer-checked:border-pink-500 dark:hover:border-pink-800">
                        <Image
                          src={flavor.image}
                          alt={flavor.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium peer-checked:text-pink-600">
                        {flavor.name}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            {/* Toppings Selection */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-lg font-medium mb-3">Additional Toppings (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cakeData.toppings.map((topping) => (
                  <motion.div
                    key={topping.id}
                    whileTap={{ scale: 0.97 }}
                    className={`p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
                      ${selectedToppings.includes(topping.id)
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30'
                        : 'border-gray-200 dark:border-gray-700'}`}
                    onClick={() => toggleTopping(topping.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{topping.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">+${topping.price}</p>
                      </div>
                      {selectedToppings.includes(topping.id) && (
                        <Check className="w-5 h-5 text-pink-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quantity Selector */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-lg font-medium mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Total Price */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 dark:text-gray-300">Base price:</span>
                <span>${getBasePrice().toFixed(2)}</span>
              </div>

              {getToppingsPrice() > 0 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Toppings:</span>
                  <span>+${getToppingsPrice().toFixed(2)}</span>
                </div>
              )}

              {quantity > 1 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Quantity:</span>
                  <span>×{quantity}</span>
                </div>
              )}

              <Separator className="my-3" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-pink-600">${totalPrice.toFixed(2)}</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white h-12 text-base"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={`h-12 w-12 border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-950/30 ${isInWishlistState ? 'bg-pink-50 text-pink-600' : 'text-gray-400'
                    }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlistState ? 'fill-current' : ''}`} />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Delivery Notice */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
            >
              <Clock className="h-5 w-5 text-green-500" />
              <span>Order now for delivery within {cakeData.deliveryInfo.standard}</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Tabs Section */}
      <div className="mt-16">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-flex h-auto">
            <TabsTrigger value="details" className="py-3">Details</TabsTrigger>
            <TabsTrigger value="ingredients" className="py-3">Ingredients</TabsTrigger>
            <TabsTrigger value="nutrition" className="py-3">Nutrition</TabsTrigger>
            <TabsTrigger value="reviews" className="py-3">Reviews</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {cakeData.description}
                    </p>

                    <h4 className="font-medium mb-2 mt-4">Allergens</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cakeData.allergens.map((allergen, i) => (
                        <Badge key={i} variant="secondary">
                          {allergen}
                        </Badge>
                      ))}
                    </div>

                    <h4 className="font-medium mb-2 mt-4">Perfect For</h4>
                    <div className="flex flex-wrap gap-2">
                      {cakeData.occasionTags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="border-pink-200 text-pink-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-medium flex items-center mb-2">
                        <Truck className="mr-2 h-5 w-5 text-pink-500" />
                        Delivery Information
                      </h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                        <li className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          Standard Delivery: {cakeData.deliveryInfo.standard}
                        </li>
                        <li className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          {cakeData.deliveryInfo.express}
                        </li>
                        <li className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          Free shipping on orders over ${cakeData.deliveryInfo.freeShippingThreshold}
                        </li>
                      </ul>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="storage">
                        <AccordionTrigger>Storage Instructions</AccordionTrigger>
                        <AccordionContent>
                          <p>Store in a refrigerator at 4°C. For best flavor, remove from refrigerator 30 minutes before serving. Consume within 3 days of delivery.</p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="customization">
                        <AccordionTrigger>Additional Customization</AccordionTrigger>
                        <AccordionContent>
                          <p>Need a special message on your cake? Want different decorations? Contact our customer service for additional customization options.</p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="return">
                        <AccordionTrigger>Return Policy</AccordionTrigger>
                        <AccordionContent>
                          <p>Due to the perishable nature of our products, we cannot accept returns. If youre not completely satisfied with your order, please contact us within 24 hours of receipt.</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We use only the finest ingredients to create our gourmet cakes. All ingredients are carefully sourced from trusted suppliers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {cakeData.ingredients.map((ingredient, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex items-center"
                    >
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                      <span>{ingredient}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-pink-50 dark:bg-pink-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
                    Quality Guarantee
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    All our ingredients are carefully selected to ensure freshness and quality. We never use artificial preservatives or flavors in our cakes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Nutritional Information</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  The following nutritional information is provided per serving (approx. 100g):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(cakeData.nutritionalInfo).map(([key, value], i) => (
                    <div
                      key={i}
                      className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Allergen Information</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    This product contains the following allergens:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cakeData.allergens.map((allergen, i) => (
                      <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Customer Reviews</h3>
                  <Button className="bg-pink-600 hover:bg-pink-700">Write a Review</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="col-span-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-center">
                      <h4 className="text-3xl font-bold text-pink-600 mb-2">{cakeData.rating}</h4>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(cakeData.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Based on {cakeData.reviewCount} reviews
                      </p>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const percentage = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-sm">{star}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <Image
                                src={review.avatar}
                                alt={review.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">{review.name}</h4>
                              <p className="text-sm text-gray-500">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full">
                      Load More Reviews
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Benefits Section - Add scroll animations */}
      <motion.div
        ref={benefitsRef}
        initial="hidden"
        animate={benefitsInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="mt-16 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Truck, title: "Fast Delivery", color: "pink" },
            { icon: CalendarHeart, title: "Made Fresh Daily", color: "blue" },
            { icon: CircleDollarSign, title: "100% Money Back", color: "purple" }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ scale: 1.05, y: -5 }}
              className="transform transition-all duration-300"
            >
              <Card className={`bg-${benefit.color}-50 dark:bg-${benefit.color}-950/20 border-0 
                hover:shadow-xl hover:bg-${benefit.color}-100 dark:hover:bg-${benefit.color}-950/30`}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-10 w-10 text-${benefit.color}-600 mb-4">
                    <benefit.icon className="h-full w-full" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.title === "Fast Delivery" ? `Same-day delivery available for orders placed before 12pm` :
                      benefit.title === "Made Fresh Daily" ? "Our cakes are baked fresh every morning for best quality" :
                        "Not satisfied? We offer full refunds on damaged products"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Related Products - Add scroll animations */}
      <motion.div
        ref={relatedRef}
        initial="hidden"
        animate={relatedInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="mt-16"
      >
        <motion.h2 variants={fadeIn} className="text-2xl font-bold mb-6">
          You May Also Like
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cakeData.relatedCakes.map((cake, index) => (
            <motion.div
              key={cake.id}
              variants={fadeIn}
              whileHover={{ scale: 1.05, y: -5 }}
              className="transform transition-all duration-300"
            >
              <Link href={`/cakes/${cake.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={cake.image}
                      alt={cake.name}
                      fill
                      className="object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-2">{cake.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-pink-600">${cake.price}</span>
                      <Button size="sm" variant="ghost" className="text-gray-500 p-1">
                        <ShoppingCart className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CakeDetail;