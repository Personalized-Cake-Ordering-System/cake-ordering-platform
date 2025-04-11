export type GeocodingResponse = {
    results: Array<{
        formatted_address: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            }
        }
    }>;
    status: string;
};

export type CheckoutFormValues = {
    fullName: string;
    email: string;
    phone: string;
    province: string;
    district: string;
    address: string;
    deliveryMethod: 'standard' | 'express';
    deliveryType: 'DELIVERY' | 'PICKUP';
    specialInstructions?: string;
    formatted_address?: string;
    latitude?: number;
    longitude?: number;
};

export type CakeConfig = {
    size: string;
    sponge: string;
    filling: string;
    price: number;
    imageUrl?: string;
};

export interface CartItem {
    id: string;
    quantity: number;
    config: CakeConfig;
} 