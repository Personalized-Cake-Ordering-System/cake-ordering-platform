export type CakeConfig = {
    size: string;
    price: number;
    sponge: string;
    outerIcing: string[];
    filling: string;
    icing: string;
    topping: string | null;
    message: string;
    candles: string | null;
    board: string;
    goo: string | null;
    extras: string[];
    messageType: 'none' | 'piped' | 'edible';
    plaqueColor: string;
    uploadedImage: string | null;
    imageUrl: string | null;
    pipingColor: string;
    // numberOfCandles: number;
    // candleColor: string;
} 