'use client'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { EyeIcon, Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

// Sample data - replace with actual data from your API
const cakeCategories = [
  { id: 1, name: 'Birthday', icon: '🎂' },
  { id: 2, name: 'Wedding', icon: '💍' },
  { id: 3, name: 'Anniversary', icon: '🎊' },
  { id: 4, name: 'Custom', icon: '✨' },
  { id: 5, name: 'Special Occasion', icon: '🎉' },
];

const featuredCakes = [
  {
    id: 1,
    name: 'Chocolate Fantasy',
    image: '/imagecake3.jpg',
    price: 49.99,
    rating: 4.8,
    category: 'Birthday',
    isNew: true,
    discount: null,
  },
  {
    id: 2,
    name: 'Vanilla Elegance',
    image: '/imagecake1.jpeg',
    price: 59.99,
    rating: 4.7,
    category: 'Wedding',
    isNew: false,
    discount: 10,
  },
  {
    id: 3,
    name: 'Strawberry Delight',
    image: '/imagecake2.jpeg',
    price: 44.99,
    rating: 4.9,
    category: 'Anniversary',
    isNew: false,
    discount: null,
  },
  {
    id: 4,
    name: 'Tiramisu Dream',
    image: '/imagecake1.jpeg',
    price: 54.99,
    rating: 4.6,
    category: 'Custom',
    isNew: true,
    discount: 15,
  },
  {
    id: 5,
    name: 'Red Velvet Passion',
    image: '/imagecake3.jpg',
    price: 39.99,
    rating: 4.5,
    category: 'Birthday',
    isNew: false,
    discount: null,
  },
  {
    id: 6,
    name: 'Fruit Paradise',
    image: '/imagecake.jpg',
    price: 49.99,
    rating: 4.7,
    category: 'Special Occasion',
    isNew: false,
    discount: 5,
  },
];

const MultiCakes = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [cakes, setCakes] = React.useState(featuredCakes);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsLoaded(true);

    if (selectedCategory) {
      setCakes(featuredCakes.filter(cake => cake.category === selectedCategory));
    } else {
      setCakes(featuredCakes);
    }
  }, [selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Explore Our Delicious Cakes
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Discover our handcrafted collection of beautiful cakes for every occasion.
          From birthdays to weddings, we've got the perfect sweet treat for your celebration.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            Custom Order
          </Button>
          <Button size="lg" variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950">
            See Bestsellers
          </Button>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Categories</h2>
        <div className="flex overflow-x-auto py-2 space-x-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => filterByCategory(null)}
            className={`px-4 py-2 rounded-full ${!selectedCategory
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            All
          </motion.button>

          {cakeCategories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => filterByCategory(category.name)}
              className={`px-4 py-2 rounded-full flex items-center ${selectedCategory === category.name
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Cakes Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {cakes.map((cake) => (
          <motion.div
            key={cake.id}
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="h-full"
          >
            <Link href={`/cakes/${cake.id}`}>
              <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <div className="relative">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={cake.image}
                      alt={cake.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>

                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {cake.isNew && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
                    )}
                    {cake.discount && (
                      <Badge className="bg-red-500 hover:bg-red-600">-{cake.discount}%</Badge>
                    )}
                  </div>

                  {/* Quick action buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white dark:bg-gray-900 rounded-full p-2 shadow-md hover:bg-pink-50 dark:hover:bg-pink-900"
                    >
                      <Heart className="h-5 w-5 text-pink-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white dark:bg-gray-900 rounded-full p-2 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900"
                    >
                      <EyeIcon className="h-5 w-5 text-blue-500" />
                    </motion.button>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-semibold">{cake.name}</CardTitle>
                    <Badge variant="outline" className="bg-transparent border-pink-200 text-pink-500">
                      {cake.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(cake.rating) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({cake.rating})</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Perfect for celebrations and special occasions
                  </p>
                </CardContent>

                <CardFooter className="flex justify-between items-center pt-0">
                  <div className="flex items-center">
                    {cake.discount ? (
                      <>
                        <span className="text-lg font-bold text-pink-600">
                          ${(cake.price * (1 - cake.discount / 100)).toFixed(2)}
                        </span>
                        <span className="ml-2 text-sm text-gray-400 line-through">
                          ${cake.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-pink-600">${cake.price.toFixed(2)}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full bg-pink-500 hover:bg-pink-600"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Custom 3D Cake Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-20 mb-16 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <Badge className="mb-4 w-fit bg-white/20 hover:bg-white/30 text-white">New Feature</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Design Your Dream Cake in 3D
            </h2>
            <p className="text-white/80 mb-6">
              Unleash your creativity with our interactive 3D cake designer. Customize every detail from flavors to decorations and see your creation come to life!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-100"
              >
                Start Designing
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                See Examples
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto overflow-hidden">
            <motion.div
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Image
                src="/api/placeholder/500/500"
                alt="3D Cake Designer"
                width={400}
                height={400}
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Popular Combinations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold mb-8 text-center">Popular Combinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Birthday Bundle", desc: "Cake + Candles + Party Hats", icon: "🎂", color: "from-blue-500 to-purple-500" },
            { name: "Wedding Collection", desc: "3-Tier Cake + Toppers + Cake Stand", icon: "💍", color: "from-pink-500 to-red-500" },
            { name: "Celebration Pack", desc: "Cake + 12 Cupcakes + Gift Box", icon: "🎉", color: "from-green-500 to-teal-500" }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className={`rounded-xl p-6 bg-gradient-to-r ${item.color} text-white shadow-lg`}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-white/80 mb-4">{item.desc}</p>
              <Button variant="outline" className="border-white text-white hover:bg-white/20">
                View Details
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Newsletter Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 md:p-12 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter for exclusive offers, new cake designs, and baking tips.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-grow px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
          />
          <Button className="bg-pink-500 hover:bg-pink-600">
            Subscribe
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default MultiCakes;