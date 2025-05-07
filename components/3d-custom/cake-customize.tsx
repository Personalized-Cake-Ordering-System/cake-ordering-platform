"use client";

import { Button } from '@/components/ui/button';
import { useCart } from '@/app/store/useCart';
import { CakeConfig } from '@/types/cake';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import { useCakeConfigStore } from '@/components/shared/client/stores/cake-config';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';

// Define type for the selected part
type SelectedPart = 'cake' | 'outer-icing' | 'filling' | 'message' | 'candles' | 'board' | 'extras' | null;

// Add these types at the top with other types
type SizeOption = {
    id: string;
    name: string;
    size: string;
    price: number;
    priceChange: number;
    feeds: string;
}

type SpongeOption = {
    id: string;
    name: string;
    color: string;
    price?: number;
}

// Add these new types
type FillingOption = {
    id: string;
    name: string;
    color: string;
    price?: number;
    icon: string;
}

type GooOption = {
    id: string;
    name: string;
    color: string;
    price: number;
}

type ExtraOption = {
    id: string;
    name: string;
    price: number;
    available: boolean;
    icon: string;
    color: string;
    type: string;
}

// Add these new option arrays
const fillingIcingOptions: FillingOption[] = [
    {
        id: 'white-vanilla',
        name: 'WHITE VANILLA BUTTERCREAM',
        color: 'bg-white',
        icon: '≡' // Horizontal lines icon
    },
    {
        id: 'pink-vanilla',
        name: 'PINK VANILLA BUTTERCREAM',
        color: 'bg-pink-200',
        icon: '≡'
    },
    {
        id: 'blue-vanilla',
        name: 'BLUE VANILLA BUTTERCREAM',
        color: 'bg-blue-200',
        icon: '≡'
    },
    {
        id: 'yellow-vanilla',
        name: 'YELLOW VANILLA BUTTERCREAM',
        color: 'bg-yellow-100',
        icon: '≡'
    },
    {
        id: 'cream-cheese',
        name: 'CREAM CHEESE ICING',
        color: 'bg-cream-100',
        icon: '≡'
    },
    {
        id: 'chocolate',
        name: 'CHOCOLATE BUTTERCREAM',
        color: 'bg-brown-800',
        icon: '≡'
    },
    {
        id: 'salted-caramel',
        name: 'SALTED CARAMEL BUTTERCREAM',
        color: 'bg-amber-200',
        icon: '≡'
    },
    {
        id: 'raspberry',
        name: 'RASPBERRY BUTTERCREAM',
        color: 'bg-pink-300',
        icon: '≡'
    }
];

const gooOptions: GooOption[] = [
    { id: 'raspberry-jam', name: 'RASPBERRY JAM', color: 'bg-rose-300', price: 2.00 },
    { id: 'strawberry-jam', name: 'STRAWBERRY JAM', color: 'bg-rose-400', price: 2.00 },
    { id: 'salted-caramel', name: 'SALTED CARAMEL', color: 'bg-amber-300', price: 2.00 },
    { id: 'lemon-curd', name: 'LEMON CURD', color: 'bg-yellow-200', price: 2.00 }
];

const extraOptions: ExtraOption[] = [
    {
        id: 'cookie-dough',
        name: 'COOKIE DOUGH CHUNKS',
        price: 4.00,
        available: true,
        icon: '🍪',
        color: 'bg-amber-200',
        type: 'Candles'
    },
    {
        id: 'caramelised-white',
        name: 'CARAMELISED WHITE CHOCOLATE',
        price: 3.00,
        available: true,
        icon: '🍫',
        color: 'bg-amber-100',
        type: 'CakeBoard'
    },
    {
        id: 'oreo-crumbs',
        name: 'OREO CRUMBS',
        price: 2.00,
        available: true,
        icon: '🖤',
        color: 'bg-gray-900',
        type: 'Candles'
    },
    {
        id: 'biscoff-crumbs',
        name: 'BISCOFF CRUMBS',
        price: 2.00,
        available: true,
        icon: '🍪',
        color: 'bg-amber-400',
        type: 'Candles'
    },
    {
        id: 'malted-cornflakes',
        name: 'MALTED CORNFLAKES',
        price: 3.00,
        available: true,
        icon: '🥣',
        color: 'bg-yellow-200',
        type: 'Candles'
    },
    {
        id: 'pinata',
        name: 'PINATA IT!',
        price: 12.00,
        available: true,
        icon: '🎨',
        color: 'bg-gradient-to-r from-pink-400 to-purple-400',
        type: 'Candles'
    }
];

// Add these new types
type MessageOption = {
    id: 'none' | 'piped' | 'edible';
    name: string;
    price: number;
    icon: string;
};

// Add message options
const messageOptions: MessageOption[] = [
    { id: 'none', name: 'NONE', price: 0, icon: '✖️' },
    { id: 'piped', name: 'PIPED MESSAGE', price: 0, icon: '✍️' },
    { id: 'edible', name: 'EDIBLE IMAGE', price: 0, icon: '🖼️' }
];

// Add these types
type PlaqueColor = {
    id: string;
    name: string;
    color: string;
};

// Add these options
const plaqueColors: PlaqueColor[] = [
    { id: 'white', name: 'WHITE CHOCOLATE', color: 'bg-amber-50' },
    { id: 'dark', name: 'DARK CHOCOLATE', color: 'bg-brown-900' },
    { id: 'pink', name: 'PINK CHOCOLATE', color: 'bg-pink-200' },
    { id: 'blue', name: 'BLUE CHOCOLATE', color: 'bg-blue-200' }
];

// Add these new types for API error handling
interface ApiError {
    code: string;
    message: string;
    details?: any;
}

// Update the ApiResponse interface
interface ApiResponse<T> {
    status_code: number;
    errors: ApiError[];
    meta_data: {
        total_items_count: number;
        page_size: number;
        total_pages_count: number;
        page_index: number;
        has_next: boolean;
        has_previous: boolean;
    };
    payload: T[];
}

interface ApiItem {
    id: string;
    name: string;
    price: number;
    color: string;
    is_default: boolean;
    description: string;
    image_id: string | null;
    image: {
        file_name: string;
        file_url: string;
        id: string;
        created_at: string;
        created_by: string;
        updated_at: string | null;
        updated_by: string | null;
        is_deleted: boolean;
    } | null;
    type: string;
    bakery_id: string;
    bakery: null;
    created_at: string;
    created_by: string;
    updated_at: string | null;
    updated_by: string | null;
    is_deleted: boolean;
}

interface ApiOptionGroup {
    type: string;
    items: ApiItem[];
}

// Add this type near the top with other types
type BoardShape = 'round' | 'square';

// Update the boardOptions array
const boardOptions = [
    { id: 'round-board', name: 'ROUND BOARD', color: 'bg-white', shape: 'round' as BoardShape },
    { id: 'square-board', name: 'SQUARE BOARD', color: 'bg-white', shape: 'square' as BoardShape }
];

// Add these types near the top with other types
type StepStatus = {
    cake: boolean;
    decoration: boolean;
    message: boolean;
    extras: boolean;
};

// Update getInitialCakeConfig to only have placeholders for required fields
const getInitialCakeConfig = (): CakeConfig => {
    if (typeof window === 'undefined') {
        // Return default config when running on server
        return {
            size: '',
            price: 0,
            sponge: '',
            outerIcing: '',
            filling: '',
            topping: null,
            message: '',
            candles: null,
            board: '',
            goo: null,
            extras: [],
            messageType: 'none',
            plaqueColor: 'white',
            uploadedImage: null,
            imageUrl: null,
            pipingColor: 'white'
        };
    }

    // Try to get saved config from localStorage
    const savedConfig = localStorage.getItem('cakeConfig');
    if (savedConfig) {
        try {
            return JSON.parse(savedConfig);
        } catch (error) {
            console.error('Error parsing saved cake config:', error);
        }
    }

    // Return default config if no saved config exists
    return {
        size: '',
        price: 0,
        sponge: '',
        outerIcing: '',
        filling: '',
        topping: null,
        message: '',
        candles: null,
        board: '',
        goo: null,
        extras: [],
        messageType: 'none',
        plaqueColor: 'white',
        uploadedImage: null,
        imageUrl: null,
        pipingColor: 'white'
    };
};

// Add these new animation variants
const selectedVariants = {
    selected: {
        scale: [1, 1.05, 1],
        boxShadow: "0 0 0 3px rgba(236, 72, 153, 0.4)",
        transition: {
            duration: 0.3
        }
    },
    unselected: {
        scale: 1,
        boxShadow: "0 0 0 0px rgba(236, 72, 153, 0)",
        transition: {
            duration: 0.2
        }
    }
};

const CakeCustomizer = ({ storeId }: { storeId: string }) => {
    const { addToCart, items } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');
    const { config, setConfig } = useCakeConfigStore();
    const cakePreviewRef = useRef<HTMLDivElement>(null);

    // Update state definitions with proper types
    const [selectedPart, setSelectedPart] = useState<SelectedPart>(null);
    const [showJson, setShowJson] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    // Add state for API data
    const [decorationOptions, setDecorationOptions] = useState<ApiOptionGroup[]>([]);
    const [extraOptions, setExtraOptions] = useState<ApiOptionGroup[]>([]);
    const [messageOptions, setMessageOptions] = useState<ApiOptionGroup[]>([]);
    const [partOptions, setPartOptions] = useState<ApiOptionGroup[]>([]);
    const [error, setError] = useState<ApiError | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Add step completion tracking
    const [completedSteps, setCompletedSteps] = useState<StepStatus>({
        cake: false,
        decoration: false,
        message: false,
        extras: false
    });

    // Add current step tracking
    const [currentStep, setCurrentStep] = useState<'cake' | 'decoration' | 'message' | 'extras'>('cake');

    // Update the initial state to load existing item if editing
    useEffect(() => {
        if (editId) {
            const itemToEdit = items.find(item => item.id === editId);
            if (itemToEdit) {
                setConfig(itemToEdit.config);
            }
        }
    }, [editId, items, setConfig]);

    // Add a function to reset the configuration
    const handleResetConfig = () => {
        const defaultConfig: CakeConfig = {
            size: '',
            price: 0,
            sponge: '',
            outerIcing: '',
            filling: '',
            topping: null,
            message: '',
            candles: null,
            board: 'round-board', // Set default board
            goo: null,
            extras: ['round-board'], // Include board in extras
            messageType: 'none',
            plaqueColor: 'white',
            uploadedImage: null,
            imageUrl: null,
            pipingColor: 'white'
        };
        setConfig(defaultConfig);
    };

    // Options for customization
    const icingOptions = [
        { id: 'white-vanilla', name: 'WHITE VANILLA BUTTERCREAM', color: 'bg-amber-50' },
        { id: 'pink-vanilla', name: 'PINK VANILLA BUTTERCREAM', color: 'bg-pink-200' },
        { id: 'blue-vanilla', name: 'BLUE VANILLA BUTTERCREAM', color: 'bg-cyan-100' },
        { id: 'yellow-vanilla', name: 'YELLOW VANILLA BUTTERCREAM', color: 'bg-yellow-200' }
    ];

    const fillingOptions = [
        { id: 'cream-cheese', name: 'CREAM CHEESE ICING', color: 'bg-amber-50' },
        { id: 'chocolate', name: 'CHOCOLATE BUTTERCREAM', color: 'bg-amber-950' },
        { id: 'salted-caramel', name: 'SALTED CARAMEL BUTTERCREAM', color: 'bg-amber-300' },
        { id: 'raspberry', name: 'RASPBERRY BUTTERCREAM', color: 'bg-rose-200' }
    ];

    const candleOptions = [
        { id: 'pink-candles', name: '6x PINK CANDLES', color: 'bg-pink-100', price: 4.99 },
        { id: 'blue-candles', name: '6x BLUE CANDLES', color: 'bg-cyan-100', price: 4.99 },
        { id: 'white-candles', name: '6x WHITE CANDLES', color: 'bg-gray-100', price: 4.99 }
    ];

    // Add these options with the other option arrays
    const sizeOptions: SizeOption[] = [
        { id: '6-inch', name: '6-INCH', size: '6"', price: 83.99, priceChange: -12.00, feeds: '8-10' },
        { id: '8-inch', name: '8-INCH', size: '8"', price: 95.99, priceChange: 0, feeds: '16-24' },
        { id: '10-inch', name: '10-INCH', size: '10"', price: 131.99, priceChange: 36.00, feeds: '30-40' }
    ];

    const spongeOptions: SpongeOption[] = [
        { id: 'vanilla', name: 'VANILLA', color: 'bg-amber-50' },
        { id: 'red-velvet', name: 'RED VELVET', color: 'bg-red-900' },
        { id: 'chocolate', name: 'CHOCOLATE', color: 'bg-brown-900' },
        { id: 'salted-caramel', name: 'SALTED CARAMEL', color: 'bg-amber-300' },
        { id: 'raspberry-ripple', name: 'RASPBERRY RIPPLE', color: 'bg-pink-200' },
        { id: 'lemon', name: 'LEMON', color: 'bg-yellow-200' },
        { id: 'rainbow', name: 'RAINBOW', color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500', price: 10.00 },
        { id: 'funfetti', name: 'FUNFETTI', color: 'bg-white', price: 10.00 }
    ];

    // Update price handling to maintain number type
    const handleOptionSelect = (optionType: 'outerIcing' | 'filling' | 'candles' | 'board', optionId: string) => {
        // Get the group that contains this option type
        let group;
        let currentOptionId = config[optionType];
        
        if (optionType === 'outerIcing') {
            group = decorationOptions.find(g => g.items.some(item => item.id === optionId));
        } else if (optionType === 'filling') {
            group = partOptions.find(g => g.type === 'Filling');
        } else if (optionType === 'candles' || optionType === 'board') {
            group = extraOptions.find(g => g.type === (optionType === 'candles' ? 'Candles' : 'CakeBoard'));
        }
        
        // Find current and new options to calculate price difference
        const currentOption = group?.items.find(item => item.id === currentOptionId);
        const newOption = group?.items.find(item => item.id === optionId);
        
        const currentPrice = currentOption?.price || 0;
        const newPrice = newOption?.price || 0;
        const priceDifference = newPrice - currentPrice;
        
        // Update the configuration with new price
        setConfig(prev => ({
            ...prev,
            [optionType]: optionId,
            price: prev.price + priceDifference
        }));
        
        // If it's a board or candles, also update extras array
        if (optionType === 'board' || optionType === 'candles') {
            const extras = Array.isArray(config.extras) ? config.extras : [];
            
            // Remove any existing option of the same type from extras array
            const extrasWithoutType = extras.filter(id => {
                const item = extraOptions.find(group => 
                    group.items.some(item => item.id === id)
                )?.items.find(item => item.id === id);
                return item?.type !== (optionType === 'candles' ? 'Candles' : 'CakeBoard');
            });
            
            setConfig(prev => ({
                ...prev,
                extras: [...extrasWithoutType, optionId]
            }));
        }
    };

    // Update the candles removal handler
    const handleRemoveCandles = () => {
        // Find the price of the current candles to subtract it
        const currentCandles = extraOptions.find(group => 
            group.type === 'Candles'
        )?.items.find(item => 
            item.id === config.candles
        );
        
        const candlesPrice = currentCandles?.price || 0;
        
        setConfig(prev => ({
            ...prev,
            candles: null,
            price: prev.price - candlesPrice
        }));
        
        // Also remove from extras array
        if (Array.isArray(config.extras)) {
            setConfig(prev => ({
                ...prev,
                extras: prev.extras.filter(id => id !== config.candles)
            }));
        }
        
        setSelectedPart(null);
    };

    const handleSaveDesign = () => {
        try {
            localStorage.setItem('cakeConfig', JSON.stringify(config));
            toast.success('Design saved successfully!');
        } catch (error) {
            console.error('Error saving design:', error);
            toast.error('Failed to save design');
        }
    };

    const handleOrderCake = async () => {
        try {
            console.log('Order button clicked');
            console.log('Current cake config:', config);

            // Get the access token from localStorage
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error('You need to be logged in to add items to cart');
                return;
            }

            // Capture the cake preview as an image
            let cakeImageUrl = null;
            if (cakePreviewRef.current) {
                try {
                    // Show loading toast
                    const loadingToast = toast.loading('Generating cake image...');

                    // Capture the cake preview
                    const canvas = await html2canvas(cakePreviewRef.current, {
                        backgroundColor: null,
                        scale: 2, // Higher quality
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });

                    // Convert canvas to data URL
                    cakeImageUrl = canvas.toDataURL('image/png');

                    // Update loading toast
                    toast.dismiss(loadingToast);
                    toast.success('Cake image generated successfully!');
                } catch (error) {
                    console.error('Error capturing cake image:', error);
                    toast.error('Failed to generate cake image. Using default image instead.');
                }
            }

            // Get message options from API response
            const messageTypeGroup = messageOptions.find(group => group.type === 'MESSAGE_TYPE');
            const plaqueColorGroup = messageOptions.find(group => group.type === 'PLAQUE_COLOUR');
            const pipingColorGroup = messageOptions.find(group => group.type === 'PIPING_COLOUR');

            // Get the selected message type option
            const selectedMessageType = messageTypeGroup?.items.find(item =>
                (config.messageType === 'none' && item.name === 'NONE') ||
                (config.messageType === 'piped' && item.name === 'PIPED MESSAGE') ||
                (config.messageType === 'edible' && item.name === 'EDIBLE IMAGE')
            );

            // Get the selected plaque color option
            const selectedPlaqueColor = plaqueColorGroup?.items.find(item =>
                item.name.toLowerCase().includes(config.plaqueColor.toLowerCase())
            );

            // Get the selected piping color option
            const selectedPipingColor = pipingColorGroup?.items.find(item =>
                item.name.toLowerCase().includes(config.pipingColor.toLowerCase())
            );

            // Collect all selected message option IDs
            const messageOptionIds = [
                selectedMessageType?.id,
                config.messageType === 'piped' ? selectedPlaqueColor?.id : null,
                config.messageType === 'piped' ? selectedPipingColor?.id : null
            ].filter(Boolean) as string[];

            console.log('Selected message option IDs:', messageOptionIds);

            // Ensure we have valid GUID IDs for all selections
            const defaultGuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
            
            // Helper to ensure we have valid GUIDs
            const getValidGuid = (id: string | undefined): string => {
                if (!id) return defaultGuid;
                // Simple validation - GUIDs should be in format like '00000000-0000-0000-0000-000000000000'
                const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return guidPattern.test(id) ? id : defaultGuid;
            };

            // Prepare the API request body
            const requestBody = {
                cake_name: `Custom ${config.size} Cake`,
                cake_description: `Delicious ${config.size} cake with ${getSelectedOption('Sponge', config.sponge)?.name || 'Unknown'} sponge, filled with ${getSelectedOption('Filling', config.filling)?.name || 'Unknown'}, and covered in ${getSelectedOption('Icing', config.outerIcing)?.name || 'Unknown'} icing${config.goo ? `, topped with ${getSelectedOption('Goo', config.goo)?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
                bakery_id: storeId,
                model: "CustomCake", // Add required model field
                price: config.price, // Add explicit price field to ensure consistency
                message_selection: {
                    text: config.message,
                    message_type: config.messageType === 'edible' ? 'IMAGE' : config.messageType === 'piped' ? 'TEXT' : 'NONE',
                    image_id: config.uploadedImage ? defaultGuid : null,
                    cake_message_option_ids: messageOptionIds.map(getValidGuid)
                },
                part_selections: [
                    {
                        part_type: "SIZE",
                        part_option_id: getValidGuid(partOptions.find(group => group.type === 'Size')?.items.find(item => item.name === config.size)?.id)
                    },
                    {
                        part_type: "SPONGE",
                        part_option_id: getValidGuid(partOptions.find(group => group.type === 'Sponge')?.items.find(item => item.id === config.sponge)?.id)
                    },
                    {
                        part_type: "FILLING",
                        part_option_id: getValidGuid(partOptions.find(group => group.type === 'Filling')?.items.find(item => item.id === config.filling)?.id)
                    }
                ],
                decoration_selections: [
                    {
                        decoration_type: "OUTER_ICING",
                        decoration_option_id: getValidGuid(decorationOptions.find(group => group.items.some(item => item.id === config.outerIcing))?.items.find(item => item.id === config.outerIcing)?.id)
                    }
                ],
                extra_selections: Array.isArray(config.extras) ? config.extras.filter(id => {
                    // Only include extras that actually exist in the extraOptions array
                    const option = extraOptions.flatMap(group => group.items).find(item => item.id === id);
                    return !!option; // Only keep extras that exist
                }).map(id => {
                    const option = extraOptions.flatMap(group => group.items).find(item => item.id === id);
                    return {
                        extra_type: option?.type || "UNKNOWN",
                        extra_option_id: getValidGuid(option?.id)
                    };
                }) : []
            };
            console.log('Prepared request body:', requestBody);

            // Call the API to create the custom cake
            console.log('Making API request to create custom cake...');
            const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/custom_cakes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log('API raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Parsed API response:', data);
            } catch (parseError) {
                console.error('Error parsing API response:', parseError);
                toast.error(`Server responded with invalid JSON. Check console for details.`);
                return;
            }

            if (!response.ok) {
                console.error('API request failed:', response.status, response.statusText);
                const errorMessage = data?.errors && Array.isArray(data.errors) && data.errors.length > 0 
                    ? `Error: ${data.errors.join(', ')}` 
                    : 'Failed to create custom cake';
                toast.error(errorMessage);
                return;
            }

            // Continue with the rest of the code
            console.log('API response:', data);

            // Prepare the cart data according to the API requirements
            const cartData = {
                bakeryId: storeId,
                order_note: "",
                phone_number: "",
                shipping_address: "",
                latitude: "",
                longitude: "",
                pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
                shipping_type: "DELIVERY",
                payment_type: "CASH",
                voucher_code: "",
                cartItems: [
                    {
                        cake_name: `Custom ${config.size} Cake`,
                        main_image_id: data.payload.image_id || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        main_image: data.payload.image || {
                            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                            created_at: new Date().toISOString(),
                            created_by: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                            updated_at: new Date().toISOString(),
                            updated_by: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                            is_deleted: false,
                            file_name: "custom-cake.jpg",
                            file_url: cakeImageUrl || "/imagecake.jpg"
                        },
                        quantity: 1,
                        cake_note: `Delicious ${config.size} cake with ${getSelectedOption('Sponge', config.sponge)?.name || 'Unknown'} sponge, filled with ${getSelectedOption('Filling', config.filling)?.name || 'Unknown'}, and covered in ${getSelectedOption('Icing', config.outerIcing)?.name || ' '} icing${config.goo ? `, topped with ${getSelectedOption('Goo', config.goo)?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
                        sub_total_price: config.price,
                        total_price: config.price, // Add total_price field for consistency
                        available_cake_id: null,
                        custom_cake_id: data.payload.id,
                        bakery_id: storeId
                    }
                ]
            };

            console.log('Adding to cart with data:', cartData);

            // Make the API call to add to cart
            const cartResponse = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/carts', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(cartData)
            });

            if (!cartResponse.ok) {
                const errorData = await cartResponse.json();
                console.error('Error adding to cart:', errorData);
                throw new Error('Failed to add item to cart');
            }

            const cartResult = await cartResponse.json();
            console.log('Cart API response:', cartResult);

            // Also add to local cart state for UI updates
            const cartItem = {
                id: data.payload.id,
                quantity: 1,
                price: config.price,
                storeId: storeId,
                config: {
                    ...config,
                    name: `Custom ${config.size} Cake`,
                    description: `Delicious ${config.size} cake with ${getSelectedOption('Sponge', config.sponge)?.name || 'Unknown'} sponge, filled with ${getSelectedOption('Filling', config.filling)?.name || 'Unknown'}, and covered in ${getSelectedOption('Icing', config.outerIcing)?.name || 'Unknown'} icing${config.goo ? `, topped with ${getSelectedOption('Goo', config.goo)?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
                    type: 'custom',
                    extras: Array.isArray(config.extras) ? config.extras : [],
                    imageUrl: cakeImageUrl // Add the captured image URL
                }
            };

            addToCart(cartItem);
            toast.success('Cake added to cart successfully!');
            console.log('Order process completed successfully');
            router.push('/cart');
        } catch (error) {
            console.error('Error in handleOrderCake:', error);
            toast.error('Failed to order cake. Please try again.');
        }
    };

    const getCakeJson = () => {
        return JSON.stringify({
            size: config.size,
            price: config.price,
            design: {
                outerIcing: {
                    type: config.outerIcing,
                    name: icingOptions.find(o => o.id === config.outerIcing)?.name
                },
                filling: {
                    type: config.filling,
                    name: fillingIcingOptions.find(o => o.id === config.filling)?.name
                },
                candles: config.candles ? {
                    type: config.candles,
                    name: candleOptions.find(o => o.id === config.candles)?.name
                } : null,
                message: config.message || null,
                board: {
                    type: config.board,
                    name: boardOptions.find(o => o.id === config.board)?.name
                }
            }
        }, null, 2);
    };

    // Add this function to handle JSON download
    const handleDownloadJson = () => {
        const jsonData = {
            size: config.size,
            price: config.price.toFixed(2),
            sponge: {
                type: config.sponge,
                name: spongeOptions.find(o => o.id === config.sponge)?.name
            },
            filling: {
                type: config.filling,
                name: fillingIcingOptions.find(o => o.id === config.filling)?.name
            },
            goo: config.goo ? {
                type: config.goo,
                name: gooOptions.find(o => o.id === config.goo)?.name
            } : null,
            extras: Array.isArray(config.extras) ? config.extras.map(id => {
                const extra = extraOptions.flatMap(group => group.items).find(item => item.id === id);
                return {
                    type: id,
                    name: extra?.name
                };
            }) : [],
            decoration: {
                type: config.outerIcing,
                name: icingOptions.find(o => o.id === config.outerIcing)?.name
            },
            message: {
                type: config.messageType,
                text: config.message || null,
                plaqueColor: config.messageType === 'piped' ? {
                    type: config.plaqueColor,
                    name: plaqueColors.find(c => c.id === config.plaqueColor)?.name
                } : null,
                uploadedImage: config.messageType === 'edible' ? config.uploadedImage : null
            },
            candles: config.candles ? {
                type: config.candles,
                name: candleOptions.find(o => o.id === config.candles)?.name
            } : null,
            board: {
                type: config.board,
                name: boardOptions.find(o => o.id === config.board)?.name
            }
        };

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cake-design-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Add these handler functions with proper types
    const handleSizeSelect = (option: SizeOption) => {
        // Tìm giá từ API
        const apiOption = partOptions.find(group => group.type === 'Size')?.items.find(item => item.name === option.size);
        const apiPrice = apiOption?.price || 0;
        
        // Khi thay đổi kích thước, thiết lập lại hoàn toàn giá tiền dựa trên kích thước mới
        setConfig({
            ...config,
            size: option.size,
            price: apiPrice // Lấy giá từ API
        });
    };

    const handleSpongeSelect = (option: SpongeOption) => {
        // Tìm loại bánh hiện tại để trừ giá (từ API)
        const currentSpongeId = config.sponge;
        const currentSponge = partOptions.find(group => group.type === 'Sponge')?.items.find(item => item.id === currentSpongeId);
        const currentSpongePrice = currentSponge?.price || 0;
        
        // Tìm giá mới từ API
        const newSponge = partOptions.find(group => group.type === 'Sponge')?.items.find(item => item.id === option.id);
        const newSpongePrice = newSponge?.price || 0;
        
        // Chỉ tính phần chênh lệch giá giữa option cũ và mới
        const priceDifference = newSpongePrice - currentSpongePrice;
        
        setConfig({
            ...config,
            sponge: option.id,
            price: config.price + priceDifference
        });
    };

    const handleFillingSelect = (option: FillingOption) => {
        // Tìm loại nhân hiện tại để trừ giá (từ API)
        const currentFillingId = config.filling;
        const currentFilling = partOptions.find(group => group.type === 'Filling')?.items.find(item => item.id === currentFillingId);
        const currentFillingPrice = currentFilling?.price || 0;
        
        // Tìm giá mới từ API 
        const newFilling = partOptions.find(group => group.type === 'Filling')?.items.find(item => item.id === option.id);
        const newFillingPrice = newFilling?.price || 0;
        
        // Chỉ tính phần chênh lệch giá
        const priceDifference = newFillingPrice - currentFillingPrice;
        
        setConfig({
            ...config,
            filling: option.id,
            price: config.price + priceDifference
        });
    };

    const handleGooSelect = (option: GooOption) => {
        // Tìm loại goo hiện tại để trừ giá (từ API)
        const currentGooId = config.goo;
        const currentGoo = partOptions.find(group => group.type === 'Goo')?.items.find(item => item.id === currentGooId);
        const currentGooPrice = currentGoo?.price || 0;
        
        // Tìm giá mới từ API
        const newGoo = partOptions.find(group => group.type === 'Goo')?.items.find(item => item.id === option.id);
        const newGooPrice = newGoo?.price || 0;
        
        // Tính chênh lệch giá
        const priceDifference = newGooPrice - currentGooPrice;
        
        setConfig({
            ...config,
            goo: option.id,
            price: config.price + priceDifference
        });
    };

    const handleExtraSelect = (option: ExtraOption) => {
        const currentExtras = Array.isArray(config.extras) ? config.extras : [];
        
        // Check if the option is already selected
        const isAlreadySelected = currentExtras.includes(option.id);
        
        // If it's the same type as an existing option, we need to handle replacement
        const existingOptionOfSameType = currentExtras.find(id => {
            const existingOption = extraOptions.flatMap(group => group.items).find(item => item.id === id);
            return existingOption?.type === option.type && id !== option.id;
        });
        
        let newExtras = [...currentExtras];
        let priceDifference = 0;
        
        if (isAlreadySelected) {
            // Remove the option if it's already selected
            newExtras = newExtras.filter(id => id !== option.id);
            priceDifference = -option.price;
        } else {
            // If there's an existing option of the same type, replace it
            if (existingOptionOfSameType) {
                const existingOption = extraOptions.flatMap(group => group.items).find(item => item.id === existingOptionOfSameType);
                // Remove existing option and its price
                newExtras = newExtras.filter(id => id !== existingOptionOfSameType);
                priceDifference = option.price - (existingOption?.price || 0);
            } else {
                // Otherwise just add the new option
                priceDifference = option.price;
            }
            newExtras.push(option.id);
        }
        
        // Create update object with the right types
        const updateObj: Partial<CakeConfig> = {
            extras: newExtras,
            price: config.price + priceDifference
        };
        
        // Update specific fields with proper types
        if (option.type === 'Candles') {
            updateObj.candles = isAlreadySelected ? undefined : option.id;
        } else if (option.type === 'CakeBoard') {
            updateObj.board = isAlreadySelected ? undefined : option.id;
        }
        
        // Apply the update
        setConfig({
            ...config,
            ...updateObj
        });
    };

    // Cập nhật handleMessageSelect để sử dụng giá từ API
    const handleMessageSelect = (option: MessageOption) => {
        // Tìm tùy chọn hiện tại từ API
        const currentMessageType = config.messageType;
        const currentMessageOption = messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item => 
            (currentMessageType === 'none' && item.name === 'NONE') ||
            (currentMessageType === 'piped' && item.name === 'PIPED MESSAGE') ||
            (currentMessageType === 'edible' && item.name === 'EDIBLE IMAGE')
        );
        
        // Tìm tùy chọn mới từ API
        const newMessageOption = messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item => 
            (option.id === 'none' && item.name === 'NONE') ||
            (option.id === 'piped' && item.name === 'PIPED MESSAGE') ||
            (option.id === 'edible' && item.name === 'EDIBLE IMAGE')
        );
        
        // Tính chênh lệch giá
        const currentPrice = currentMessageOption?.price || 0;
        const newPrice = newMessageOption?.price || 0;
        const priceDifference = newPrice - currentPrice;
        
        setConfig({
            ...config,
            messageType: option.id,
            // Reset related fields when changing message type
            message: option.id === 'none' ? '' : config.message,
            uploadedImage: option.id === 'none' ? null : config.uploadedImage,
            price: config.price + priceDifference
        });
    };

    // Update the event handlers with proper types
    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({
            message: e.target.value.slice(0, 30)
        });
    };

    const handlePlaqueColorChange = (colorId: string) => {
        setConfig({
            plaqueColor: colorId
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setConfig({
                    uploadedImage: e.target?.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = () => {
        setConfig({
            uploadedImage: null
        });
    };

    // Update fetch functions with better error handling
    const fetchDecorationOptions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/decoration_options?bakeryId=${storeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            setDecorationOptions(data.payload);
        } catch (error) {
            console.error('Error fetching decoration options:', error);
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch decoration options'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchExtraOptions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/extra_options?bakeryId=${storeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            setExtraOptions(data.payload);
        } catch (error) {
            console.error('Error fetching extra options:', error);
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch extra options'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessageOptions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/message_options?bakeryId=${storeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            setMessageOptions(data.payload);
        } catch (error) {
            console.error('Error fetching message options:', error);
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch message options'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPartOptions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/part_options?bakeryId=${storeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }

            // Process the data to match our expected format
            const processedData = data.payload.map(group => ({
                type: group.type,
                items: group.items.map(item => ({
                    ...item,
                    // Ensure color is in the correct format for our UI
                    color: item.color ? `bg-${item.color.toLowerCase()}` : 'bg-gray-200'
                }))
            }));

            setPartOptions(processedData);
            
            // Set default size and initial price if not set yet
            const sizeGroup = processedData.find(group => group.type === 'Size');
            if (!config.size && sizeGroup && sizeGroup.items.length > 0) {
                const defaultSize = sizeGroup.items[0];
                if (defaultSize) {
                    setConfig(prev => ({
                        ...prev,
                        size: defaultSize.name,
                        price: defaultSize.price || 0
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching part options:', error);
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch part options'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Modify handlePartSelect to include step logic
    const handlePartSelect = (part: SelectedPart) => {
        setError(null);

        // Determine which steps are available based on completion status
        const canSelectCake = true; // Always available
        const canSelectDecoration = completedSteps.cake;
        const canSelectMessage = completedSteps.decoration;
        const canSelectExtras = completedSteps.message;

        // Only allow selecting steps that are available
        if (part === 'cake') {
            setSelectedPart(part);
            fetchPartOptions();
        } else if (part === 'outer-icing' && canSelectDecoration) {
            setSelectedPart(part);
            fetchDecorationOptions();
        } else if (part === 'message' && canSelectMessage) {
            setSelectedPart(part);
            fetchMessageOptions();
        } else if (part === 'extras' && canSelectExtras) {
            setSelectedPart(part);
            fetchExtraOptions();
        } else if (part !== null) {
            // Show error message if trying to select a locked step
            toast.error('Please complete the previous steps first');
        }

        // Update current step based on selection
        if (part === 'cake' && !completedSteps.cake) {
            setCurrentStep('cake');
        } else if (part === 'outer-icing' && !completedSteps.decoration) {
            setCurrentStep('decoration');
        } else if (part === 'message' && !completedSteps.message) {
            setCurrentStep('message');
        } else if (part === 'extras' && !completedSteps.extras) {
            setCurrentStep('extras');
        }
    };

    // Add a function to get the selected option from part options
    const getSelectedOption = (type: string, selectedId: string | null) => {
        const group = partOptions.find(g => g.type === type);
        return group?.items.find(item => item.id === selectedId);
    };

    // Update the renderCake function
    const renderCake = () => {
        // Get selected options from extraOptions
        const selectedCandle = extraOptions.find(group => group.type === 'Candles')?.items.find(item => item.id === config.candles);
        const selectedBoard = extraOptions.find(group => group.type === 'CakeBoard')?.items.find(item => item.id === config.board) || {
            id: 'round-board',
            name: 'Round Cake Board',
            color: 'white',
            price: 10000
        }; // Provide default board if none selected

        // Get selected options
        const selectedSponge = getSelectedOption('Sponge', config.sponge);
        const selectedFilling = getSelectedOption('Filling', config.filling);
        const selectedIcing = getSelectedOption('Icing', config.outerIcing);
        const selectedGoo = getSelectedOption('Goo', config.goo);

        // Get colors from selected options and ensure they're safe for class names
        const spongeColor = selectedSponge ? convertColorToTailwind(selectedSponge.color).replace('bg-', '') : 'amber-50';
        const fillingColor = selectedFilling ? convertColorToTailwind(selectedFilling.color).replace('bg-', '') : 'white';
        const icingColor = selectedIcing ? convertColorToTailwind(selectedIcing.color).replace('bg-', '') : 'pink-200';
        const gooColor = selectedGoo ? convertColorToTailwind(selectedGoo.color).replace('bg-', '') : null;

        const showMessage = config.message !== '';

        // Special preview for message customization
        if (selectedPart === 'message' as SelectedPart) {
            const messageColor = config.messageType === 'piped'
                ? convertColorToTailwind(config.plaqueColor).replace('bg-', '')
                : 'white';
            const textColor = config.messageType === 'piped'
                ? convertColorToTailwind(config.pipingColor).replace('bg-', '')
                : 'pink-400';

            return (
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="relative w-[80%] aspect-square rounded-full">
                        <div className={`absolute inset-0 rounded-full bg-${fillingColor} shadow-lg`}>
                            <div className={`absolute inset-[15%] rounded-full flex items-center justify-center bg-${messageColor}`}>
                                {config.messageType === 'edible' && config.uploadedImage ? (
                                    <Image
                                        src={config.uploadedImage}
                                        alt="Uploaded design"
                                        className="w-full h-full object-contain rounded-full"
                                        width={200}
                                        height={200}
                                    />
                                ) : (
                                    <div className={`text-center ${config.pipingColor ? `text-${textColor}` : 'text-black-900'} italic p-8`}>
                                        {config.message || "Your message will be piped here..."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 text-2xl font-bold">
                        {config.size}
                    </div>
                    {renderCakeControls()}
                </div>
            );
        }

        return (
            <div className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}>
                <div className="relative flex justify-center items-center">
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Cake Board */}
                        {selectedBoard && (
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-[140%]">
                                <div className="relative">
                                    {/* Main board with gradient */}
                                    <div
                                        className={`h-4 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-2xl' : 'rounded-full'} 
                                            bg-gradient-to-b from-white to-gray-50 transition-all duration-300`}
                                        style={{
                                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        {/* Add subtle sheen effect */}
                                        <div className={`absolute inset-0 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-2xl' : 'rounded-full'}
                                            bg-gradient-to-r from-white/40 via-transparent to-white/40 transition-all duration-300`} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cake base */}
                        <div className="absolute bottom-6 w-full h-3/4 flex">
                            {/* Left side (sponge layers) */}
                            <div className={`w-1/2 h-full flex flex-col`}>
                                {Array(5).fill(0).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div className={`flex-1 bg-${spongeColor}`} />
                                        {gooColor && <div className={`h-1 bg-${gooColor}`} />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Right side (icing) */}
                            <div className={`w-1/2 h-full bg-${icingColor}`}>
                                {/* Add decorative icing details */}
                                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/20 to-transparent" />
                            </div>

                            {/* Filling preview */}
                            <div className={`absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-2 bg-${fillingColor}`} />
                        </div>

                        {/* Candles */}
                        {selectedCandle && (
                            <div className="absolute w-full flex justify-center -top-4">
                                {Array(6).fill(0).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="mx-3 flex flex-col items-center"
                                    >
                                        {/* Flame with animation */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [-5, 5, -5],
                                                opacity: [0.8, 1, 0.8],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatType: "reverse"
                                            }}
                                            className="relative w-3 h-4"
                                        >
                                            <div className="absolute inset-0 bg-amber-400 rounded-full blur-sm opacity-50" />
                                            <div className="absolute inset-0 bg-amber-300 rounded-full" />
                                        </motion.div>

                                        {/* Candle body */}
                                        <motion.div
                                            className={`w-2 h-16 rounded-full shadow-lg transform -translate-y-1 
                                                bg-gradient-to-b ${selectedCandle.color.toLowerCase() === 'blue'
                                                    ? 'from-blue-300 to-blue-200'
                                                    : selectedCandle.color.toLowerCase() === 'pink'
                                                        ? 'from-pink-300 to-pink-200'
                                                        : selectedCandle.color.toLowerCase() === 'white'
                                                            ? 'from-gray-200 to-gray-100'
                                                            : 'from-gray-300 to-gray-200'}`}
                                            whileHover={{ scale: 1.1 }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Message */}
                        {(showMessage || selectedPart === 'message') && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className={`w-32 h-32 rounded-full flex justify-center items-center text-sm p-4 text-center shadow-sm
                                    ${config.messageType === 'piped'
                                        ? `bg-${config.plaqueColor} text-${config.pipingColor}`
                                        : 'bg-white/90 text-pink-400'}`}
                                >
                                    {config.messageType === 'edible' && config.uploadedImage ? (
                                        <Image
                                            src={config.uploadedImage}
                                            alt="Uploaded design"
                                            width={120}
                                            height={120}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        config.message || "Your message here..."
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Size indicator */}
                        <div className="absolute bottom-4 right-4 text-2xl font-bold">
                            {config.size}
                        </div>

                        {renderCakeControls()}
                    </div>
                </div>
            </div>
        );
    };

    // Update the convertColorToTailwind function
    const convertColorToTailwind = (color: string): string => {
        if (!color) return 'bg-gray-200';

        // Remove any 'bg-' prefix if it exists in the API response
        const normalizedColor = color.toLowerCase().trim().replace('bg-', '');

        // Map API color names to Tailwind classes
        const colorMap: Record<string, string> = {
            'white': 'bg-white',
            'brown': 'bg-amber-800',
            'dark brown': 'bg-brown-900',
            'yellow': 'bg-yellow-300',
            'red': 'bg-red-500',
            'pink': 'bg-pink-400',
            'blue': 'bg-blue-400',
            'orange': 'bg-orange-400',
            'chocolate': 'bg-amber-800',
            'vanilla': 'bg-yellow-100',
            'various': 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400'
        };

        // Check for exact matches first
        if (colorMap[normalizedColor]) {
            return colorMap[normalizedColor];
        }

        // Handle compound colors
        if (normalizedColor.includes('light')) {
            const baseColor = normalizedColor.replace('light ', '');
            if (colorMap[baseColor]) {
                return colorMap[baseColor].replace('500', '300').replace('400', '200');
            }
        }
        if (normalizedColor.includes('dark')) {
            const baseColor = normalizedColor.replace('dark ', '');
            if (colorMap[baseColor]) {
                return colorMap[baseColor].replace('500', '700').replace('400', '600');
            }
        }

        // If no match found, try to create a Tailwind class from the color name
        return `bg-${normalizedColor}-400`;
    };

    // Update the getColorPreviewStyles function
    const getColorPreviewStyles = (color: string) => {
        const baseStyle = "w-full h-32 rounded-lg shadow-md transition-transform duration-300";

        // Handle empty or invalid color
        if (!color) return `${baseStyle} bg-gray-200`;

        // Remove any 'bg-' prefix if it exists
        const cleanColor = color.replace('bg-', '');

        if (cleanColor.toLowerCase() === 'various') {
            return `${baseStyle} bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400`;
        }

        const colorClass = convertColorToTailwind(cleanColor);
        return `${baseStyle} ${colorClass}`;
    };

    // Update the renderCustomizationPanel function's option cards
    const renderCustomizationPanel = () => {
        if (!selectedPart) return null;

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="text-red-500 text-xl">⚠️</div>
                    <p className="text-red-500 text-center">{error.message}</p>
                    <Button
                        onClick={() => {
                            setError(null);
                            handlePartSelect(selectedPart);
                        }}
                        variant="outline"
                    >
                        Try Again
                    </Button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                    <p className="text-gray-500">Loading options...</p>
                </div>
            );
        }

        const renderCompleteButton = () => (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStepComplete}
                className="mt-8 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 text-lg font-bold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
                HOÀN THÀNH BƯỚC NÀY
            </motion.button>
        );

        switch (selectedPart) {
            case 'cake':
                return (
                    <div className="space-y-6">
                        {/* Size options */}
                        <div className="mb-8">
                            <h3 className="font-bold mb-4 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                KÍCH THƯỚC
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {partOptions.find(group => group.type === 'Size')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.size === option.name ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSizeSelect({
                                            id: option.id,
                                            name: option.name,
                                            size: option.name,
                                            price: option.price,
                                            priceChange: option.price - config.price,
                                            feeds: option.name === 'Large' ? '30-40' : '8-10'
                                        })}
                                        className={`relative flex flex-col items-center p-4 rounded-xl border-2 
                                            ${config.size === option.name
                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                : 'border-gray-200 hover:border-pink-300'} 
                                            transition-all duration-300 transform`}
                                    >
                                        <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                            {option.name}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">{option.description}</div>
                                        <div className="text-pink-600 font-bold mt-2 text-lg">
                                            {option.price.toLocaleString()} VND
                                        </div>
                                        {config.size === option.name && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
                                            >
                                                <Check className="w-4 h-4" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Sponge options */}
                        <div className="mb-8">
                            <h3 className="font-bold mb-4 text-2xl text-pink-500">
                                BÁNH BỘT
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {partOptions.find(group => group.type === 'Sponge')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.sponge === option.id ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSpongeSelect({
                                            id: option.id,
                                            name: option.name,
                                            color: option.color,
                                            price: option.price
                                        })}
                                        className={`relative flex flex-col p-4 rounded-xl border-2
                                            ${config.sponge === option.id
                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                : 'border-gray-200 hover:border-pink-300'}
                                            transition-all duration-300`}
                                    >
                                        <div className="w-full mb-3">
                                            {option.image ? (
                                                <Image
                                                    src={option.image.file_url}
                                                    alt={option.name}
                                                    width={200}
                                                    height={200}
                                                    className="rounded-lg object-cover w-full h-32"
                                                />
                                            ) : (
                                                <div
                                                    className={getColorPreviewStyles(option.color)}
                                                    title={`Color: ${option.color}`}
                                                />
                                            )}
                                        </div>
                                        <div className="text-left w-full">
                                            <div className="font-medium text-gray-900">{option.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                                            <div className="text-pink-500 font-bold mt-2">
                                                {option.price.toLocaleString()} VND
                                            </div>
                                        </div>
                                        {config.sponge === option.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
                                            >
                                                <Check className="w-4 h-4" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Filling options */}
                        <div className="mb-8">
                            <h3 className="font-bold mb-4 text-2xl text-pink-500">
                                NHÂN BÁNH
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {partOptions.find(group => group.type === 'Filling')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.filling === option.id ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleFillingSelect({
                                            id: option.id,
                                            name: option.name,
                                            color: option.color,
                                            price: option.price,
                                            icon: '≡'
                                        })}
                                        className={`relative flex flex-col p-4 rounded-xl border-2
                                            ${config.filling === option.id
                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                : 'border-gray-200 hover:border-pink-300'}
                                            transition-all duration-300`}
                                    >
                                        <div className="w-full mb-3">
                                            {option.image ? (
                                                <Image
                                                    src={option.image.file_url}
                                                    alt={option.name}
                                                    width={200}
                                                    height={200}
                                                    className="rounded-lg object-cover w-full h-32"
                                                />
                                            ) : (
                                                <div
                                                    className={getColorPreviewStyles(option.color)}
                                                    style={{
                                                        backgroundColor: option.color.toLowerCase() === 'white' ? '#ffffff' : undefined
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="text-left w-full">
                                            <div className="font-medium text-gray-900">{option.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                                            <div className="text-pink-500 font-bold mt-2">
                                                {option.price.toLocaleString()} VND
                                            </div>
                                        </div>
                                        {config.filling === option.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
                                            >
                                                <Check className="w-4 h-4" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Goo options */}
                        <div className="mb-8">
                            <h3 className="font-bold mb-4 text-2xl text-pink-500">
                                NƯỚC SỐT
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {partOptions.find(group => group.type === 'Goo')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.goo === option.id ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleGooSelect({
                                            id: option.id,
                                            name: option.name,
                                            color: option.color,
                                            price: option.price
                                        })}
                                        className={`relative flex flex-col p-4 rounded-xl border-2
                                            ${config.goo === option.id
                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                : 'border-gray-200 hover:border-pink-300'}
                                            transition-all duration-300`}
                                    >
                                        <div className="w-full mb-3">
                                            {option.image ? (
                                                <Image
                                                    src={option.image.file_url}
                                                    alt={option.name}
                                                    width={200}
                                                    height={200}
                                                    className="rounded-lg object-cover w-full h-32"
                                                />
                                            ) : (
                                                <div
                                                    className={getColorPreviewStyles(option.color)}
                                                    style={{
                                                        backgroundColor: option.color.toLowerCase() === 'white' ? '#ffffff' : undefined
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="text-left w-full">
                                            <div className="font-medium text-gray-900">{option.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                                            <div className="text-pink-500 font-bold mt-2">
                                                {option.price.toLocaleString()} VND
                                            </div>
                                        </div>
                                        {config.goo === option.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
                                            >
                                                <Check className="w-4 h-4" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                        {renderCompleteButton()}
                    </div>
                );

            case 'outer-icing':
                return (
                    <div className="space-y-6">
                        <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            TRANG TRÍ
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {decorationOptions.map(group => (
                                group.items.map(option => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.outerIcing === option.id ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            // Find current decoration option to calculate price difference
                                            const currentIcingId = config.outerIcing;
                                            const currentIcing = decorationOptions
                                                .flatMap(g => g.items)
                                                .find(item => item.id === currentIcingId);
                                            
                                            // Calculate price difference
                                            const currentPrice = currentIcing?.price || 0;
                                            const newPrice = option.price || 0;
                                            const priceDifference = newPrice - currentPrice;
                                            
                                            setConfig(prev => ({
                                                ...prev,
                                                outerIcing: option.id,
                                                price: prev.price + priceDifference
                                            }));
                                        }}
                                        className={`relative flex flex-col p-4 rounded-xl border-2
                                            ${config.outerIcing === option.id
                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                : 'border-gray-200 hover:border-pink-300'}
                                            transition-all duration-300`}
                                    >
                                        <div className="w-full mb-3">
                                            {option.image ? (
                                                <Image
                                                    src={option.image.file_url}
                                                    alt={option.name}
                                                    width={200}
                                                    height={200}
                                                    className="rounded-lg object-cover w-full h-32"
                                                />
                                            ) : (
                                                <div
                                                    className={getColorPreviewStyles(option.color)}
                                                    title={option.name}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-4xl opacity-50">
                                                            {option.name.includes('Drip') ? '💧' :
                                                                option.name.includes('Sprinkles') ? '✨' :
                                                                    option.name.includes('TallSkirt') ? '👗' : '🎨'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left w-full">
                                            <div className="font-medium text-gray-900">{option.name}</div>
                                            <div className="text-pink-500 font-bold mt-2">
                                                {option.price.toLocaleString()} VND
                                            </div>
                                        </div>
                                        {config.outerIcing === option.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
                                            >
                                                <Check className="w-4 h-4" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))
                            ))}
                        </div>
                        <div className="mt-6 text-center text-sm text-gray-500">
                            Chọn kiểu trang trí cho bánh của bạn
                        </div>
                        {renderCompleteButton()}
                    </div>
                );

            case 'message':
                const messageTypeOptions: MessageOption[] = [
                    { id: 'none', name: 'KHÔNG', price: 0, icon: '✖️' },
                    { id: 'piped', name: 'CHỮ VIẾT TAY', price: 0, icon: '✍️' },
                    { id: 'edible', name: 'HÌNH ẢNH ĂN ĐƯỢC', price: 0, icon: '🖼️' }
                ];

                return (
                    <div className="space-y-6">
                        <h3 className="font-bold mb-4 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            THÔNG ĐIỆP
                        </h3>

                        {/* Message Type Selection */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {messageTypeOptions.map(option => (
                                <motion.button
                                    key={option.id}
                                    variants={selectedVariants}
                                    animate={config.messageType === option.id ? "selected" : "unselected"}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleMessageSelect(option)}
                                    className={`relative flex flex-col items-center p-4 rounded-xl border-2
                                        ${config.messageType === option.id
                                            ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                            : 'border-gray-200 hover:border-pink-300'}
                                        transition-all duration-300`}
                                >
                                    <div className="text-3xl mb-2">{option.icon}</div>
                                    <div className="text-sm font-medium text-center">{option.name}</div>
                                    <div className="text-pink-600 font-bold mt-1 text-sm">
                                        {option.price > 0 ? `${option.price.toLocaleString()} VND` : 'Miễn phí'}
                                    </div>
                                    {config.messageType === option.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
                                        >
                                            <Check className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {/* Message Content */}
                        {config.messageType !== 'none' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {config.messageType === 'edible' ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-center space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Tải lên hình ảnh của bạn
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="design-upload"
                                            />
                                            <label
                                                htmlFor="design-upload"
                                                className="cursor-pointer p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 transition-colors w-full"
                                            >
                                                {config.uploadedImage ? (
                                                    <div className="relative w-full aspect-square">
                                                        <Image
                                                            src={config.uploadedImage}
                                                            alt="Uploaded design"
                                                            fill
                                                            className="object-contain rounded-lg"
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleImageRemove();
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="mt-2 text-sm text-gray-600">Nhấn để tải lên thiết kế của bạn</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Thông điệp của bạn (tối đa 30 ký tự)
                                            </label>
                                            <input
                                                type="text"
                                                value={config.message}
                                                onChange={handleMessageChange}
                                                maxLength={30}
                                                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                                placeholder="Nhập thông điệp của bạn..."
                                            />
                                        </div>

                                        {/* Plaque Color Selection */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Màu nền
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {plaqueColors.map(color => (
                                                    <motion.button
                                                        key={color.id}
                                                        variants={selectedVariants}
                                                        animate={config.plaqueColor === color.id ? "selected" : "unselected"}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handlePlaqueColorChange(color.id)}
                                                        className={`relative flex items-center space-x-3 p-3 rounded-xl border-2
                                                            ${config.plaqueColor === color.id
                                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                                : 'border-gray-200 hover:border-pink-300'}
                                                            transition-all duration-300`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg ${color.color}`} />
                                                        <span className="text-sm">{color.name}</span>
                                                        {config.plaqueColor === color.id && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Piping Color Selection */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Màu chữ
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {messageOptions.find(group => group.type === 'PIPING_COLOUR')?.items.map(option => (
                                                    <motion.button
                                                        key={option.id}
                                                        variants={selectedVariants}
                                                        animate={config.pipingColor === option.id ? "selected" : "unselected"}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setConfig(prev => ({ ...prev, pipingColor: option.id }))}
                                                        className={`relative flex items-center space-x-3 p-3 rounded-xl border-2
                                                            ${config.pipingColor === option.id
                                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                                : 'border-gray-200 hover:border-pink-300'}
                                                            transition-all duration-300`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg ${convertColorToTailwind(option.color)}`} />
                                                        <span className="text-sm">{option.name}</span>
                                                        {config.pipingColor === option.id && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {renderCompleteButton()}
                    </div>
                );

            case 'candles':
                return (
                    <div>
                        <h3 className="font-bold mb-2">CANDLES</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {candleOptions.map(option => (
                                <div key={option.id} className="flex flex-col items-center">
                                    <button
                                        className={`w-12 h-12 ${option.color} ${config.candles === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'} rounded flex flex-col items-center justify-center`}
                                        onClick={() => handleOptionSelect('candles', option.id)}
                                    >
                                        <div className="w-1 h-8 bg-gradient-to-b from-amber-100 to-transparent"></div>
                                    </button>
                                    <p className="text-xs text-center mt-1">{option.name}</p>
                                    <p className="text-xs font-bold">{option.price} VND</p>
                                </div>
                            ))}
                            <div className="col-span-3 mt-4">
                                <Button variant="outline" onClick={handleRemoveCandles}>
                                    Xóa Nến
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 'board':
                return (
                    <div className="space-y-6">
                        <h3 className="font-bold mb-4 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            ĐẾ BÁNH
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {boardOptions.map(option => (
                                <motion.button
                                    key={option.id}
                                    variants={selectedVariants}
                                    animate={config.board === option.id ? "selected" : "unselected"}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleOptionSelect('board', option.id)}
                                    className={`relative flex flex-col items-center p-6 rounded-xl border-2
                                        ${config.board === option.id
                                            ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                            : 'border-gray-200 hover:border-pink-300'}
                                        transition-all duration-300`}
                                >
                                    <div
                                        className={`w-24 h-24 ${option.color} 
                                            ${option.shape === 'square' ? 'rounded-2xl' : 'rounded-full'}
                                            shadow-md transition-all duration-300
                                            flex items-center justify-center`}
                                    >
                                        <span className="text-4xl opacity-50">🎂</span>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <div className="font-medium text-gray-900">{option.name}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {option.shape === 'square' ? 'Góc bo tròn' : 'Hình tròn hoàn hảo'}
                                        </div>
                                        <div className="text-pink-600 font-bold mt-2">
                                            {(10000).toLocaleString()} VND
                                        </div>
                                    </div>
                                    {config.board === option.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-2"
                                        >
                                            <Check className="w-5 h-5" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                        <div className="mt-4 text-sm text-gray-500 text-center">
                            Chọn hình dạng đế bánh phù hợp với thiết kế của bạn
                        </div>
                    </div>
                );

            case 'extras':
                return (
                    <div>
                        <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            THÊM PHẦN
                        </h3>
                        <div className="space-y-8">
                            {/* Candles Section */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-xl text-gray-800 pl-2 border-l-4 border-pink-500">
                                    NẾN TRANG TRÍ 🕯️
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {extraOptions.find(group => group.type === 'Candles')?.items.map(option => (
                                        <motion.button
                                            key={option.id}
                                            variants={selectedVariants}
                                            animate={config.candles === option.id ? "selected" : "unselected"}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                // Find current candle option and get its price
                                                const currentCandles = config.candles;
                                                const currentOption = extraOptions.find(group => 
                                                    group.type === 'Candles'
                                                )?.items.find(item => 
                                                    item.id === currentCandles
                                                );
                                                
                                                // Calculate price difference
                                                const currentPrice = currentOption?.price || 0;
                                                const priceDifference = option.price - currentPrice;
                                                
                                                if (Array.isArray(config.extras)) {
                                                    // Remove any existing candle from extras array
                                                    const extrasWithoutCandles = config.extras.filter(id => {
                                                        const item = extraOptions.find(group =>
                                                            group.items.some(item => item.id === id)
                                                        )?.items.find(item => item.id === id);
                                                        return item?.type !== 'Candles';
                                                    });

                                                    setConfig(prev => ({
                                                        ...prev,
                                                        extras: [...extrasWithoutCandles, option.id],
                                                        candles: option.id,
                                                        price: prev.price + priceDifference
                                                    }));
                                                }
                                            }}
                                            className={`relative flex items-center p-6 rounded-xl border-2 w-full
                                                ${config.candles === option.id
                                                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                    : 'border-gray-200 hover:border-pink-300'}
                                                transition-all duration-300`}
                                        >
                                            <div className="flex-1 flex items-center gap-6">
                                                <div className={`relative w-24 h-24 rounded-lg overflow-hidden 
                                                    ${option.image
                                                        ? ''
                                                        : `bg-gradient-to-br from-${option.color.toLowerCase()}-200 to-white`}`
                                                }>
                                                    {option.image ? (
                                                        <Image
                                                            src={option.image.file_url}
                                                            alt={option.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                                            🕯️
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-lg text-gray-900">{option.name}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {option.description}
                                                    </div>
                                                    <div className="text-pink-600 font-bold mt-2 text-xl">
                                                        {option.price.toLocaleString()} VND
                                                    </div>
                                                </div>
                                            </div>
                                            {config.candles === option.id && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-2"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Cake Board Section */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-xl text-gray-800 pl-2 border-l-4 border-pink-500">
                                    ĐẾ BÁNH 🎂
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {extraOptions.find(group => group.type === 'CakeBoard')?.items.map(option => (
                                        <motion.button
                                            key={option.id}
                                            variants={selectedVariants}
                                            animate={config.board === option.id ? "selected" : "unselected"}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                // Find current board option and get its price
                                                const currentBoard = config.board;
                                                const currentOption = extraOptions.find(group => 
                                                    group.type === 'CakeBoard'
                                                )?.items.find(item => 
                                                    item.id === currentBoard
                                                );
                                                
                                                // Calculate price difference
                                                const currentPrice = currentOption?.price || 0;
                                                const priceDifference = option.price - currentPrice;
                                                
                                                if (Array.isArray(config.extras)) {
                                                    // Remove any existing board from extras array
                                                    const extrasWithoutBoards = config.extras.filter(id => {
                                                        const item = extraOptions.find(group =>
                                                            group.items.some(item => item.id === id)
                                                        )?.items.find(item => item.id === id);
                                                        return item?.type !== 'CakeBoard';
                                                    });

                                                    setConfig(prev => ({
                                                        ...prev,
                                                        extras: [...extrasWithoutBoards, option.id],
                                                        board: option.id,
                                                        price: prev.price + priceDifference
                                                    }));
                                                }
                                            }}
                                            className={`relative flex items-center p-6 rounded-xl border-2 w-full
                                                ${config.board === option.id
                                                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                    : 'border-gray-200 hover:border-pink-300'}
                                                transition-all duration-300`}
                                        >
                                            <div className="flex-1 flex items-center gap-6">
                                                <div className={`relative w-24 h-24 rounded-lg overflow-hidden 
                                                    ${option.image
                                                        ? ''
                                                        : `bg-gradient-to-br from-${option.color.toLowerCase()}-100 to-white`}`
                                                }>
                                                    {option.image ? (
                                                        <Image
                                                            src={option.image.file_url}
                                                            alt={option.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                                            🎂
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-lg text-gray-900">{option.name}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {option.description}
                                                    </div>
                                                    <div className="text-pink-600 font-bold mt-2 text-xl">
                                                        {option.price.toLocaleString()} VND
                                                    </div>
                                                </div>
                                            </div>
                                            {config.board === option.id && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-2"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 text-center text-sm text-gray-500">
                            Chọn một loại nến và một loại đế bánh để hoàn thiện chiếc bánh của bạn
                        </div>
                        {renderCompleteButton()}
                    </div>
                );

            default:
                return null;
        }
    };

    // Update the bottom controls in the renderCake function
    const renderCakeControls = () => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white/95 transition-all"
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        {isZoomed ? (
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" />
                        ) : (
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        )}
                    </svg>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSaveDesign}
                    className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white/95 transition-all"
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <path d="M17 21v-8H7v8M7 3v5h8" />
                    </svg>
                </motion.button>

                {/* <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOrderCake}
                    disabled={!completedSteps.cake || !completedSteps.decoration || !completedSteps.message || !completedSteps.extras}
                    className={`flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl
                        ${(!completedSteps.cake || !completedSteps.decoration || !completedSteps.message || !completedSteps.extras)
                            ? 'opacity-50 cursor-not-allowed from-gray-400 to-gray-500 hover:from-gray-400 hover:to-gray-500'
                            : 'hover:from-pink-700 hover:to-purple-700'}`}
                >
                    ĐẶT HÀNG NGAY
                </motion.button> */}
            </motion.div>
        );
    };

    // Update the handleAddToCart function
    const handleAddToCart = () => {
        const customCake = {
            id: editId || crypto.randomUUID(),
            quantity: 1,
            price: config.price,
            storeId: storeId,
            config: {
                size: config.size,
                sponge: config.sponge,
                filling: config.filling,
                outerIcing: config.outerIcing,
                candles: config.candles,
                goo: config.goo,
                extras: Array.isArray(config.extras) ? config.extras : [],
                board: config.board,
                imageUrl: config.imageUrl || '',
                price: config.price,
                message: config.message,
                messageType: config.messageType,
                plaqueColor: config.plaqueColor,
                uploadedImage: config.uploadedImage,
                topping: config.topping,
                name: `Custom ${config.size} Cake`,
                description: `Delicious ${config.size} cake with ${getSelectedOption('Sponge', config.sponge)?.name || 'Unknown'} sponge, filled with ${getSelectedOption('Filling', config.filling)?.name || 'Unknown'}, and covered in ${getSelectedOption('Icing', config.outerIcing)?.name || 'Unknown'} icing${config.goo ? `, topped with ${getSelectedOption('Goo', config.goo)?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
                type: 'custom'
            }
        };

        addToCart(customCake);
        router.push('/cart');
    };

    // Add back the missing helper functions
    const getOptionPrice = (option: ApiItem): number => {
        return option.price || 0;
    };

    const getOptionName = (option: ApiItem): string => {
        return option.name || 'Unnamed Option';
    };

    // Add function to handle step completion
    const handleStepComplete = () => {
        setSelectedPart(null);

        // Check if current step matches the natural progression
        const canCompleteCake = currentStep === 'cake' && !completedSteps.cake;
        const canCompleteDecoration = currentStep === 'decoration' && completedSteps.cake && !completedSteps.decoration;
        const canCompleteMessage = currentStep === 'message' && completedSteps.decoration && !completedSteps.message;
        const canCompleteExtras = currentStep === 'extras' && completedSteps.message && !completedSteps.extras;

        // Only allow progression if the current step's requirements are met and follows natural progression
        if (canCompleteCake && config.size && config.sponge && config.filling) {
            setCompletedSteps(prev => ({ ...prev, cake: true }));
            setCurrentStep('decoration');
        } else if (canCompleteDecoration && config.outerIcing) {
            setCompletedSteps(prev => ({ ...prev, decoration: true }));
            setCurrentStep('message');
        } else if (canCompleteMessage) {
            // Allow completion of message step even if no message is added (as it's optional)
            setCompletedSteps(prev => ({ ...prev, message: true }));
            setCurrentStep('extras');
        } else if (canCompleteExtras) {
            // Allow completion of extras step even if no extras are added (as they're optional)
            setCompletedSteps(prev => ({ ...prev, extras: true }));
        }

        // Show toast message if requirements aren't met
        if (currentStep === 'cake' && (!config.size || !config.sponge || !config.filling)) {
            toast.error('Please complete all required cake options before proceeding');
        } else if (currentStep === 'decoration' && !config.outerIcing) {
            toast.error('Please select a decoration option before proceeding');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row w-full max-w-7xl mx-auto gap-8 p-6"
            >
                {/* Left side - Cake Preview */}
                <motion.div
                    layout
                    className="flex-1 sticky top-6 h-fit"
                >
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative aspect-square w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-purple-100/20 rounded-3xl" />
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedPart || 'default'}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                ref={cakePreviewRef}
                            >
                                {renderCake()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Right side - Configuration Panel */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full md:w-[400px]"
                >
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-100">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-8 border-b border-pink-100"
                        >
                            <div className="flex justify-between items-center">
                                <motion.h1
                                    initial={{ y: -20 }}
                                    animate={{ y: 0 }}
                                    className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                                >
                                    BÁNH CUSTOM
                                </motion.h1>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleResetConfig}
                                    className="p-2 rounded-full hover:bg-pink-50 transition-all"
                                    title="Reset Design"
                                >
                                    <svg
                                        className="w-5 h-5 text-pink-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                </motion.button>
                            </div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-3xl font-bold text-pink-600 mt-2 flex items-center"
                            >
                                {config.price.toLocaleString()} VND
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="ml-2 text-sm bg-pink-100 hover:bg-pink-200 text-pink-700 px-2 py-1 rounded-full transition-colors"
                                    onClick={() => setShowJson(!showJson)}
                                >
                                    {showJson ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                </motion.button>
                            </motion.div>
                            
                            {/* Price summary section */}
                            <AnimatePresence>
                                {showJson && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 bg-pink-50 rounded-lg p-4 text-sm">
                                            <h3 className="font-bold text-pink-700 mb-2">Chi tiết giá:</h3>
                                            <ul className="space-y-1">
                                                {config.size && (
                                                    <li className="flex justify-between">
                                                        <span>Kích thước ({config.size}):</span>
                                                        <span className="font-medium">
                                                            {partOptions.find(group => group.type === 'Size')?.items
                                                                .find(item => item.name === config.size)?.price.toLocaleString() || 0} VND
                                                        </span>
                                                    </li>
                                                )}
                                                {config.sponge && (
                                                    <li className="flex justify-between">
                                                        <span>Bánh bột ({getSelectedOption('Sponge', config.sponge)?.name}):</span>
                                                        <span className="font-medium">
                                                            {(getSelectedOption('Sponge', config.sponge)?.price || 0).toLocaleString()} VND
                                                        </span>
                                                    </li>
                                                )}
                                                {config.filling && (
                                                    <li className="flex justify-between">
                                                        <span>Nhân bánh ({getSelectedOption('Filling', config.filling)?.name}):</span>
                                                        <span className="font-medium">
                                                            {(getSelectedOption('Filling', config.filling)?.price || 0).toLocaleString()} VND
                                                        </span>
                                                    </li>
                                                )}
                                                {config.outerIcing && (
                                                    <li className="flex justify-between">
                                                        <span>Trang trí ({decorationOptions.find(group => 
                                                            group.items.some(item => item.id === config.outerIcing))?.items
                                                            .find(item => item.id === config.outerIcing)?.name}):</span>
                                                        <span className="font-medium">
                                                            {(decorationOptions.find(group => 
                                                                group.items.some(item => item.id === config.outerIcing))?.items
                                                                .find(item => item.id === config.outerIcing)?.price || 0).toLocaleString()} VND
                                                        </span>
                                                    </li>
                                                )}
                                                {config.goo && (
                                                    <li className="flex justify-between">
                                                        <span>Nước sốt ({getSelectedOption('Goo', config.goo)?.name}):</span>
                                                        <span className="font-medium">
                                                            {(getSelectedOption('Goo', config.goo)?.price || 0).toLocaleString()} VND
                                                        </span>
                                                    </li>
                                                )}
                                                {config.messageType !== 'none' && (
                                                    <li className="flex justify-between">
                                                        <span>Thông điệp ({config.messageType === 'piped' ? 'Chữ viết tay' : 'Hình ảnh ăn được'}):</span>
                                                        <span className="font-medium">
                                                            {messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item => 
                                                                (config.messageType === 'none' && item.name === 'NONE') ||
                                                                (config.messageType === 'piped' && item.name === 'PIPED MESSAGE') ||
                                                                (config.messageType === 'edible' && item.name === 'EDIBLE IMAGE')
                                                            )?.price.toLocaleString() || 0} VND
                                                        </span>
                                                    </li>
                                                )}
                                                {config.candles && (
                                                    <li className="flex justify-between">
                                                        <span>Nến ({extraOptions.find(group => group.type === 'Candles')?.items
                                                            .find(item => item.id === config.candles)?.name}):</span>
                                                        <span className="font-medium">
                                                            {(extraOptions.find(group => group.type === 'Candles')?.items
                                                                .find(item => item.id === config.candles)?.price || 0).toLocaleString()} VND
                                                        </span>
                                                    </li>
                                                )}
                                                {config.board && (
                                                    <li className="flex justify-between">
                                                        <span>Đế bánh ({extraOptions.find(group => group.type === 'CakeBoard')?.items
                                                            .find(item => item.id === config.board)?.name}):</span>
                                                        <span className="font-medium">
                                                            {(extraOptions.find(group => group.type === 'CakeBoard')?.items
                                                                .find(item => item.id === config.board)?.price || 0).toLocaleString()} VND
                                                        </span>
                                                    </li>
                                                )}
                                                <li className="pt-2 mt-1 border-t border-pink-200 flex justify-between font-bold">
                                                    <span>Tổng tiền:</span>
                                                    <span>{config.price.toLocaleString()} VND</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {!selectedPart ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-4"
                                        >
                                            <MenuItem
                                                icon="🍰"
                                                title="BÁNH"
                                                subtitle={`${config.size}`}
                                                onClick={() => {
                                                    if (currentStep === 'cake' || completedSteps.cake) {
                                                        handlePartSelect('cake');
                                                    }
                                                }}
                                                gradient="from-pink-500 to-rose-500"
                                                disabled={false}
                                                completed={completedSteps.cake}
                                            />
                                            <MenuItem
                                                icon="🧁"
                                                title="TRANG TRÍ"
                                                subtitle="KEM SÔ CÔ LA"
                                                onClick={() => {
                                                    if (completedSteps.cake && (currentStep === 'decoration' || completedSteps.decoration)) {
                                                        handlePartSelect('outer-icing');
                                                    }
                                                }}
                                                gradient="from-purple-500 to-indigo-500"
                                                disabled={!completedSteps.cake}
                                                completed={completedSteps.decoration}
                                            />
                                            <MenuItem
                                                icon="✍️"
                                                title="CHỮ & HÌNH ẢNH"
                                                subtitle={config.message || "CHỮ VIẾT TAY + PLAQUE SÔ CÔ LA TRẮNG"}
                                                onClick={() => {
                                                    if (completedSteps.decoration && (currentStep === 'message' || completedSteps.message)) {
                                                        handlePartSelect('message');
                                                    }
                                                }}
                                                gradient="from-blue-500 to-cyan-500"
                                                disabled={!completedSteps.decoration}
                                                completed={completedSteps.message}
                                            />
                                            <MenuItem
                                                icon="🍪"
                                                title="THÊM PHẦN"
                                                subtitle={Array.isArray(config.extras) && config.extras.length > 0
                                                    ? `Đã thêm ${config.extras.length} phần phụ`
                                                    : "Thêm topping đặc biệt"}
                                                onClick={() => {
                                                    if (completedSteps.message && (currentStep === 'extras' || completedSteps.extras)) {
                                                        handlePartSelect('extras');
                                                    }
                                                }}
                                                gradient="from-yellow-500 to-orange-500"
                                                disabled={!completedSteps.message}
                                                completed={completedSteps.extras}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <div className="flex items-center gap-2 mb-6">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handlePartSelect(null)}
                                                    className="p-2 hover:bg-pink-50 rounded-full transition-colors"
                                                >
                                                    <ArrowLeft className="w-6 h-6 text-pink-600" />
                                                </motion.button>
                                                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                                    {selectedPart.toUpperCase()}
                                                </h2>
                                            </div>
                                            {renderCustomizationPanel()}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-6 border-t border-pink-100 flex gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSaveDesign}
                                className="flex-1 bg-white border-2 border-pink-600 text-pink-600 py-4 text-lg font-bold rounded-xl hover:bg-pink-50 transition-all shadow-lg hover:shadow-xl"
                            >
                                LƯU THIẾT KẾ
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOrderCake}
                                disabled={!completedSteps.cake || !completedSteps.decoration || !completedSteps.message || !completedSteps.extras}
                                className={`flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl
                                    ${(!completedSteps.cake || !completedSteps.decoration || !completedSteps.message || !completedSteps.extras)
                                        ? 'opacity-50 cursor-not-allowed from-gray-400 to-gray-500 hover:from-gray-400 hover:to-gray-500'
                                        : 'hover:from-pink-700 hover:to-purple-700'}`}
                            >
                                ĐẶT HÀNG NGAY
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

// Update MenuItem component to handle the new step logic
const MenuItem = ({
    icon,
    title,
    subtitle,
    onClick,
    gradient,
    disabled,
    completed
}: {
    icon: string;
    title: string;
    subtitle: string;
    onClick: () => void;
    gradient: string;
    disabled: boolean;
    completed: boolean;
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgb(249, 250, 251)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border border-pink-100
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
                ${completed ? 'bg-green-50' : ''}`}
        >
            <motion.span
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-3xl"
            >
                {icon}
            </motion.span>
            <div className="flex-1 text-left">
                <motion.div
                    className={`font-bold text-lg bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                >
                    {title}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600"
                >
                    {subtitle}
                </motion.div>
            </div>
            {completed ? (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
                >
                    ✓
                </motion.div>
            ) : (
                <motion.svg
                    whileHover={{ x: 5 }}
                    className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-pink-400'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M9 18l6-6-6-6" />
                </motion.svg>
            )}
        </motion.button>
    );
};

// Update global styles
const globalStyles = `
                            .custom-scrollbar {
                                scrollbar - width: thin;
                            scrollbar-color: rgba(236, 72, 153, 0.3) transparent;
    }

                            .custom-scrollbar::-webkit-scrollbar {
                                width: 6px;
    }

                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
    }

                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background - color: rgba(236, 72, 153, 0.3);
                            border-radius: 3px;
    }

                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background - color: rgba(236, 72, 153, 0.5);
    }

                            @keyframes float {
                                0 % { transform: translateY(0px); }
        50% {transform: translateY(-10px); }
                            100% {transform: translateY(0px); }
    }

                            .float-animation {
                                animation: float 3s ease-in-out infinite;
    }
                            `;

export default CakeCustomizer;