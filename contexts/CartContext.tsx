"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CakeConfig as BaseCakeConfig } from '@/types/cake';
import { CartItem } from '@/types/cart';
import { useCart as useCartStore } from '@/app/store/useCart';
import { toast } from 'sonner';

// Extended CakeConfig that includes the fields from the API
interface ExtendedCakeConfig extends BaseCakeConfig {
    name: string;
    description: string;
    type: string;
}

// Ensure CartItem uses the extended CakeConfig
interface ExtendedCartItem extends Omit<CartItem, 'config'> {
    config: ExtendedCakeConfig;
    bakeryId?: string;
}

interface CartContextType {
    items: ExtendedCartItem[];
    addToCart: (config: ExtendedCakeConfig, bakeryId?: string) => boolean;
    editCartItem: (id: string, newConfig: ExtendedCakeConfig) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    deleteCartAPI: () => Promise<boolean>;
    updateQuantity: (id: string, quantity: number) => void;
    changeBakery: (bakeryId: string, clearExisting?: boolean) => Promise<boolean>;
    currentBakeryId: string | null;
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

    const addToCart = (config: ExtendedCakeConfig, bakeryId?: string) => {
        const price = calculatePrice(config);
        
        // Check if item with same config already exists
        const existingItem = items.find(item => 
            item.config.name === config.name && 
            item.bakeryId === (bakeryId || '')
        );
        
        if (existingItem) {
            // Update quantity instead of adding new item
            updateQuantity(existingItem.id, existingItem.quantity + 1);
            return true;
        }
        
        const newId = generateId();
        
        // Create the cart item
        const newItem: ExtendedCartItem = {
            id: newId,
            config,
            quantity: 1,
            price,
            bakeryId: bakeryId || ''
        };
        
        // Add directly through Zustand store which now handles all the bakery switching logic
        const added = cartStore.addToCart(newItem as any);
        
        // We don't need to update local state here as the Zustand store change will trigger our useEffect
        return added;
    };

    const editCartItem = (id: string, newConfig: ExtendedCakeConfig) => {
        const price = calculatePrice(newConfig);
        
        // Find the item to get its bakeryId
        const item = items.find(item => item.id === id);
        
        if (!item) {
            toast.error("Item not found");
            return;
        }
        
        // Also update in Zustand store by removing and adding
        cartStore.removeFromCart(id);
        const added = cartStore.addToCart({
            id,
            config: newConfig,
            quantity: 1, // Default quantity
            price,
            bakeryId: item.bakeryId
        } as any);
        
        // Only update local state if Zustand update was successful
        if (added) {
            setItems(prev => prev.map(item =>
                item.id === id
                    ? { ...item, config: newConfig, price }
                    : item
            ));
        }
    };

    const removeFromCart = (id: string) => {
        // Remove through Zustand store
        cartStore.removeFromCart(id);
        
        // Also update local state for immediate UI update
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        // Clear through Zustand store
        cartStore.clearCart();
        
        // Also update local state
        setItems([]);
    };
    
    // Add deletion API function
    const deleteCartAPI = async () => {
        const result = await cartStore.deleteCartAPI();
        if (result) {
            setItems([]); // Also clear local state
        }
        return result;
    };

    const updateQuantity = (id: string, quantity: number) => {
        // Update through Zustand store
        cartStore.updateQuantity(id, quantity);
        
        // Also update local state for immediate UI update
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, quantity }
                : item
        ));
    };
    
    // Add ability to change bakery
    const changeBakery = async (bakeryId: string, clearExisting: boolean = false) => {
        try {
            // Call the Zustand store's changeBakery and await its result
            const result = await cartStore.changeBakery(bakeryId, clearExisting);
            
            // Update local state if requested and successful
            if (result && clearExisting) {
                setItems([]);
            }
            
            return result;
        } catch (error) {
            console.error('Error changing bakery:', error);
            return false;
        }
    };

    return (
        <CartContext.Provider value={{ 
            items, 
            addToCart, 
            editCartItem, 
            removeFromCart, 
            clearCart,
            deleteCartAPI,
            updateQuantity,
            changeBakery,
            currentBakeryId: cartStore.currentBakeryId
        }}>
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