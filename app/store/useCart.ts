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

// Modal state type
interface BakerySwitchModalState {
    isOpen: boolean;
    currentBakeryName: string;
    newBakeryName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

interface CartStore {
    items: CartItem[];
    currentBakeryId: string | null;
    // Add modal state
    bakerySwitchModal: BakerySwitchModalState;
    // Add actions to control the modal
    openBakerySwitchModal: (currentName: string, newName: string, onConfirm: () => void) => void;
    closeBakerySwitchModal: () => void;
    addToCart: (item: CartItem) => boolean;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    deleteCartAPI: () => Promise<boolean>;
    changeBakery: (bakeryId: string, clearExisting?: boolean) => Promise<boolean>;
}

// Helper function to delete cart from API
const deleteCartFromAPI = async (): Promise<boolean> => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            // If no access token, we'll assume success since there's no API cart to delete
            return true;
        }

        const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn('API responded with error when deleting cart:', response.status);
        }

        return response.ok;
    } catch (error) {
        console.error('Error deleting cart from API:', error);
        return false;
    }
};

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            currentBakeryId: null,
            // Initialize modal state
            bakerySwitchModal: {
                isOpen: false,
                currentBakeryName: "",
                newBakeryName: "",
                onConfirm: () => {},
                onCancel: () => {}
            },
            // Add actions to control the modal
            openBakerySwitchModal: (currentName, newName, onConfirm) => set({
                bakerySwitchModal: {
                    isOpen: true,
                    currentBakeryName: currentName,
                    newBakeryName: newName,
                    onConfirm,
                    onCancel: () => {
                        get().closeBakerySwitchModal();
                    }
                }
            }),
            closeBakerySwitchModal: () => set({
                bakerySwitchModal: {
                    ...get().bakerySwitchModal,
                    isOpen: false
                }
            }),
            addToCart: (item) => {
                // Extract bakeryId from the item, ensuring it's not undefined
                // @ts-ignore - item có thể có trường storeId từ customizer
                const itemBakeryId = item.bakeryId || item.storeId || "";
                
                if (!itemBakeryId) {
                    console.error("Cannot add item without bakeryId to cart");
                    toast.error("Cannot add this item to cart: missing bakery information");
                    return false;
                }
                
                const { currentBakeryId, items } = get();
                
                // If cart is empty or bakery IDs match, proceed
                if (!currentBakeryId || items.length === 0) {
                    // First item in cart - set bakery ID
                    set({
                        items: [{ 
                            ...item, 
                            price: item.price || item.config.price, 
                            bakeryId: itemBakeryId 
                        }],
                        currentBakeryId: itemBakeryId
                    });
                    return true;
                } else if (currentBakeryId === itemBakeryId) {
                    // Same bakery, check if item already exists
                    const existingItemIndex = items.findIndex(cartItem => cartItem.id === item.id);
                    
                    if (existingItemIndex !== -1) {
                        // Item exists, update quantity
                        const updatedItems = [...items];
                        const existingItem = updatedItems[existingItemIndex];
                        updatedItems[existingItemIndex] = {
                            ...existingItem,
                            quantity: existingItem.quantity + (item.quantity || 1),
                            price: existingItem.config.price * (existingItem.quantity + (item.quantity || 1))
                        };
                        
                        set({ items: updatedItems });
                        return true;
                    } else {
                        // New item, add to cart
                        set({
                            items: [...items, { 
                                ...item, 
                                price: item.price || item.config.price, 
                                bakeryId: itemBakeryId 
                            }]
                        });
                        return true;
                    }
                } else {
                    // Different bakery - modal handling should be done at component level
                    // This function should only add items from the same bakery or to an empty cart
                    console.warn("Attempted to add item from different bakery without clearing cart first");
                    return false;
                }
            },
            removeFromCart: (id) =>
                set((state) => {
                    const newItems = state.items.filter((item) => item.id !== id);
                    
                    // If cart is now empty, also clear bakeryId
                    const newState = {
                        items: newItems,
                        currentBakeryId: newItems.length > 0 ? state.currentBakeryId : null
                    };
                    
                    console.log('After removeFromCart:', newState);
                    return newState;
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
            clearCart: () => {
                // Explicitly set both items to empty array and currentBakeryId to null
                const newState = { items: [], currentBakeryId: null };
                console.log('Clearing cart to:', newState);
                set(newState);
            },
            deleteCartAPI: async () => {
                try {
                    const accessToken = localStorage.getItem('accessToken');
                    if (!accessToken) {
                        // If no accessToken, there's no API cart to delete
                        // Just clear the local cart and return success
                        const newState = { items: [], currentBakeryId: null };
                        console.log('Clearing cart on deleteCartAPI (no token):', newState);
                        set(newState);
                        return true;
                    }

                    const result = await deleteCartFromAPI();
                    
                    // Clear local cart regardless of API success to ensure UI consistency
                    const newState = { items: [], currentBakeryId: null };
                    console.log('Clearing cart on deleteCartAPI (with token):', newState);
                    set(newState);
                    
                    if (!result) {
                        console.warn('API cart deletion failed, but local cart was cleared');
                    }
                    
                    return true;
                } catch (error) {
                    console.error('Error during cart deletion:', error);
                    // Only show error if there was an access token - meaning we expected the API call to work
                    const accessToken = localStorage.getItem('accessToken');
                    if (accessToken) {
                        toast.error('Failed to delete cart from server');
                    }
                    // Still clear local cart for consistency
                    const newState = { items: [], currentBakeryId: null };
                    console.log('Clearing cart on deleteCartAPI (error):', newState);
                    set(newState);
                    return false;
                }
            },
            changeBakery: async (bakeryId, clearExisting = false) => {
                if (!bakeryId) {
                    console.error("Cannot change to empty bakeryId");
                    return false;
                }
                
                const { currentBakeryId, items } = get();
                
                // If cart is empty, just set the new bakery ID without any API call
                if (items.length === 0) {
                    console.log('Setting bakery ID on empty cart:', bakeryId);
                    set({ currentBakeryId: bakeryId });
                    return true;
                }
                
                // If clearing existing items or we're already using this bakery
                if (clearExisting || currentBakeryId === bakeryId) {
                    // If clearing existing items, call the API to delete the cart
                    if (clearExisting && items.length > 0) {
                        // Prioritize deletion - wait for API deletion first
                        try {
                            await deleteCartFromAPI();
                        } catch (error) {
                            console.error('Error deleting cart:', error);
                            // Continue anyway to ensure UI consistency
                        }
                    }
                    
                    console.log('Setting to new bakery with clearExisting =', clearExisting, 'New bakeryId =', bakeryId);
                    const newState = { 
                        items: clearExisting ? [] : items,
                        currentBakeryId: bakeryId 
                    };
                    set(newState);
                    return true;
                }
                
                // If we get here, we're trying to change bakery without clearing the cart
                toast.error("Cannot change bakery while you have items in your cart");
                return false;
            }
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({
                items: state.items,
                currentBakeryId: state.currentBakeryId
            }),
            // Add storage event listener to help sync between tabs
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    return JSON.parse(str);
                },
                setItem: (name, value) => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => localStorage.removeItem(name),
            },
        }
    )
); 