import axios from 'axios';

const API_URL = 'https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api';

export interface CartItem {
    cake_name: string;
    main_image_id: string;
    main_image: {
        file_name: string;
        file_url: string;
        id: string;
        created_at: string;
        created_by: string;
        updated_at: string;
        updated_by: string;
        is_deleted: boolean;
    };
    quantity: number;
    cake_note: string;
    sub_total_price: number;
    available_cake_id: string;
    custom_cake_id: string;
}

export interface Cart {
    customerId: string;
    bakeryId: string;
    order_note: string;
    phone_number: string;
    shipping_address: string;
    latitude: string;
    longitude: string;
    pickup_time: string;
    shipping_type: string;
    payment_type: string;
    voucher_code: string;
    cartItems: CartItem[];
}

export interface CartResponse {
    status_code: number;
    errors: string[];
    meta_data: null;
    payload: Cart;
}

export const cartService = {
    async getCart(accessToken: string): Promise<CartResponse> {
        try {
            const response = await axios.get(`${API_URL}/carts`, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    //axios.delete(`${API_URL}/carts/${itemId}`

    async deleteCart(accessToken: string, itemId: string): Promise<CartResponse> {
        try {
            const response = await axios.delete(`${API_URL}/carts`, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting cart item:', error);
            throw error;
        }
    }
}; 