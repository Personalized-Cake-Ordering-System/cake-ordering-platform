"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CakeConfig as BaseCakeConfig } from '@/types/cake';
import { CartItem } from '@/types/cart';
import { useCart as useCartStore } from '@/app/store/useCart';

// Extended CakeConfig that includes the fields from the API
interface ExtendedCakeConfig extends BaseCakeConfig {
    name: string;
    description: string;
    type: string;
}

// Ensure CartItem uses the extended CakeConfig
interface ExtendedCartItem extends Omit<CartItem, 'config'> {
    config: ExtendedCakeConfig;
}

interface CartContextType {
    items: ExtendedCartItem[];
    addToCart: (config: ExtendedCakeConfig) => void;
    editCartItem: (id: string, newConfig: ExtendedCakeConfig) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    updateQuantity: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<ExtendedCartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const counterRef = useRef(0);
    
    // Get access to the Zustand store
    const cartStore = useCartStore();
    
    // Generate unique IDs without random values
    const generateId = () => {
        counterRef.current += 1;
        return `item-${Date.now()}-${counterRef.current}`;
    };

    // Load cart data from localStorage after component mounts
    useEffect(() => {
        // Get items from Zustand store instead of directly from localStorage
        setItems(cartStore.items as unknown as ExtendedCartItem[]);
        setIsInitialized(true);
    }, [cartStore.items]);

    const calculatePrice = (config: ExtendedCakeConfig) => {
        let basePrice = 0;

        // Base price by size
        switch (config.size) {
            case "6":
                basePrice = 45;
                break;
            case "8":
                basePrice = 65;
                break;
            case "10":
                basePrice = 85;
                break;
            default:
                basePrice = 45;
        }

        // Add extra costs
        if (config.extras) {
            basePrice += config.extras.length * 5; // £5 per extra
        }

        if (config.messageType === 'edible' && config.uploadedImage) {
            basePrice += 10; // £10 for edible image
        }

        return basePrice;
    };

    const addToCart = (config: ExtendedCakeConfig) => {
        const price = calculatePrice(config);
        const newId = generateId();
        const newItem: ExtendedCartItem = {
            id: newId,
            config,
            quantity: 1,
            price
        };
        
        // Add to local state
        setItems(prev => [...prev, newItem]);
        
        // Also add to Zustand store
        cartStore.addToCart(newItem as any);
    };

    const editCartItem = (id: string, newConfig: ExtendedCakeConfig) => {
        const price = calculatePrice(newConfig);
        
        // Update local state
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, config: newConfig, price }
                : item
        ));
        
        // Also update in Zustand store by removing and adding
        cartStore.removeFromCart(id);
        cartStore.addToCart({
            id,
            config: newConfig,
            quantity: 1, // Default quantity
            price
        } as any);
    };

    const removeFromCart = (id: string) => {
        // Update local state
        setItems(prev => prev.filter(item => item.id !== id));
        
        // Also remove from Zustand store
        cartStore.removeFromCart(id);
    };

    const clearCart = () => {
        // Update local state
        setItems([]);
        
        // Also clear Zustand store
        cartStore.clearCart();
    };

    const updateQuantity = (id: string, quantity: number) => {
        // Update local state
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, quantity }
                : item
        ));
        
        // Also update in Zustand store
        cartStore.updateQuantity(id, quantity);
    };

    return (
        <CartContext.Provider value={{ items, addToCart, editCartItem, removeFromCart, clearCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
} 