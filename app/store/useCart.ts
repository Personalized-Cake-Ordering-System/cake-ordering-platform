
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CakeConfig as TypedCakeConfig } from '@/types/cake';
import { CartItem as TypedCartItem } from '@/types/cart';
import { toast } from 'sonner';

// Extended CakeConfig that includes the fields from the API
interface CakeConfig extends TypedCakeConfig {
    name: string;
    description: string;
    type: string;
}

// Ensure CartItem matches the type definition
interface CartItem extends TypedCartItem {
    config: CakeConfig;
    bakeryId?: string;
}

interface CartStore {
    items: CartItem[];
    currentBakeryId: string | null;
    addToCart: (item: CartItem) => boolean;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    deleteCartAPI: () => Promise<boolean>;
    changeBakery: (bakeryId: string, clearExisting?: boolean) => boolean;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            currentBakeryId: null,
            addToCart: (item) => {
                // @ts-ignore - item có thể có trường storeId từ customizer
                const itemBakeryId = item.bakeryId || item.storeId;
                const { currentBakeryId, items } = get();
                
                // If we don't have a bakery ID yet, or it matches the current one
                if (!currentBakeryId || currentBakeryId === itemBakeryId) {
                    // Update the current bakery ID if needed
                    if (!currentBakeryId && itemBakeryId) {
                        set({ currentBakeryId: itemBakeryId });
                    }
                    
                    // Add the item to cart
                    set({
                        items: [...items, { 
                            ...item, 
                            price: item.config.price, 
                            bakeryId: itemBakeryId 
                        }]
                    });
                    return true;
                } else {
                    // Item from different bakery - replace existing cart
                    set({
                        items: [{ 
                            ...item, 
                            price: item.config.price, 
                            bakeryId: itemBakeryId 
                        }],
                        currentBakeryId: itemBakeryId
                    });
                    
                    // Save notification about bakery change
                    localStorage.setItem('bakeryChangeNotice', JSON.stringify({
                        bakeryName: item.config.name.split(' ')[0] || 'new bakery'
                    }));
                    
                    return true;
                }
            },
            removeFromCart: (id) =>
                set((state) => {
                    const newItems = state.items.filter((item) => item.id !== id);
                    return {
                        items: newItems,
                        currentBakeryId: newItems.length > 0 ? state.currentBakeryId : null
                    };
                }),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { 
                            ...item, 
                            quantity,
                            price: (item.config.price * quantity) // Update price based on quantity
                        } : item
                    )
                })),
            clearCart: () => set({ items: [], currentBakeryId: null }),
            deleteCartAPI: async () => {
                try {
                    const accessToken = localStorage.getItem('accessToken');
                    if (!accessToken) {
                        toast.error('You need to be logged in to delete your cart');
                        return false;
                    }

                    const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/carts', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error deleting cart from API:', errorData);
                        throw new Error('Failed to delete cart from server');
                    }

                    // Clear local cart after successful API call
                    set({ items: [], currentBakeryId: null });
                    return true;
                } catch (error) {
                    console.error('Error during cart deletion:', error);
                    toast.error('Failed to delete cart from server');
                    return false;
                }
            },
            changeBakery: (bakeryId, clearExisting = false) => {
                const { currentBakeryId, items } = get();
                
                // If cart is empty, simply set the bakery ID
                if (items.length === 0 || clearExisting) {
                    set({ items: [], currentBakeryId: bakeryId });
                    return true;
                }
                
                // If we're already using this bakery, no change needed
                if (currentBakeryId === bakeryId) {
                    return true;
                }
                
                // Otherwise, require explicit permission (should be called after user confirmation)
                set({ 
                    items: [],
                    currentBakeryId: bakeryId 
                });
                
                return true;
            }
        }),
        {
            name: 'cart-storage'
        }
    )
); 