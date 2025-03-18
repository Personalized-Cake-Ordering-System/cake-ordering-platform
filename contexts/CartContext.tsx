"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CakeConfig } from '@/types/cake';

interface CartItem {
    id: string;
    config: CakeConfig;
    quantity: number;
    timestamp: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (config: CakeConfig) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    editCartItem: (id: string, newConfig: CakeConfig) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(items));
        } catch (error) {
            // Handle localStorage quota exceeded error
            if (error instanceof Error) {
                console.warn('Failed to save cart to localStorage:', error.message);
            }
            // Optionally, you could try to clear some space or implement a fallback storage strategy
        }
    }, [items]);

    const addToCart = (config: CakeConfig) => {
        try {
            setItems(prev => [
                ...prev,
                {
                    id: `cake-${Date.now()}`,
                    config,
                    quantity: 1,
                    timestamp: Date.now()
                }
            ]);
        } catch (error) {
            console.warn('Failed to add item to cart:', error);
            // Optionally show a user-friendly error message
        }
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const editCartItem = (id: string, newConfig: CakeConfig) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id
                    ? { ...item, config: newConfig }
                    : item
            )
        );
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, editCartItem }}>
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