import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface WishlistStore {
    items: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
}

export const useWishlist = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addToWishlist: (item) => {
                const items = get().items;
                if (!items.find((i) => i.id === item.id)) {
                    set({ items: [...items, item] });
                }
            },
            removeFromWishlist: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },
            isInWishlist: (id) => {
                return get().items.some((item) => item.id === id);
            },
        }),
        {
            name: 'wishlist-storage',
        }
    )
); 