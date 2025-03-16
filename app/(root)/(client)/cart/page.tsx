'use client'
import * as React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  },
  exit: {
    y: -20,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3 }
  }
};

const CartPage = () => {
  const { items, removeFromCart, updateQuantity } = useCart();
  const [showCakeModal, setShowCakeModal] = React.useState(false);
  const [selectedCake, setSelectedCake] = React.useState(null);

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      updateQuantity(id, Math.max(1, item.quantity + change));
    }
  };

  const handleRemoveItem = (id: string) => {
    const element = document.getElementById(`cart-item-${id}`);
    if (element) {
      element.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.transform = 'translateX(100px)';
      element.style.opacity = '0';

      setTimeout(() => {
        removeFromCart(id);
      }, 500);
    } else {
      removeFromCart(id);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.config.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const delivery = 5.99;
  const total = subtotal + tax + delivery;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content - Cart items */}
        <motion.div
          className="w-full md:w-2/3"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <Badge variant="outline" className="px-3 py-1 text-base">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </Badge>
          </div>

          {items.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg text-center"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                bounce: 0.3
              }}
            >
              <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Looks like you haven't added any cakes to your cart yet.</p>
              <Button asChild>
                <Link href="/customizeCake">
                  Customize a Cake
                </Link>
              </Button>
            </motion.div>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    id={`cart-item-${item.id}`}
                    variants={itemVariants}
                    layout
                    className="group"
                  >
                    <Card className="overflow-hidden border-muted/50 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5">
                      <div className="flex flex-col sm:flex-row p-4 gap-4">
                        <motion.div
                          className="relative w-full sm:w-1/4 h-40 sm:h-auto rounded-md overflow-hidden bg-muted/30 cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onClick={() => {
                            setSelectedCake(item);
                            setShowCakeModal(true);
                          }}
                        >
                          {item.config.imageUrl ? (
                            <Image
                              src={item.config.imageUrl}
                              alt={`Custom ${item.config.size} Cake`}
                              fill
                              className="object-cover transition-transform hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200" />
                          )}
                        </motion.div>
                        <div className="flex flex-col sm:flex-1 justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <h3 className="text-xl font-medium">Custom {item.config.size} Cake</h3>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Trash2 className="w-5 h-5" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remove item</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </motion.button>
                            </div>
                            <p className="text-muted-foreground mt-1 mb-4 text-sm">
                              {item.config.sponge} sponge with {item.config.filling} filling
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-1 border rounded-md">
                              <motion.button
                                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuantityChange(item.id, -1)}
                                className="p-2"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>
                              <span className="px-4">{item.quantity}</span>
                              <motion.button
                                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="p-2"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">${(item.config.price * item.quantity).toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground">${item.config.price.toFixed(2)} each</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <Button variant="link" className="h-auto p-0 flex items-center text-primary" asChild>
                          <Link href={`/customizeCake?editId=${item.id}`}>
                            Edit custom cake
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </motion.div>

        {/* Order summary */}
        <motion.div
          className="w-full md:w-1/3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.4
          }}
        >
          <Card className="sticky top-24 border-muted/50">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>${delivery.toFixed(2)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <motion.div
                whileHover={{
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold shadow-lg transition-all duration-500 hover:shadow-xl hover:shadow-primary/20"
                  disabled={items.length === 0}
                  asChild
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </motion.div>

              <div className="flex justify-center mt-4">
                <Button variant="link" className="text-sm" asChild>
                  <Link href="/customizeCake">Continue Shopping</Link>
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-2">Accepted Payment Methods</h3>
                <div className="flex items-center space-x-3">
                  {/* Payment method icons - placeholders */}
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs">Visa</div>
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs">MC</div>
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs">Amex</div>
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs">PayPal</div>
                </div>
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                <p>Free delivery on orders over $50. Delivery time may vary based on location.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {showCakeModal && selectedCake && (
        <Dialog open={showCakeModal} onOpenChange={setShowCakeModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Custom {selectedCake.config.size} Cake Details</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-64">
              {selectedCake.config.imageUrl ? (
                <Image
                  src={selectedCake.config.imageUrl}
                  alt={`Custom ${selectedCake.config.size} Cake`}
                  fill
                  className="object-cover rounded-md"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 rounded-md" />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Specifications:</h4>
                <p className="text-sm text-muted-foreground">
                  Size: {selectedCake.config.size}<br />
                  Sponge: {selectedCake.config.sponge}<br />
                  Filling: {selectedCake.config.filling}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Price:</h4>
                <p className="text-sm text-muted-foreground">
                  ${selectedCake.config.price} each<br />
                  Quantity: {selectedCake.quantity}<br />
                  Total: ${(selectedCake.config.price * selectedCake.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CartPage;