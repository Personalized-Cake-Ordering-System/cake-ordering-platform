import { CakeConfig } from './cake';

export interface CartItem {
    id: string;
    config: CakeConfig;
    quantity: number;
    price: number;
} 