"use client";

import { Button } from '@/components/ui/button';
import { useCart } from '@/app/store/useCart';
import { CakeConfig } from '@/types/cake';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useCakeConfigStore } from '@/components/shared/client/stores/cake-config';
import { toast } from 'react-hot-toast';

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
        color: 'bg-amber-200'
    },
    {
        id: 'caramelised-white',
        name: 'CARAMELISED WHITE CHOCOLATE',
        price: 3.00,
        available: true,
        icon: '🍫',
        color: 'bg-amber-100'
    },
    {
        id: 'oreo-crumbs',
        name: 'OREO CRUMBS',
        price: 2.00,
        available: true,
        icon: '🖤',
        color: 'bg-gray-900'
    },
    {
        id: 'biscoff-crumbs',
        name: 'BISCOFF CRUMBS',
        price: 2.00,
        available: true,
        icon: '🍪',
        color: 'bg-amber-400'
    },
    {
        id: 'malted-cornflakes',
        name: 'MALTED CORNFLAKES',
        price: 3.00,
        available: true,
        icon: '🥣',
        color: 'bg-yellow-200'
    },
    {
        id: 'pinata',
        name: 'PINATA IT!',
        price: 12.00,
        available: true,
        icon: '🎨',
        color: 'bg-gradient-to-r from-pink-400 to-purple-400'
    }
];

// Add these new types
type MessageOption = {
    id: 'none' | 'piped' | 'edible';
    name: string;
    price: number;
    icon: string;
}

// Add message options
const messageOptions: MessageOption[] = [
    { id: 'none', name: 'NONE', price: 0, icon: '✖️' },
    { id: 'piped', name: 'PIPED MESSAGE', price: 7.00, icon: '✍️' },
    { id: 'edible', name: 'EDIBLE IMAGE', price: 8.00, icon: '🖼️' }
];

// Add these types
type PlaqueColor = {
    id: string;
    name: string;
    color: string;
}

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

const getInitialCakeConfig = (): CakeConfig => {
    if (typeof window === 'undefined') {
        // Return default config when running on server
        return {
            size: '8"',
            price: 95.99,
            sponge: 'vanilla',
            outerIcing: 'pink-vanilla',
            filling: 'white-vanilla',
            topping: null,
            message: '',
            candles: null,
            board: 'white',
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
        size: '8"',
        price: 95.99,
        sponge: 'vanilla',
        outerIcing: 'pink-vanilla',
        filling: 'white-vanilla',
        topping: null,
        message: '',
        candles: null,
        board: 'white',
        goo: null,
        extras: [],
        messageType: 'none',
        plaqueColor: 'white',
        uploadedImage: null,
        imageUrl: null,
        pipingColor: 'white'
    };
};

const CakeCustomizer = ({ storeId }: { storeId: string }) => {
    const { addToCart, items } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');
    const { config, setConfig } = useCakeConfigStore();

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
            size: '8"',
            price: 95.99,
            sponge: 'vanilla',
            outerIcing: 'pink-vanilla',
            filling: 'white-vanilla',
            topping: null,
            message: '',
            candles: null,
            board: 'white',
            goo: null,
            extras: [],
            messageType: 'none' as 'none' | 'piped' | 'edible',
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

    const boardOptions = [
        { id: 'white', name: 'WHITE BOARD', color: 'bg-white', border: 'border' },
        { id: 'pink', name: 'PINK BOARD', color: 'bg-pink-200' },
        { id: 'blue', name: 'BLUE BOARD', color: 'bg-cyan-200' }
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
        setConfig({
            ...config,
            [optionType]: optionId
        });

        if (optionType === 'candles' && !config.candles) {
            const selectedOption = candleOptions.find(option => option.id === optionId);
            setConfig(prev => ({ ...prev, price: prev.price + (selectedOption?.price || 0) }));
        }

        if (optionType === 'filling' || optionType === 'outerIcing' || optionType === 'board') {
            setTimeout(() => setSelectedPart(null), 500);
        }
    };

    // Update the candles removal handler
    const handleRemoveCandles = () => {
        setConfig(prev => ({
            ...prev,
            candles: null,
            price: prev.price - 4.99
        }));
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

            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.log('No access token found - user not logged in');
                toast.error('Please login to order a cake');
                return;
            }
            console.log('Access token found');

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
                selectedPlaqueColor?.id,
                selectedPipingColor?.id
            ].filter(Boolean) as string[];

            console.log('Selected message option IDs:', messageOptionIds);

            // Prepare the API request body
            const requestBody = {
                cake_name: `Custom ${config.size} Cake`,
                cake_description: `${config.sponge} sponge with ${config.filling} filling and ${config.outerIcing} icing`,
                bakery_id: storeId,
                message_selection: {
                    text: config.message,
                    message_type: config.messageType === 'edible' ? 'IMAGE' : config.messageType === 'piped' ? 'TEXT' : 'NONE',
                    image_id: config.uploadedImage ? "3fa85f64-5717-4562-b3fc-2c963f66afa6" : null,
                    cake_message_option_ids: messageOptionIds
                },
                part_selections: [
                    {
                        part_type: "SIZE",
                        part_option_id: config.size
                    },
                    {
                        part_type: "SPONGE",
                        part_option_id: config.sponge
                    },
                    {
                        part_type: "FILLING",
                        part_option_id: config.filling
                    }
                ],
                decoration_selections: [
                    {
                        decoration_type: "OUTER_ICING",
                        decoration_option_id: config.outerIcing
                    }
                ],
                extra_selections: config.extras.map(extraId => ({
                    extra_type: "TOPPING",
                    extra_option_id: extraId
                }))
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

            if (!response.ok) {
                console.error('API request failed:', response.status, response.statusText);
                throw new Error('Failed to create custom cake');
            }

            const data = await response.json();
            console.log('API response:', data);

            // Add to cart using the cart service
            const cartItem = {
                id: data.payload.id,
                quantity: 1,
                price: config.price,
                storeId: storeId,
                config: {
                    ...config,
                    name: `Custom ${config.size} Cake`,
                    description: `${config.sponge} sponge with ${config.filling} filling and ${config.outerIcing} icing`,
                    type: 'custom'
                }
            };
            console.log('Adding to cart:', cartItem);

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
            extras: config.extras.map(id => {
                const extra = extraOptions.flatMap(group => group.items).find(item => item.id === id);
                return {
                    type: id,
                    name: extra?.name
                };
            }),
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
        setConfig({
            size: option.size,
            price: option.price
        });
    };

    const handleSpongeSelect = (option: SpongeOption) => {
        setConfig({
            sponge: option.id,
            price: config.price + (option.price || 0)
        });
    };

    const handleFillingSelect = (option: FillingOption) => {
        setConfig({
            filling: option.id
        });
    };

    const handleGooSelect = (option: GooOption) => {
        setConfig({
            goo: option.id,
            price: config.price + option.price
        });
    };

    const handleExtraSelect = (option: ExtraOption) => {
        const extras = config.extras.includes(option.id)
            ? config.extras.filter(id => id !== option.id)
            : [...config.extras, option.id];

        const price = config.price + (config.extras.includes(option.id) ? -option.price : option.price);

        setConfig({
            extras,
            price
        });
    };

    const handleMessageTypeSelect = (option: MessageOption) => {
        setConfig({
            messageType: option.id,
            message: option.id === 'none' ? '' : config.message,
            price: config.price + option.price - (
                config.messageType === 'piped' ? 7.00 :
                    config.messageType === 'edible' ? 8.00 : 0
            )
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
            const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/decoration_options');
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
            const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/extra_options');
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
            const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/message_options');
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
            const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/part_options');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            setPartOptions(data.payload);
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

    // Update the handlePartSelect function to handle errors
    const handlePartSelect = (part: SelectedPart) => {
        setError(null);
        setSelectedPart(part);

        // Fetch data based on selected part
        switch (part) {
            case 'outer-icing':
                fetchDecorationOptions();
                break;
            case 'extras':
                fetchExtraOptions();
                break;
            case 'message':
                fetchMessageOptions();
                break;
            case 'cake':
                fetchPartOptions();
                break;
        }
    };

    // Render cake visualization
    const renderCake = () => {
        const outerIcingColor = icingOptions.find(option => option.id === config.outerIcing)?.color || 'bg-pink-200';
        const spongeColor = spongeOptions.find(option => option.id === config.sponge)?.color || 'bg-amber-50';
        const gooColor = gooOptions.find(option => option.id === config.goo)?.color;
        const showCandles = config.candles !== null;
        const showMessage = config.message !== '';

        // Special preview for message customization
        if (selectedPart === 'message' as SelectedPart) {
            const selectedFilling = fillingIcingOptions.find(option => option.id === config.filling);
            const fillingColor = selectedFilling?.color || 'bg-pink-200';

            return (
                <div className="relative w-full aspect-square flex items-center justify-center">
                    {/* Large circular preview */}
                    <div className="relative w-[80%] aspect-square rounded-full">
                        {/* Outer ring - using filling color */}
                        <div className={`absolute inset-0 rounded-full ${fillingColor} shadow-lg`}>
                            {/* Center content - plaque color */}
                            <div className={`absolute inset-[15%] rounded-full flex items-center justify-center
                                ${config.messageType === 'piped'
                                    ? plaqueColors.find(c => c.id === config.plaqueColor)?.color || 'bg-amber-50'
                                    : 'bg-white'
                                }`}
                            >
                                {config.messageType === 'edible' && config.uploadedImage ? (
                                    <Image
                                        src={config.uploadedImage}
                                        alt="Uploaded design"
                                        className="w-full h-full object-contain rounded-full"
                                        width={200}
                                        height={200}
                                    />
                                ) : (
                                    <div className="text-center text-pink-400 italic p-8">
                                        {config.message || "Your message will be piped here..."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Size indicator */}
                    <div className="absolute bottom-4 right-4 text-2xl font-bold">
                        {config.size}
                    </div>

                    {renderCakeControls()}
                </div>
            );
        }

        // Regular cake preview for other sections
        return (
            <div className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}>
                <div className="relative flex justify-center items-center">
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Cake base */}
                        <div className="absolute bottom-0 w-full h-3/4 flex">
                            {/* Left side (sponge layers) */}
                            <div className={`w-1/2 h-full ${spongeColor} flex flex-col`}>
                                {/* Sponge layers */}
                                {Array(5).fill(0).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div className={`flex-1 ${spongeColor}`} />
                                        {gooColor && <div className={`h-1 ${gooColor}`} />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Right side (icing) */}
                            <div className={`w-1/2 h-full ${outerIcingColor}`} />
                        </div>

                        {/* Candles with improved styling and animations */}
                        {showCandles && (
                            <div className="absolute w-full flex justify-center -top-2">
                                {Array(6).fill(0).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="mx-3 flex flex-col items-center"
                                    >
                                        {/* Flame animation */}
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
                                            className="relative w-4 h-6"
                                        >
                                            <div className="absolute inset-0 bg-amber-400 rounded-full blur-sm opacity-50" />
                                            <div className="absolute inset-0 bg-amber-300 rounded-full" />
                                        </motion.div>

                                        {/* Candle body */}
                                        <motion.div
                                            className={`w-3 h-24 rounded-full shadow-lg transform -translate-y-1
                                                ${config.candles === 'pink-candles' ? 'bg-gradient-to-b from-pink-300 to-pink-200' :
                                                    config.candles === 'blue-candles' ? 'bg-gradient-to-b from-blue-300 to-blue-200' :
                                                        'bg-gradient-to-b from-gray-100 to-white'}
                                            `}
                                            whileHover={{ scale: 1.1 }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Extras */}
                        {config.extras.length > 0 && (
                            <div className="absolute inset-x-0 top-1/2 flex justify-center">
                                <div className="relative w-3/4 flex flex-wrap justify-center gap-2">
                                    {config.extras.map((extraId, index) => {
                                        const extra = extraOptions.flatMap(group => group.items).find(item => item.id === extraId);
                                        if (!extra) return null;

                                        return (
                                            <motion.div
                                                key={extraId}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="absolute"
                                                style={{
                                                    top: `${Math.sin(index * (Math.PI / 3)) * 30}%`,
                                                    left: `${Math.cos(index * (Math.PI / 3)) * 30}%`,
                                                }}
                                            >
                                                <div className={`w-8 h-8 rounded-full ${extra.color} shadow-lg`} />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Message */}
                        {(showMessage || selectedPart === 'message') && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-32 h-32 bg-white/90 rounded-full flex justify-center items-center text-sm text-pink-400 p-4 text-center shadow-sm">
                                    {config.message || "Your message here..."}
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

    // Add helper functions for data handling
    const getOptionColor = (option: ApiItem): string => {
        return option.color || 'bg-gray-200';
    };

    const getOptionPrice = (option: ApiItem): number => {
        return option.price || 0;
    };

    const getOptionName = (option: ApiItem): string => {
        return option.name || 'Unnamed Option';
    };

    const getOptionImage = (option: ApiItem): string | null => {
        return option.image?.file_url || null;
    };

    // Update the renderCustomizationPanel function
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

        switch (selectedPart) {
            case 'cake':
                return (
                    <div className="space-y-6">
                        {/* Size options from API */}
                        {partOptions.find(group => group.type === 'Size')?.items.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSizeSelect({
                                    id: option.id,
                                    name: getOptionName(option),
                                    size: getOptionName(option),
                                    price: getOptionPrice(option),
                                    priceChange: getOptionPrice(option) - config.price,
                                    feeds: '8-10'
                                })}
                                className={`flex flex-col items-center ${config.size === getOptionName(option) ? 'ring-2 ring-pink-500' : ''}`}
                            >
                                <div className={`w-20 h-20 rounded-full border-2 ${config.size === getOptionName(option) ? 'border-pink-500' : 'border-gray-200'} flex items-center justify-center text-lg font-bold`}>
                                    {getOptionName(option)}
                                </div>
                                <div className="mt-2 text-sm font-medium">{getOptionName(option)}</div>
                                <div className="text-sm text-gray-500">
                                    {getOptionPrice(option) > config.price ? '+' : ''}£{Math.abs(getOptionPrice(option) - config.price).toFixed(2)} VND
                                </div>
                            </button>
                        ))}

                        {/* Sponge options from API */}
                        {partOptions.find(group => group.type === 'Sponge')?.items.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSpongeSelect({
                                    id: option.id,
                                    name: getOptionName(option),
                                    color: getOptionColor(option),
                                    price: getOptionPrice(option)
                                })}
                                className="flex flex-col items-center"
                            >
                                <div className={`w-16 h-16 ${getOptionColor(option)} rounded border ${config.sponge === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'}`}>
                                    <div className="h-full flex flex-col">
                                        <div className="flex-1 border-b border-white/20"></div>
                                        <div className="flex-1 border-b border-white/20"></div>
                                        <div className="flex-1 border-b border-white/20"></div>
                                        <div className="flex-1"></div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs font-medium text-center">{getOptionName(option)}</div>
                                {getOptionPrice(option) > 0 && (
                                    <div className="text-xs text-gray-500">{getOptionPrice(option).toFixed(2)} VND</div>
                                )}
                            </button>
                        ))}

                        {/* Filling options from API */}
                        {partOptions.find(group => group.type === 'Filling')?.items.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleFillingSelect({
                                    id: option.id,
                                    name: getOptionName(option),
                                    color: getOptionColor(option),
                                    price: getOptionPrice(option),
                                    icon: '≡'
                                })}
                                className="flex flex-col items-center"
                            >
                                <div className={`w-20 h-20 relative ${getOptionColor(option)} ${config.filling === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'}`} />
                                <p className="text-[10px] font-medium mt-2 text-center max-w-[80px]">
                                    {getOptionName(option)}
                                </p>
                            </button>
                        ))}
                    </div>
                );

            case 'outer-icing':
                return (
                    <div>
                        <h3 className="font-bold mb-2">OUTER ICING</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {decorationOptions.map(group =>
                                group.items.map(option => (
                                    <div key={option.id} className="flex flex-col items-center">
                                        <button
                                            className={`w-12 h-12 ${getOptionColor(option)} ${config.outerIcing === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'} rounded`}
                                            onClick={() => handleOptionSelect('outerIcing', option.id)}
                                        />
                                        <p className="text-xs text-center mt-1">{getOptionName(option)}</p>
                                        {getOptionPrice(option) > 0 && (
                                            <p className="text-xs text-gray-500">{getOptionPrice(option).toFixed(2)} VND</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 'message':
                const plaqueColourGroup = messageOptions.find(group => group.type === 'PLAQUE_COLOUR');
                const pipingColourGroup = messageOptions.find(group => group.type === 'PIPING_COLOUR');
                const messageTypeOptions: MessageOption[] = [
                    { id: 'none', name: 'KHÔNG', price: 0, icon: '✖️' },
                    { id: 'piped', name: 'CHỮ VIẾT TAY', price: 7.00, icon: '✍️' },
                    { id: 'edible', name: 'HÌNH ẢNH ĂN ĐƯỢC', price: 8.00, icon: '🖼️' }
                ];

                return (
                    <div className="space-y-6">
                        <h3 className="font-bold mb-4">PRINTING & PIPING</h3>

                        {/* Message Type Selection */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {messageTypeOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => handleMessageTypeSelect(option)}
                                    className="flex flex-col items-center"
                                >
                                    <div className={`w-16 h-16 bg-white rounded-lg border-2 flex items-center justify-center
                                        ${config.messageType === option.id ? 'border-pink-500' : 'border-gray-200'}`}
                                    >
                                        <span className="text-2xl">{option.icon}</span>
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-center">{option.name}</div>
                                </button>
                            ))}
                        </div>

                        {/* Message Content */}
                        {config.messageType !== 'none' && (
                            <div className="space-y-4">
                                {config.messageType === 'edible' ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-center space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Upload Design Image
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
                                                className="cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 transition-colors"
                                            >
                                                {config.uploadedImage ? (
                                                    <div className="relative w-32 h-32">
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
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="mt-2 text-sm text-gray-600">Click to upload your design</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Message (max 30 characters)
                                            </label>
                                            <input
                                                type="text"
                                                value={config.message}
                                                onChange={handleMessageChange}
                                                maxLength={30}
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                placeholder="Enter your message..."
                                            />
                                        </div>

                                        {/* Plaque Color Selection */}
                                        {plaqueColourGroup?.items.map(option => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id={`plaque-${option.id}`}
                                                    name="plaque-color"
                                                    value={option.id}
                                                    checked={config.plaqueColor === option.id}
                                                    onChange={() => handlePlaqueColorChange(option.id)}
                                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                                                />
                                                <label htmlFor={`plaque-${option.id}`} className="text-sm text-gray-700">
                                                    {option.name}
                                                </label>
                                            </div>
                                        ))}

                                        {/* Piping Color Selection */}
                                        {pipingColourGroup?.items.map(option => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id={`piping-${option.id}`}
                                                    name="piping-color"
                                                    value={option.id}
                                                    checked={config.pipingColor === option.id}
                                                    onChange={() => setConfig(prev => ({ ...prev, pipingColor: option.id }))}
                                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                                                />
                                                <label htmlFor={`piping-${option.id}`} className="text-sm text-gray-700">
                                                    {option.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'extras':
                return (
                    <div>
                        <h3 className="font-bold mb-4">MAKE IT EXTRA</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {extraOptions.flatMap(group =>
                                group.items.map(option => (
                                    <motion.div
                                        key={option.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center"
                                    >
                                        <button
                                            onClick={() => handleExtraSelect({
                                                id: option.id,
                                                name: getOptionName(option),
                                                price: getOptionPrice(option),
                                                available: true,
                                                icon: '🍪',
                                                color: getOptionColor(option)
                                            })}
                                            disabled={!option.is_default}
                                            className={`relative w-full aspect-square rounded-lg transition-all 
                                                ${config.extras.includes(option.id)
                                                    ? 'ring-2 ring-pink-500'
                                                    : 'ring-1 ring-gray-200'
                                                } ${!option.is_default ? 'opacity-50' : 'hover:shadow-lg'}`}
                                        >
                                            {getOptionImage(option) && (
                                                <Image
                                                    src={getOptionImage(option)!}
                                                    alt={getOptionName(option)}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                            )}
                                        </button>
                                        <p className="text-xs font-medium mt-2 text-center">{getOptionName(option)}</p>
                                        <p className="text-xs text-gray-600">{getOptionPrice(option).toFixed(2)} VND</p>
                                    </motion.div>
                                ))
                            )}
                        </div>
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
                        <h3 className="font-bold mb-4">CAKE BOARD</h3>
                        <p className="text-sm text-gray-500 mb-4">Select your preferred board color (subject to availability)</p>
                        <div className="grid grid-cols-3 gap-4">
                            {boardOptions.map(option => (
                                <motion.div
                                    key={option.id}
                                    whileHover={{ scale: 1.05 }}
                                    className="flex flex-col items-center"
                                >
                                    <button
                                        onClick={() => handleOptionSelect('board', option.id)}
                                        className={`w-20 h-20 ${option.color} ${option.border || ''} 
                                            ${config.board === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'} 
                                            rounded-lg shadow-sm hover:shadow-md transition-all`}
                                    />
                                    <p className="text-sm font-medium text-center mt-2">{option.name}</p>
                                </motion.div>
                            ))}
                        </div>
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

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleOrderCake}
                    className="p-3 rounded-full bg-pink-500 text-white shadow-lg hover:bg-pink-600 transition-all"
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </motion.button>
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
                extras: config.extras,
                board: config.board,
                imageUrl: config.imageUrl || '',
                price: config.price,
                message: config.message,
                messageType: config.messageType,
                plaqueColor: config.plaqueColor,
                uploadedImage: config.uploadedImage,
                topping: config.topping,
                name: `Custom ${config.size} Cake`,
                description: `${config.sponge} sponge with ${config.filling} filling and ${config.outerIcing} icing`,
                type: 'custom'
            }
        };

        addToCart(customCake);
        router.push('/cart');
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
                                className="text-3xl font-bold text-pink-600 mt-2"
                            >
                                {config.price.toFixed(2)} VND
                            </motion.div>
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
                                                onClick={() => handlePartSelect('cake')}
                                                gradient="from-pink-500 to-rose-500"
                                            />
                                            <MenuItem
                                                icon="🧁"
                                                title="TRANG TRÍ"
                                                subtitle="KEM SÔ CÔ LA"
                                                onClick={() => handlePartSelect('outer-icing')}
                                                gradient="from-purple-500 to-indigo-500"
                                            />
                                            <MenuItem
                                                icon="✍️"
                                                title="CHỮ & HÌNH ẢNH"
                                                subtitle={config.message || "CHỮ VIẾT TAY + PLAQUE SÔ CÔ LA TRẮNG"}
                                                onClick={() => handlePartSelect('message')}
                                                gradient="from-blue-500 to-cyan-500"
                                            />
                                            <MenuItem
                                                icon="🕯️"
                                                title="TRANG TRÍ CUỐI"
                                                subtitle="6 NẾN HỒNG + PLAQUE SÔ CÔ LA TRẮNG"
                                                onClick={() => handlePartSelect('candles')}
                                                gradient="from-teal-500 to-emerald-500"
                                            />
                                            <MenuItem
                                                icon="📝"
                                                title="ĐẾ BÁNH"
                                                subtitle={`${boardOptions.find(b => b.id === config.board)?.name || 'Chọn màu đế bánh'}`}
                                                onClick={() => handlePartSelect('board')}
                                                gradient="from-green-500 to-teal-500"
                                            />
                                            <MenuItem
                                                icon="🍪"
                                                title="THÊM PHẦN"
                                                subtitle={config.extras.length > 0
                                                    ? `Đã thêm ${config.extras.length} phần phụ`
                                                    : "Thêm topping đặc biệt"}
                                                onClick={() => handlePartSelect('extras')}
                                                gradient="from-yellow-500 to-orange-500"
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
                                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 text-lg font-bold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
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

// Update MenuItem component with enhanced styling
const MenuItem = ({
    icon,
    title,
    subtitle,
    onClick,
    gradient
}: {
    icon: string;
    title: string;
    subtitle: string;
    onClick: () => void;
    gradient: string;
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgb(249, 250, 251)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-lg border border-pink-100`}
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
            <motion.svg
                whileHover={{ x: 5 }}
                className="w-6 h-6 text-pink-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M9 18l6-6-6-6" />
            </motion.svg>
        </motion.button>
    );
};

// Update global styles
const globalStyles = `
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(236, 72, 153, 0.3) transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(236, 72, 153, 0.3);
        border-radius: 3px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(236, 72, 153, 0.5);
    }

    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }

    .float-animation {
        animation: float 3s ease-in-out infinite;
    }
`;

export default CakeCustomizer;