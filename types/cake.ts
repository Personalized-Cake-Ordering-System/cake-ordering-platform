export type CakeConfig = {
    size: string;
    price: number;
    sponge: string;
    outerIcing: string;
    filling: string;
    topping: null;
    message: string;
    candles: string | null;
    board: string;
    goo: string | null;
    extras: string[];
    messageType: 'none' | 'piped' | 'edible';
    plaqueColor: string;
    uploadedImage: string | null;
    imageUrl: string | null;
} 