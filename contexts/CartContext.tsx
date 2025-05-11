"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CakeConfig } from '@/types/cake';
import { CartItem } from '@/types/cart';

interface CartContextType {
    items: CartItem[];
    addToCart: (config: CakeConfig) => void;
    editCartItem: (id: string, newConfig: CakeConfig) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    updateQuantity: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const counterRef = useRef(0);
    
    // Generate unique IDs without random values
    const generateId = () => {
        counterRef.current += 1;
        return `item-${Date.now()}-${counterRef.current}`;
    };

    // Load cart data from localStorage after component mounts
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.warn('Failed to parse cart data:', error);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save cart data to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            try {
                localStorage.setItem('cart', JSON.stringify(items));
            } catch (error) {
                console.warn('Failed to save cart to localStorage:', error);
            }
        }
    }, [items, isInitialized]);

    const calculatePrice = (config: CakeConfig) => {
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

    const addToCart = (config: CakeConfig) => {
        const price = calculatePrice(config);
        const newId = generateId() ;
        setItems(prev => [...prev, {
            id: newId,
            config,
            quantity: 1,
            price
        }]);
    };

    const editCartItem = (id: string, newConfig: CakeConfig) => {
        const price = calculatePrice(newConfig);
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, config: newConfig, price }
                : item
        ));
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const updateQuantity = (id: string, quantity: number) => {
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, quantity }
                : item
        ));
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