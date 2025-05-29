"use client";

import { Button } from '@/components/ui/button';
import { useCart } from '@/app/store/useCart';
import { CakeConfig } from '@/types/cake';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Download, Sparkles, Heart, Star, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCakeConfigStore } from '@/components/shared/client/stores/cake-config';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import BakerySwitchModal from '@/components/shared/bakery-switch-modal';

// API response types
interface ApiError {
    code: string;
    message: string;
    details?: any;
}

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

interface ApiImage {
    file_name: string;
    file_url: string;
    id: string;
    created_at: string;
    created_by: string;
    updated_at: string | null;
    updated_by: string | null;
    is_deleted: boolean;
}

interface ApiItem {
    id: string;
    name: string;
    price: number;
    color: string;
    is_default: boolean;
    description: string;
    image_id: string | null;
    image: ApiImage | null;
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

// Define type for the selected part
type SelectedPart = 'cake' | 'decoration' | 'message' | 'extras' | null;

// Type for step status tracking
type StepStatus = {
    cake: boolean;
    decoration: boolean;
    message: boolean;
    extras: boolean;
};

// Type for board shape
type BoardShape = 'round' | 'square';

// Get initial cake configuration
const getInitialCakeConfig = (): CakeConfig => {
    if (typeof window === 'undefined') {
        // Return default config when running on server
        return {
            size: '',
            price: 0,
            sponge: '',
            outerIcing: [],
            filling: '',
            icing: '',
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
        outerIcing: [],
        filling: '',
        icing: '',
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

// Animation variants for selected items
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

// Enhanced animation variants
const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0,
            staggerChildren: 0,
            delayChildren: 0
        }
    }
};

const itemVariants = {
    hidden: { y: 0, opacity: 1 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0
        }
    }
};

const floatingVariants = {
    animate: {
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const pulseVariants = {
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// Enhanced color mapping with more realistic colors
const getRealisticColor = (colorName: string | null): string => {
    if (!colorName) return '#F8F9FA';

    const colorMap: Record<string, string> = {
        'white': '#FFFFFF',
        'cream': '#FFF8DC',
        'vanilla': '#F3E5AB',
        'chocolate': '#8B4513',
        'strawberry': '#FFB6C1',
        'pink': '#FFC0CB',
        'green': '#90EE90',
        'blue': '#87CEEB',
        'yellow': '#FFFF99',
        'orange': '#FFB347',
        'red': '#FF6B6B',
        'purple': '#DDA0DD',
        'brown': '#A0522D',
        'caramel': '#D2691E',
        'mint': '#98FB98',
        'lemon': '#FFFACD'
    };

    const normalizedColor = colorName.toLowerCase().trim();
    return colorMap[normalizedColor] || '#F8F9FA';
};

const CakeCustomizer = ({ storeId }: { storeId: string }) => {
    const { addToCart, items, bakerySwitchModal } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');
    const { config, setConfig } = useCakeConfigStore();
    const cakePreviewRef = useRef<HTMLDivElement>(null);

    // Add state for pending cart item
    const [pendingCartItem, setPendingCartItem] = useState<any>(null);

    // UI state
    const [selectedPart, setSelectedPart] = useState<SelectedPart>(null);
    const [showJson, setShowJson] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    // Preview state for decorations
    const [previewDecoration, setPreviewDecoration] = useState<string | null>(null);

    // API data state
    const [decorationOptions, setDecorationOptions] = useState<ApiOptionGroup[]>([]);
    const [partOptions, setPartOptions] = useState<ApiOptionGroup[]>([]);
    const [messageOptions, setMessageOptions] = useState<ApiOptionGroup[]>([]);
    const [extraOptions, setExtraOptions] = useState<ApiOptionGroup[]>([]);

    // Status and error handling
    const [error, setError] = useState<ApiError | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Tracking completion status of steps
    const [completedSteps, setCompletedSteps] = useState<StepStatus>({
        cake: false,
        decoration: false,
        message: false,
        extras: false
    });

    // Current active step
    const [currentStep, setCurrentStep] = useState<'cake' | 'decoration' | 'message' | 'extras'>('cake');

    // Load data when the component mounts
    useEffect(() => {
        Promise.all([
            fetchDecorationOptions(),
            fetchPartOptions(),
            fetchMessageOptions(),
            fetchExtraOptions()
        ]).catch(error => {
            console.error('Error initializing cake customizer:', error);
            toast.error('Failed to load cake options. Please try again.');
        });
    }, [storeId]);

    // Update the initial state to load existing item if editing
    useEffect(() => {
        if (editId) {
            const itemToEdit = items.find(item => item.id === editId);
            if (itemToEdit) {
                setConfig(itemToEdit.config);
            }
        }
    }, [editId, items, setConfig]);

    // Reset the cake configuration to defaults
    const handleResetConfig = () => {
        const defaultConfig: CakeConfig = {
            size: '',
            price: 0,
            sponge: '',
            outerIcing: [],
            filling: '',
            icing: '',
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
        setConfig(defaultConfig);
        setCompletedSteps({
            cake: false,
            decoration: false,
            message: false,
            extras: false
        });
        setCurrentStep('cake');
        setSelectedPart(null);
    };

    // API fetch functions
    const fetchDecorationOptions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/decoration_options?bakeryId=${storeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            setDecorationOptions(data.payload);
            return data.payload;
        } catch (error) {
            console.error('Error fetching decoration options:', error);
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch decoration options'
            });
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [storeId]);

    const fetchPartOptions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/part_options?bakeryId=${storeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            setPartOptions(data.payload);

            // Set default size if not already set
            if (!config.size && data.payload.length > 0) {
                const sizeGroup = data.payload.find(group => group.type === 'Size');
                if (sizeGroup && sizeGroup.items.length > 0) {
                    const defaultSize = sizeGroup.items[0];
                    setConfig(prev => ({
                        ...prev,
                        size: defaultSize.name,
                        price: defaultSize.price
                    }));
                }
            }
            return data.payload;
        } catch (error) {
            console.error('Error fetching part options:', error);
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch part options'
            });
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [storeId, config.size]);

    const fetchMessageOptions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/message_options?bakeryId=${storeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            setMessageOptions(data.payload);
            return data.payload;
        } catch (error) {
            console.error('Error fetching message options:', error);
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch message options'
            });
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [storeId]);

    const fetchExtraOptions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/extra_options?bakeryId=${storeId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json();
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message);
            }
            setExtraOptions(data.payload);
            return data.payload;
        } catch (error) {
            console.error('Error fetching extra options:', error);
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch extra options'
            });
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Handle part selection
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
            if (partOptions.length === 0) {
                fetchPartOptions();
            }
        } else if (part === 'decoration' && canSelectDecoration) {
            setSelectedPart(part);
            if (decorationOptions.length === 0) {
                fetchDecorationOptions();
            }
        } else if (part === 'message' && canSelectMessage) {
            setSelectedPart(part);
            if (messageOptions.length === 0) {
                fetchMessageOptions();
            }
        } else if (part === 'extras' && canSelectExtras) {
            setSelectedPart(part);
            if (extraOptions.length === 0) {
                fetchExtraOptions();
            }
        } else if (part !== null) {
            // Show error message if trying to select a locked step
            toast.error('Please complete the previous steps first');
        }

        // Update current step based on selection
        if (part === 'cake' && !completedSteps.cake) {
            setCurrentStep('cake');
        } else if (part === 'decoration' && !completedSteps.decoration) {
            setCurrentStep('decoration');
        } else if (part === 'message' && !completedSteps.message) {
            setCurrentStep('message');
        } else if (part === 'extras' && !completedSteps.extras) {
            setCurrentStep('extras');
        }
    };

    // Handle option selection for size
    const handleSizeSelect = (option: ApiItem) => {
        // Find current size option to calculate price difference
        const currentSizeId = config.size;
        const currentSize = partOptions.find(group => group.type === 'Size')?.items
            .find(item => item.name === currentSizeId);

        // Calculate price difference and update config
        const currentPrice = currentSize?.price || 0;
        const priceDifference = option.price - currentPrice;

        setConfig(prev => ({
            ...prev,
            size: option.name,
            price: prev.price + priceDifference
        }));
    };

    // Handle option selection for sponge
    const handleSpongeSelect = (option: ApiItem) => {
        // Find current sponge to calculate price difference
        const currentSpongeId = config.sponge;
        const currentSponge = partOptions.find(group => group.type === 'Sponge')?.items
            .find(item => item.id === currentSpongeId);

        // Calculate price difference
        const currentPrice = currentSponge?.price || 0;
        const priceDifference = option.price - currentPrice;

        setConfig(prev => ({
            ...prev,
            sponge: option.id,
            price: prev.price + priceDifference
        }));
    };

    // Handle option selection for filling
    const handleFillingSelect = (option: ApiItem) => {
        // Find current filling to calculate price difference
        const currentFillingId = config.filling;
        const currentFilling = partOptions.find(group => group.type === 'Filling')?.items
            .find(item => item.id === currentFillingId);

        // Calculate price difference
        const currentPrice = currentFilling?.price || 0;
        const priceDifference = option.price - currentPrice;

        setConfig(prev => ({
            ...prev,
            filling: option.id,
            price: prev.price + priceDifference
        }));
    };

    // Handle option selection for icing
    const handleIcingSelect = (option: ApiItem) => {
        // Find current icing to calculate price difference
        const currentIcingId = config.icing;
        const currentIcing = partOptions.find(group => group.type === 'Icing')?.items
            .find(item => item.id === currentIcingId);

        // Calculate price difference
        const currentPrice = currentIcing?.price || 0;
        const priceDifference = option.price - currentPrice;

        setConfig(prev => ({
            ...prev,
            icing: option.id,
            price: prev.price + priceDifference
        }));
    };

    // Handle option selection for outer icing (decoration)
    const handleDecorationSelect = (option: ApiItem) => {
        // Check if the decoration is already selected
        const isAlreadySelected = config.outerIcing.includes(option.id);

        if (isAlreadySelected) {
            // Remove the decoration if it's already selected
            setConfig(prev => ({
                ...prev,
                outerIcing: prev.outerIcing.filter(id => id !== option.id),
                price: prev.price - option.price
            }));
        } else {
            // Check if there's an existing decoration of the same type
            const existingDecorationOfSameType = config.outerIcing.find(id => {
                const existingDecoration = decorationOptions.flatMap(group => group.items)
                    .find(item => item.id === id);
                // Find the group that contains this decoration to get its type
                const decorationGroup = decorationOptions.find(group =>
                    group.items.some(item => item.id === id)
                );
                // Compare the group types instead of item types
                return decorationGroup?.type === option.type;
            });

            // Calculate price difference
            let priceDifference = option.price;
            if (existingDecorationOfSameType) {
                const existingDecoration = decorationOptions.flatMap(group => group.items)
                    .find(item => item.id === existingDecorationOfSameType);
                priceDifference = option.price - (existingDecoration?.price || 0);
            }

            // Update config
            setConfig(prev => ({
                ...prev,
                outerIcing: existingDecorationOfSameType
                    ? prev.outerIcing.map(id => id === existingDecorationOfSameType ? option.id : id)
                    : [...prev.outerIcing, option.id],
                price: prev.price + priceDifference
            }));
        }

        // Clear preview when selecting
        setPreviewDecoration(null);
    };

    // Handle decoration preview on hover/click
    const handleDecorationPreview = (optionId: string) => {
        setPreviewDecoration(optionId);
    };

    // Clear decoration preview
    const clearDecorationPreview = () => {
        setPreviewDecoration(null);
    };

    // Handle option selection for goo
    const handleGooSelect = (option: ApiItem) => {
        // Find current goo to calculate price difference
        const currentGooId = config.goo;
        const currentGoo = partOptions.find(group => group.type === 'Goo')?.items
            .find(item => item.id === currentGooId);

        // Calculate price difference
        const currentPrice = currentGoo?.price || 0;
        const priceDifference = option.price - currentPrice;

        setConfig(prev => ({
            ...prev,
            goo: option.id,
            price: prev.price + priceDifference
        }));
    };

    // Handle option selection for message type
    const handleMessageTypeSelect = (messageType: 'none' | 'piped' | 'edible') => {
        // Find current message type to calculate price difference
        const currentMessageType = config.messageType;
        const currentMessageOption = messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item =>
            (currentMessageType === 'none' && item.name === 'NONE') ||
            (currentMessageType === 'piped' && item.name === 'PIPED MESSAGE') ||
            (currentMessageType === 'edible' && item.name === 'EDIBLE IMAGE')
        );

        // Find new message type to calculate price
        const newMessageOption = messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item =>
            (messageType === 'none' && item.name === 'NONE') ||
            (messageType === 'piped' && item.name === 'PIPED MESSAGE') ||
            (messageType === 'edible' && item.name === 'EDIBLE IMAGE')
        );

        // Calculate price difference
        const currentPrice = currentMessageOption?.price || 0;
        const newPrice = newMessageOption?.price || 0;
        const priceDifference = newPrice - currentPrice;

        setConfig(prev => ({
            ...prev,
            messageType,
            // Reset related fields when changing message type
            message: messageType === 'none' ? '' : prev.message,
            uploadedImage: messageType === 'edible' ? prev.uploadedImage : null,
            price: prev.price + priceDifference
        }));
    };

    // Handle message text change
    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({
            ...prev,
            message: e.target.value.slice(0, 30)
        }));
    };

    // Handle plaque color selection for piped message
    const handlePlaqueColorSelect = (option: ApiItem) => {
        setConfig(prev => ({
            ...prev,
            plaqueColor: option.id
        }));
    };

    // Handle piping color selection for piped message
    const handlePipingColorSelect = (option: ApiItem) => {
        setConfig(prev => ({
            ...prev,
            pipingColor: option.id
        }));
    };

    // Handle image upload for edible image
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setConfig(prev => ({
                    ...prev,
                    uploadedImage: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle removing uploaded image
    const handleImageRemove = () => {
        setConfig(prev => ({
            ...prev,
            uploadedImage: null
        }));
    };

    // Handle selecting extras (candles, board, etc.)
    const handleExtraSelect = (option: ApiItem) => {
        const extras = Array.isArray(config.extras) ? [...config.extras] : [];
        const isAlreadySelected = extras.includes(option.id);

        // Check if there's an existing option of same type to replace
        const existingOptionOfSameType = extras.find(id => {
            const existingOption = extraOptions.flatMap(group => group.items)
                .find(item => item.id === id);
            return existingOption?.type === option.type && id !== option.id;
        });

        let priceDifference = 0;

        if (isAlreadySelected) {
            // Remove if already selected
            const newExtras = extras.filter(id => id !== option.id);
            priceDifference = -option.price;

            setConfig(prev => ({
                ...prev,
                extras: newExtras,
                price: prev.price + priceDifference,
                // If removing a board or candles, update those fields too
                ...(option.type === 'CakeBoard' ? { board: '' } : {}),
                ...(option.type === 'Candles' ? { candles: null } : {})
            }));
        } else {
            // If replacing an existing option of same type
            let newExtras = [...extras];

            if (existingOptionOfSameType) {
                const existingOption = extraOptions.flatMap(group => group.items)
                    .find(item => item.id === existingOptionOfSameType);

                // Remove existing and its price
                newExtras = newExtras.filter(id => id !== existingOptionOfSameType);
                priceDifference = option.price - (existingOption?.price || 0);
            } else {
                // Just add the new option's price
                priceDifference = option.price;
            }

            // Add the new option
            newExtras.push(option.id);

            setConfig(prev => ({
                ...prev,
                extras: newExtras,
                price: prev.price + priceDifference,
                // Update board or candles field if applicable
                ...(option.type === 'CakeBoard' ? { board: option.id } : {}),
                ...(option.type === 'Candles' ? { candles: option.id } : {})
            }));
        }
    };

    // Complete the current step and move to the next
    const handleStepComplete = () => {
        // Validation checks for each step
        if (currentStep === 'cake') {
            if (!config.size || !config.sponge || !config.filling || !config.icing) {
                toast.error('Please select size, sponge, filling, and icing options');
                return;
            }
            setCompletedSteps(prev => ({ ...prev, cake: true }));
            setCurrentStep('decoration');
            setSelectedPart('decoration');
        }
        else if (currentStep === 'decoration') {
            if (!config.outerIcing) {
                toast.error('Please select a decoration option');
                return;
            }
            setCompletedSteps(prev => ({ ...prev, decoration: true }));
            setCurrentStep('message');
            setSelectedPart('message');
        }
        else if (currentStep === 'message') {
            // Message step is optional, always allow completion
            setCompletedSteps(prev => ({ ...prev, message: true }));
            setCurrentStep('extras');
            setSelectedPart('extras');
        }
        else if (currentStep === 'extras') {
            // Extras are optional, always allow completion
            setCompletedSteps(prev => ({ ...prev, extras: true }));
            setSelectedPart(null);
            toast.success('Cake customization complete! You can now add it to cart.');
        }
    };

    // Save the current design to localStorage
    const handleSaveDesign = () => {
        try {
            localStorage.setItem('cakeConfig', JSON.stringify(config));
            toast.success('Design saved successfully!');
        } catch (error) {
            console.error('Error saving design:', error);
            toast.error('Failed to save design');
        }
    };

    // Add the customized cake to cart
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

            // Check if we already have items from a different bakery
            const cartState = useCart.getState();
            const { openBakerySwitchModal, currentBakeryId, items } = cartState;

            console.log('Current cart state:', { items: items.length, currentBakeryId, storeId });

            // Check if cart is truly empty
            const isCartEmpty = items.length === 0;

            // Check if this is a different bakery than what's already in cart
            if (!isCartEmpty && currentBakeryId && currentBakeryId !== storeId) {
                // Get bakery names for the modal
                const currentBakeryName = items[0]?.config?.name?.split(' ')?.[0] || "hiện tại";
                const newBakeryName = "mới";

                // Open the bakery switch modal
                openBakerySwitchModal(
                    currentBakeryName,
                    newBakeryName,
                    // This function runs when user confirms to switch bakeries
                    async () => {
                        // Proceed with creating the cake after confirmation
                        await createCustomCakeAndAddToCart();
                    }
                );

                return;
            }

            // If no bakery conflict, proceed with creating the cake
            await createCustomCakeAndAddToCart();

        } catch (error) {
            console.error('Error in handleOrderCake:', error);
            toast.error('Failed to order cake. Please try again.');
        }
    };

    // Function to create custom cake and add to cart
    const createCustomCakeAndAddToCart = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return;

            // First, clear cart if needed - get currentBakeryId from the store
            const { changeBakery, currentBakeryId, closeBakerySwitchModal } = useCart.getState();

            console.log('Creating custom cake, current bakeryId:', currentBakeryId, 'storeId:', storeId);

            // If bakery ID is different, we need to clear the cart first
            if (currentBakeryId && currentBakeryId !== storeId) {
                console.log('Different bakery detected, clearing cart first');

                try {
                    // Use the async changeBakery function to clear cart and set new bakeryId
                    // This will also delete the API cart
                    const changeBakeryResult = await changeBakery(storeId, true);

                    if (!changeBakeryResult) {
                        toast.error('Failed to change bakery. Please try again.');
                        closeBakerySwitchModal();
                        return;
                    }

                    console.log('Successfully changed bakery to:', storeId);

                } catch (error) {
                    console.error('Error changing bakery:', error);
                    toast.error('Failed to clear existing cart items');
                    closeBakerySwitchModal();
                    return;
                }
            }

            // Make sure to close the modal regardless of what happens next
            closeBakerySwitchModal();

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
                item.id === config.plaqueColor
            );

            // Get the selected piping color option
            const selectedPipingColor = pipingColorGroup?.items.find(item =>
                item.id === config.pipingColor
            );

            // Collect all selected message option IDs
            const messageOptionIds = [
                selectedMessageType?.id,
                config.messageType === 'piped' ? selectedPlaqueColor?.id : null,
                config.messageType === 'piped' ? selectedPipingColor?.id : null
            ].filter(Boolean) as string[];

            console.log('Message Type Config:', config.messageType);
            console.log('Selected Message Type:', selectedMessageType);
            console.log('Selected Plaque Color:', selectedPlaqueColor);
            console.log('Selected Piping Color:', selectedPipingColor);
            console.log('Config Plaque Color ID:', config.plaqueColor);
            console.log('Config Piping Color ID:', config.pipingColor);
            console.log('Final Message Option IDs:', messageOptionIds);

            // Ensure we have valid GUID IDs for all selections
            const defaultGuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

            // Helper to ensure we have valid GUIDs
            const getValidGuid = (id: string | undefined): string => {
                if (!id) return defaultGuid;
                // Simple validation - GUIDs should be in format like '00000000-0000-0000-0000-000000000000'
                const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return guidPattern.test(id) ? id : defaultGuid;
            };

            // Get selected options for description
            const selectedSize = config.size;
            const selectedSponge = getSelectedOption('Sponge', config.sponge);
            const selectedFilling = getSelectedOption('Filling', config.filling);
            const selectedIcing = getSelectedOption('Icing', config.icing);
            const selectedOuterIcing = getSelectedOption('OuterIcing', config.outerIcing);
            const selectedGoo = getSelectedOption('Goo', config.goo);

            // Prepare the API request body
            const requestBody = {
                cake_name: `Custom ${selectedSize} Cake`,
                cake_description: `Delicious ${selectedSize} cake with ${selectedSponge?.name || 'Unknown'} sponge, filled with ${selectedFilling?.name || 'Unknown'}, iced with ${selectedIcing?.name || 'Unknown'}, and covered in ${selectedOuterIcing?.name || 'Unknown'} icing${config.goo ? `, topped with ${selectedGoo?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
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
                    },
                    {
                        part_type: "ICING",
                        part_option_id: getValidGuid(partOptions.find(group => group.type === 'Icing')?.items.find(item => item.id === config.icing)?.id)
                    },
                    // Add GOO part type if selected
                    ...(config.goo ? [{
                        part_type: "GOO",
                        part_option_id: getValidGuid(partOptions.find(group => group.type === 'Goo')?.items.find(item => item.id === config.goo)?.id)
                    }] : [])
                ],
                decoration_selections: Array.isArray(config.outerIcing) ? config.outerIcing.map(id => {
                    const decoration = decorationOptions.flatMap(group => group.items).find(item => item.id === id);
                    const decorationGroup = decorationOptions.find(group =>
                        group.items.some(item => item.id === id)
                    );
                    return {
                        decoration_type: decorationGroup?.type.toUpperCase() || "OUTER_ICING",
                        decoration_option_id: getValidGuid(decoration?.id)
                    };
                }) : [],
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
            const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/custom_cakes', {
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

            // Get current cart from API first to preserve existing items
            console.log('Fetching current cart to preserve existing items...');
            const updatedCartResponse = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accept': '*/*'
                }
            });

            if (!updatedCartResponse.ok) {
                console.error('Error fetching current cart:', updatedCartResponse.status, updatedCartResponse.statusText);
                toast.error('Failed to fetch current cart');
                return;
            }

            const updatedCartData = await updatedCartResponse.json();
            let currentCartItems = [];

            if (updatedCartData.status_code === 200 && updatedCartData.payload && updatedCartData.payload.cartItems) {
                currentCartItems = updatedCartData.payload.cartItems;
                console.log('Found existing cart items:', currentCartItems.length);
            }

            // New custom cake item to add
            const newCartItem = {
                cake_name: `Custom ${selectedSize} Cake`,
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
                cake_note: `Delicious ${selectedSize} cake with ${selectedSponge?.name || 'Unknown'} sponge, filled with ${selectedFilling?.name || 'Unknown'}, iced with ${selectedIcing?.name || 'Unknown'}, and decorated with ${Array.isArray(config.outerIcing) ? getAllSelectedDecorations(config.outerIcing).map(d => d.name).join(', ') : 'no decorations'}${config.goo ? `, topped with ${selectedGoo?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
                sub_total_price: config.price,
                total_price: config.price,
                available_cake_id: null,
                custom_cake_id: data.payload.id,
                bakery_id: storeId
            };

            // Prepare the cart data with both existing items and the new item
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
                cartItems: [...currentCartItems, newCartItem]
            };

            console.log('Adding to cart with data:', cartData);

            // Make the API call to add to cart
            const cartResponse = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/carts', {
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
            const { addToCart } = useCart.getState();
            const cartItem = {
                id: data.payload.id,
                quantity: 1,
                price: config.price,
                bakeryId: storeId,
                config: {
                    ...config,
                    name: `Custom ${selectedSize} Cake`,
                    description: `Delicious ${selectedSize} cake with ${selectedSponge?.name || 'Unknown'} sponge, filled with ${selectedFilling?.name || 'Unknown'}, iced with ${selectedIcing?.name || 'Unknown'}, and decorated with ${Array.isArray(config.outerIcing) ? getAllSelectedDecorations(config.outerIcing).map(d => d.name).join(', ') : 'no decorations'}${config.goo ? `, topped with ${selectedGoo?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
                    type: 'custom',
                    extras: Array.isArray(config.extras) ? config.extras : [],
                    imageUrl: cakeImageUrl // Add the captured image URL
                }
            };

            // Add the item to the cart state
            addToCart(cartItem);

            toast.success('Thêm vào giỏ hàng thành công!');
            console.log('Order process completed successfully');
            router.push('/cart');
        } catch (error) {
            console.error('Error creating custom cake:', error);
            toast.error('Failed to create custom cake');

            // Make sure modal is closed even on error
            const { closeBakerySwitchModal } = useCart.getState();
            closeBakerySwitchModal();
        }
    };

    // Helper function to get a selected option
    const getSelectedOption = (type: string, id: string | string[] | null): ApiItem | undefined => {
        if (!id) return undefined;

        if (type === 'Sponge' || type === 'Filling' || type === 'Size' || type === 'Goo' || type === 'Icing') {
            return partOptions.find(group => group.type === type)?.items
                .find(item => typeof id === 'string' && item.id === id);
        }

        if (type === 'OuterIcing') {
            const allDecorations = decorationOptions.flatMap(group => group.items);
            // For outer icing, always return the first selected decoration for compatibility
            if (Array.isArray(id)) {
                return allDecorations.find(item => item.id === id[0]);
            }
            return allDecorations.find(item => item.id === id);
        }

        if (type === 'Candles' || type === 'CakeBoard') {
            return extraOptions.find(group => group.type === type)?.items
                .find(item => typeof id === 'string' && item.id === id);
        }

        return undefined;
    };

    // Helper function to get all selected decorations
    const getAllSelectedDecorations = (ids: string[]): ApiItem[] => {
        const allDecorations = decorationOptions.flatMap(group => group.items);
        return ids.map(id => allDecorations.find(item => item.id === id)).filter(Boolean) as ApiItem[];
    };

    // Format color from API to Tailwind class
    const convertColorToTailwind = (color: string): string => {
        if (!color) return 'bg-gray-200';

        // Remove any 'bg-' prefix if exists
        const normalizedColor = color.toLowerCase().trim().replace('bg-', '');

        // Map API color names to Tailwind classes
        const colorMap: Record<string, string> = {
            'white': 'bg-white',
            'black': 'bg-black',
            'gray': 'bg-gray-500',
            'red': 'bg-red-500',
            'orange': 'bg-orange-500',
            'yellow': 'bg-yellow-500',
            'green': 'bg-green-500',
            'blue': 'bg-blue-500',
            'indigo': 'bg-indigo-500',
            'purple': 'bg-purple-500',
            'pink': 'bg-pink-500',
            'brown': 'bg-amber-800'
        };

        return colorMap[normalizedColor] || `bg-${normalizedColor}-500`;
    };

    // Enhanced realistic 3D cake rendering with improved visual effects
    const renderRealistic3DCake = (config: CakeConfig, selectedOptions: any) => {
        const { selectedSponge, selectedFilling, selectedIcing, selectedGoo, selectedCandles, selectedBoard } = selectedOptions;

        // Use preview decoration if available, otherwise use selected decoration
        const outerIcingId = previewDecoration || config.outerIcing;
        const selectedOuterIcing = getSelectedOption('OuterIcing', outerIcingId || null);

        // Get realistic colors with enhanced vibrancy
        const spongeColor = getRealisticColor(selectedSponge?.color);
        const fillingColor = getRealisticColor(selectedFilling?.color);
        const icingColor = getRealisticColor(selectedIcing?.color);
        const outerIcingColor = getRealisticColor(selectedOuterIcing?.color || null);
        const gooColor = selectedGoo ? getRealisticColor(selectedGoo.color) : null;

        return (
            <motion.div
                className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-blue-50/50 rounded-3xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Enhanced magical background effects */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    {/* Floating sparkles with improved animation */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: `${Math.random() * 8 + 4}px`,
                                height: `${Math.random() * 8 + 4}px`,
                                background: i % 3 === 0
                                    ? `linear-gradient(45deg, #fbbf24, #f59e0b)`
                                    : i % 3 === 1
                                        ? `linear-gradient(45deg, #ec4899, #be185d)`
                                        : `linear-gradient(45deg, #8b5cf6, #7c3aed)`,
                                filter: `drop-shadow(0 0 ${Math.random() * 10 + 5}px rgba(236, 72, 153, 0.3))`
                            }}
                            animate={{
                                scale: [0, 1.5, 0],
                                rotate: [0, 180, 360],
                                opacity: [0, 0.8, 0],
                                y: [0, -20, 0],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}

                    {/* Enhanced floating geometric shapes */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                            key={`shape-${i}`}
                            className="absolute"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: `${Math.random() * 12 + 8}px`,
                                height: `${Math.random() * 12 + 8}px`,
                                background: i % 4 === 0
                                    ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(219, 39, 119, 0.6))'
                                    : i % 4 === 1
                                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(124, 58, 237, 0.6))'
                                        : i % 4 === 2
                                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.6))'
                                            : 'linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.6))',
                                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '25%' : '0%',
                                transform: `rotate(${Math.random() * 360}deg)`,
                                filter: `blur(${Math.random() * 2}px) drop-shadow(0 0 8px rgba(236, 72, 153, 0.2))`
                            }}
                            animate={{
                                y: [0, -30, 0],
                                x: [0, 15, 0],
                                rotate: [0, 360, 720],
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{
                                duration: 8 + Math.random() * 4,
                                repeat: Infinity,
                                delay: i * 0.6,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                {/* Enhanced cake board with 3D effect */}
                {selectedBoard && (
                    <motion.div
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[120%]"
                        variants={itemVariants}
                    >
                        <div className="relative">
                            <div
                                className={`h-8 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-2xl' : 'rounded-full'} 
                                    transition-all duration-500 shadow-2xl`}
                                style={{
                                    background: `linear-gradient(135deg, ${getRealisticColor(selectedBoard.color)}, ${getRealisticColor(selectedBoard.color)}cc, ${getRealisticColor(selectedBoard.color)}dd)`,
                                    boxShadow: `0 12px 32px rgba(0, 0, 0, 0.2), 
                                               inset 0 2px 0 rgba(255, 255, 255, 0.9),
                                               inset 0 -2px 0 rgba(0, 0, 0, 0.1),
                                               0 0 20px rgba(236, 72, 153, 0.1)`
                                }}
                            >
                                <div className={`absolute inset-0 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-2xl' : 'rounded-full'}
                                    bg-gradient-to-r from-white/70 via-transparent to-white/70 opacity-60`} />
                                <div className={`absolute inset-x-0 top-0 h-3 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-t-2xl' : 'rounded-full'}
                                    bg-gradient-to-b from-white/40 to-transparent`} />
                                <div className={`absolute inset-0 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-2xl' : 'rounded-full'}
                                    bg-gradient-to-b from-transparent via-transparent to-black/5`} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Enhanced 3-tier realistic cake structure */}
                <motion.div
                    className="relative w-80 h-80"
                    variants={floatingVariants}
                    animate="animate"
                >
                    {/* Bottom tier (largest) */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32"
                        variants={itemVariants}
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="relative w-full h-full">
                            {/* Sponge layers visible on the side */}
                            <div className="absolute left-0 w-8 h-full flex flex-col">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div
                                            className="flex-1 border-b border-amber-200"
                                            style={{ backgroundColor: spongeColor }}
                                        />
                                        {gooColor && i < 5 && (
                                            <div
                                                className="h-1"
                                                style={{ backgroundColor: gooColor }}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Main cake body with icing */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    backgroundColor: outerIcingColor,
                                    boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1), 0 4px 15px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-black/10" />
                            </div>

                            {/* Filling preview */}
                            <div
                                className="absolute left-1/2 transform -translate-x-1/2 top-2 bottom-2 w-3 rounded-full"
                                style={{ backgroundColor: fillingColor }}
                            />
                        </div>
                    </motion.div>

                    {/* Middle tier */}
                    <motion.div
                        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-[85%] h-28"
                        variants={itemVariants}
                        style={{ animationDelay: '0.2s' }}
                    >
                        <div className="relative w-full h-full">
                            <div className="absolute left-0 w-6 h-full flex flex-col">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div
                                            className="flex-1 border-b border-amber-200"
                                            style={{ backgroundColor: spongeColor }}
                                        />
                                        {gooColor && i < 4 && (
                                            <div
                                                className="h-1"
                                                style={{ backgroundColor: gooColor }}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    backgroundColor: outerIcingColor,
                                    boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.1), 0 3px 12px rgba(0, 0, 0, 0.15)'
                                }}
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-black/10" />
                            </div>

                            <div
                                className="absolute left-1/2 transform -translate-x-1/2 top-2 bottom-2 w-2 rounded-full"
                                style={{ backgroundColor: fillingColor }}
                            />
                        </div>
                    </motion.div>

                    {/* Top tier (smallest) */}
                    <motion.div
                        className="absolute bottom-44 left-1/2 transform -translate-x-1/2 w-[70%] h-24"
                        variants={itemVariants}
                        style={{ animationDelay: '0.3s' }}
                    >
                        <div className="relative w-full h-full">
                            <div className="absolute left-0 w-5 h-full flex flex-col">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div
                                            className="flex-1 border-b border-amber-200"
                                            style={{ backgroundColor: spongeColor }}
                                        />
                                        {gooColor && i < 3 && (
                                            <div
                                                className="h-1"
                                                style={{ backgroundColor: gooColor }}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    backgroundColor: outerIcingColor,
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-black/10" />
                            </div>

                            <div
                                className="absolute left-1/2 transform -translate-x-1/2 top-1 bottom-1 w-1 rounded-full"
                                style={{ backgroundColor: fillingColor }}
                            />
                        </div>
                    </motion.div>

                    {/* Enhanced realistic drip effects */}
                    {gooColor && (
                        <motion.div
                            className="absolute inset-0"
                            variants={itemVariants}
                            style={{ animationDelay: '0.4s' }}
                        >
                            {/* Drips on bottom tier */}
                            {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div
                                    key={`drip-bottom-${i}`}
                                    className="absolute w-3 h-8 rounded-b-full"
                                    style={{
                                        backgroundColor: gooColor,
                                        left: `${15 + i * 10}%`,
                                        top: '60%',
                                        clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)'
                                    }}
                                    initial={{ scaleY: 0, opacity: 0 }}
                                    animate={{ scaleY: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                />
                            ))}

                            {/* Drips on middle tier */}
                            {Array.from({ length: 6 }).map((_, i) => (
                                <motion.div
                                    key={`drip-middle-${i}`}
                                    className="absolute w-2 h-6 rounded-b-full"
                                    style={{
                                        backgroundColor: gooColor,
                                        left: `${20 + i * 12}%`,
                                        top: '35%',
                                        clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)'
                                    }}
                                    initial={{ scaleY: 0, opacity: 0 }}
                                    animate={{ scaleY: 1, opacity: 1 }}
                                    transition={{ delay: 0.7 + i * 0.1, duration: 0.6 }}
                                />
                            ))}
                        </motion.div>
                    )}

                    {/* Decoration Effects Based on Type */}
                    {selectedOuterIcing && (
                        <motion.div
                            className="absolute inset-0"
                            variants={itemVariants}
                            style={{ animationDelay: '0.5s' }}
                        >
                            {/* Sprinkles - HẠT RẮC */}
                            {selectedOuterIcing.type === 'Sprinkles' && (
                                <div className="absolute inset-0">
                                    {Array.from({ length: 25 }).map((_, i) => (
                                        <motion.div
                                            key={`sprinkle-${i}`}
                                            className="absolute w-1.5 h-4 rounded-full shadow-sm"
                                            style={{
                                                backgroundColor: getRealisticColor(selectedOuterIcing.color),
                                                left: `${Math.random() * 75 + 12.5}%`,
                                                top: `${Math.random() * 55 + 22.5}%`,
                                                transform: `rotate(${Math.random() * 360}deg)`,
                                                boxShadow: `0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)`
                                            }}
                                            initial={{ scale: 0, opacity: 0, rotate: 0 }}
                                            animate={{
                                                scale: [0, 1.2, 1],
                                                opacity: [0, 1, 0.9],
                                                rotate: Math.random() * 360
                                            }}
                                            transition={{ delay: 0.8 + i * 0.04, duration: 0.4 }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Drip Effect - SỐT CHẢY TRÀN */}
                            {selectedOuterIcing.type === 'Drip' && (
                                <div className="absolute inset-0">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <motion.div
                                            key={`decoration-drip-${i}`}
                                            className="absolute rounded-b-full shadow-md"
                                            style={{
                                                background: `linear-gradient(to bottom, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}dd)`,
                                                width: `${Math.random() * 6 + 3}px`,
                                                height: `${Math.random() * 20 + 15}px`,
                                                left: `${8 + i * 5.5}%`,
                                                top: `${35 + Math.random() * 25}%`,
                                                clipPath: 'polygon(25% 0%, 75% 0%, 90% 100%, 10% 100%)',
                                                boxShadow: `2px 2px 6px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.2)`
                                            }}
                                            initial={{ scaleY: 0, opacity: 0, y: -10 }}
                                            animate={{ scaleY: 1, opacity: 0.9, y: 0 }}
                                            transition={{ delay: 0.6 + i * 0.08, duration: 1, ease: "easeOut" }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Short Skirt - VÁY BÁNH THẤP */}
                            {selectedOuterIcing.type === 'ShortSkirt' && (
                                <motion.div
                                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[110%] h-12"
                                    style={{
                                        background: `linear-gradient(to bottom, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}dd, ${getRealisticColor(selectedOuterIcing.color)}bb)`,
                                        borderRadius: '0 0 50% 50%',
                                        boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)'
                                    }}
                                    initial={{ scaleY: 0, opacity: 0 }}
                                    animate={{ scaleY: 1, opacity: 0.9 }}
                                    transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
                                >
                                    {/* Enhanced ruffle layers */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" style={{ borderRadius: '0 0 50% 50%' }} />
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[95%] h-3 bg-white/20" style={{ borderRadius: '0 0 40% 40%' }} />
                                    {/* Decorative edge pattern */}
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={`ruffle-${i}`}
                                            className="absolute bottom-0 w-2 h-1 bg-white/15"
                                            style={{
                                                left: `${16 + i * 14}%`,
                                                borderRadius: '50% 50% 0 0'
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            {/* Tall Skirt - VÁY BÁNH CAO */}
                            {selectedOuterIcing.type === 'TallSkirt' && (
                                <motion.div
                                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[120%] h-20"
                                    style={{
                                        background: `linear-gradient(to bottom, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}ee, ${getRealisticColor(selectedOuterIcing.color)}cc, ${getRealisticColor(selectedOuterIcing.color)}aa)`,
                                        borderRadius: '0 0 60% 60%',
                                        boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 16px rgba(0, 0, 0, 0.15)'
                                    }}
                                    initial={{ scaleY: 0, opacity: 0 }}
                                    animate={{ scaleY: 1, opacity: 0.95 }}
                                    transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                                >
                                    {/* Multiple layered ruffle effects */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" style={{ borderRadius: '0 0 60% 60%' }} />
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] h-6 bg-white/25" style={{ borderRadius: '0 0 50% 50%' }} />
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[90%] h-3 bg-white/15" style={{ borderRadius: '0 0 40% 40%' }} />
                                    {/* Decorative tiered edge pattern */}
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={`tall-ruffle-${i}`}
                                            className="absolute bottom-0 w-2 bg-white/20"
                                            style={{
                                                left: `${12 + i * 9.5}%`,
                                                height: `${Math.random() * 3 + 2}px`,
                                                borderRadius: '50% 50% 0 0'
                                            }}
                                        />
                                    ))}
                                    {/* Additional mid-layer ruffles */}
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={`tall-mid-ruffle-${i}`}
                                            className="absolute bottom-2 w-1.5 h-1.5 bg-white/12"
                                            style={{
                                                left: `${15 + i * 12}%`,
                                                borderRadius: '50% 50% 0 0'
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            {/* Bling - ĐỒ TRANG TRÍ LẤP LÁNH */}
                            {selectedOuterIcing.type === 'Bling' && (
                                <div className="absolute inset-0">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <motion.div
                                            key={`bling-${i}`}
                                            className="absolute rounded-full"
                                            style={{
                                                background: `radial-gradient(circle, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}88, transparent)`,
                                                width: `${Math.random() * 8 + 6}px`,
                                                height: `${Math.random() * 8 + 6}px`,
                                                left: `${Math.random() * 65 + 17.5}%`,
                                                top: `${Math.random() * 45 + 27.5}%`,
                                                boxShadow: `0 0 15px ${getRealisticColor(selectedOuterIcing.color)}88, 0 0 25px ${getRealisticColor(selectedOuterIcing.color)}44, inset 0 0 5px rgba(255,255,255,0.5)`
                                            }}
                                            initial={{ scale: 0, opacity: 0, rotate: 0 }}
                                            animate={{
                                                scale: [0, 1.4, 1, 1.2, 1],
                                                opacity: [0, 1, 0.7, 1, 0.8],
                                                rotate: [0, 360, 720],
                                                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)", "brightness(1.3)", "brightness(1)"]
                                            }}
                                            transition={{
                                                delay: 0.8 + i * 0.15,
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 1.5,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* General Decoration and Outer Icing Effects - Chocolate Drops Style */}
                            {(selectedOuterIcing.type === 'Decoration' || selectedOuterIcing.type === 'OuterIcing') && (
                                <div className="absolute inset-0">
                                    {/* Chocolate drop decorations like the image */}
                                    {Array.from({ length: 18 }).map((_, i) => (
                                        <motion.div
                                            key={`choco-drop-${i}`}
                                            className="absolute shadow-lg"
                                            style={{
                                                width: `${Math.random() * 8 + 12}px`,
                                                height: `${Math.random() * 12 + 16}px`,
                                                background: `linear-gradient(135deg, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}dd, ${getRealisticColor(selectedOuterIcing.color)}bb)`,
                                                left: `${Math.random() * 70 + 15}%`,
                                                top: `${Math.random() * 50 + 25}%`,
                                                borderRadius: '50% 50% 50% 0',
                                                transform: `rotate(${Math.random() * 360}deg)`,
                                                boxShadow: `2px 3px 6px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.2)`
                                            }}
                                            initial={{ scale: 0, opacity: 0, rotate: 0 }}
                                            animate={{
                                                scale: [0, 1.1, 1],
                                                opacity: [0, 1, 0.9],
                                                rotate: Math.random() * 360
                                            }}
                                            transition={{ delay: 0.7 + i * 0.05, duration: 0.5 }}
                                        />
                                    ))}
                                    {/* Base pattern overlay for texture */}
                                    <div
                                        className="absolute inset-0 rounded-full opacity-20"
                                        style={{
                                            background: `radial-gradient(circle at 30% 30%, ${getRealisticColor(selectedOuterIcing.color)}44, transparent 60%)`
                                        }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Enhanced realistic candles */}
                    {selectedCandles && (
                        <motion.div
                            className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-full flex justify-center"
                            variants={itemVariants}
                            style={{ animationDelay: '0.5s' }}
                        >
                            {Array.from({ length: 5 }).map((_, i) => (
                                <motion.div
                                    key={`candle-${i}`}
                                    className="mx-2 flex flex-col items-center"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                                >
                                    {/* Enhanced flame with realistic animation */}
                                    <motion.div
                                        className="relative w-3 h-5 mb-1"
                                        animate={{
                                            scale: [1, 1.2, 1.1, 1],
                                            rotate: [-2, 3, -1, 2, -2],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        {/* Outer flame glow */}
                                        <div className="absolute inset-0 bg-orange-400 rounded-full blur-sm opacity-60" />
                                        {/* Inner flame */}
                                        <div className="absolute inset-1 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-full" />
                                        {/* Flame core */}
                                        <div className="absolute inset-2 bg-gradient-to-t from-orange-300 to-yellow-200 rounded-full" />
                                    </motion.div>

                                    {/* Candle wick */}
                                    <div className="w-0.5 h-2 bg-gray-800 rounded-full" />

                                    {/* Enhanced candle body */}
                                    <motion.div
                                        className="w-2 h-16 rounded-full shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${getRealisticColor(selectedCandles.color)}, ${getRealisticColor(selectedCandles.color)}dd)`
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {/* Candle highlight */}
                                        <div className="w-full h-full rounded-full bg-gradient-to-r from-white/30 via-transparent to-transparent" />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Enhanced message display */}
                    {(config.message || config.messageType !== 'none') && (
                        <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-8"
                            variants={itemVariants}
                            style={{ animationDelay: '0.6s' }}
                        >
                            <div
                                className="w-full h-full rounded-lg flex items-center justify-center text-xs font-medium shadow-lg border"
                                style={{
                                    backgroundColor: (() => {
                                        if (config.messageType === 'piped') {
                                            const plaqueColorOption = messageOptions.find(group => group.type === 'PLAQUE_COLOUR')?.items
                                                .find(item => item.id === config.plaqueColor);
                                            return plaqueColorOption ? getRealisticColor(plaqueColorOption.color) : '#FFFFFF';
                                        }
                                        return '#FFFFFF';
                                    })(),
                                    color: (() => {
                                        if (config.messageType === 'piped') {
                                            const pipingColorOption = messageOptions.find(group => group.type === 'PIPING_COLOUR')?.items
                                                .find(item => item.id === config.pipingColor);
                                            return pipingColorOption ? getRealisticColor(pipingColorOption.color) : '#EC4899';
                                        }
                                        return '#EC4899';
                                    })(),
                                    borderColor: (() => {
                                        if (config.messageType === 'piped') {
                                            const pipingColorOption = messageOptions.find(group => group.type === 'PIPING_COLOUR')?.items
                                                .find(item => item.id === config.pipingColor);
                                            return pipingColorOption ? getRealisticColor(pipingColorOption.color) : '#EC4899';
                                        }
                                        return 'transparent';
                                    })(),
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                                }}
                            >
                                {config.messageType === 'edible' && config.uploadedImage ? (
                                    <Image
                                        src={config.uploadedImage}
                                        alt="Uploaded design"
                                        width={120}
                                        height={30}
                                        className="rounded-lg object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="truncate px-2">{config.message || "Message..."}</span>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Size indicator with enhanced styling */}
                    <motion.div
                        className="absolute -bottom-12 -right-8 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg"
                        variants={pulseVariants}
                        animate="animate"
                    >
                        {config.size}
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    };

    // Render the cake visualization based on selected options
    const renderCake = () => {
        // Get selected options
        const selectedSize = config.size;
        const selectedSponge = getSelectedOption('Sponge', config.sponge);
        const selectedFilling = getSelectedOption('Filling', config.filling);
        const selectedIcing = getSelectedOption('Icing', config.icing);

        // Use preview decoration if available, otherwise use selected decoration
        const outerIcingId = previewDecoration || config.outerIcing;
        const selectedOuterIcing = getSelectedOption('OuterIcing', outerIcingId || null);

        const selectedGoo = getSelectedOption('Goo', config.goo);
        const selectedCandles = getSelectedOption('Candles', config.candles);
        const selectedBoard = getSelectedOption('CakeBoard', config.board);

        // Get colors for visualization
        const spongeColor = selectedSponge ? convertColorToTailwind(selectedSponge.color) : 'bg-amber-50';
        const fillingColor = selectedFilling ? convertColorToTailwind(selectedFilling.color) : 'bg-white';
        const icingColor = selectedIcing ? convertColorToTailwind(selectedIcing.color) : 'bg-pink-200';
        const gooColor = selectedGoo ? convertColorToTailwind(selectedGoo.color) : null;

        // Handle special preview for message section
        if (selectedPart === 'message') {
            // Get the actual color options for realistic color display
            const plaqueColorOption = messageOptions.find(group => group.type === 'PLAQUE_COLOUR')?.items
                .find(item => item.id === config.plaqueColor);
            const pipingColorOption = messageOptions.find(group => group.type === 'PIPING_COLOUR')?.items
                .find(item => item.id === config.pipingColor);

            const messageBackgroundColor = config.messageType === 'piped' && plaqueColorOption
                ? getRealisticColor(plaqueColorOption.color)
                : '#FFFFFF';

            const messageTextColor = config.messageType === 'piped' && pipingColorOption
                ? getRealisticColor(pipingColorOption.color)
                : '#EC4899';

            return (
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="relative w-[80%] aspect-square rounded-full">
                        <div className={`absolute inset-0 rounded-full ${icingColor} shadow-lg`}>
                            <div
                                className="absolute inset-[15%] rounded-full flex items-center justify-center border-2"
                                style={{
                                    backgroundColor: messageBackgroundColor,
                                    borderColor: config.messageType === 'piped' ? messageTextColor : 'transparent'
                                }}
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
                                    <div
                                        className="text-center italic p-8 font-medium"
                                        style={{ color: messageTextColor }}
                                    >
                                        {config.message || "Thông điệp của bạn..."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 text-2xl font-bold">
                        {selectedSize}
                    </div>
                    {renderCakeControls()}
                </div>
            );
        }

        return (
            <motion.div
                className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="relative flex justify-center items-center">
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Cake Board */}
                        {selectedBoard && (
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-[140%]">
                                <div className="relative">
                                    {/* Main board with gradient */}
                                    <div
                                        className={`h-4 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-2xl' : 'rounded-full'} 
                                             transition-all duration-300`}
                                        style={{
                                            background: `linear-gradient(to bottom, ${getRealisticColor(selectedBoard.color)}, ${getRealisticColor(selectedBoard.color)}dd)`,
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
                                        <div className={`flex-1 ${spongeColor}`} />
                                        {selectedGoo && <div className={`h-1 ${convertColorToTailwind(selectedGoo.color)}`} />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Right side (icing) */}
                            <div className={`w-1/2 h-full ${icingColor}`}>
                                {/* Add decorative icing details */}
                                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/20 to-transparent" />
                            </div>

                            {/* Filling preview */}
                            <div className={`absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-2 ${fillingColor}`} />
                        </div>

                        {/* Candles */}
                        {selectedCandles && (
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
                                                bg-gradient-to-b ${convertColorToTailwind(selectedCandles.color)}`}
                                            whileHover={{ scale: 1.1 }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Message */}
                        {(config.message || config.messageType !== 'none') && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    className="w-32 h-32 rounded-full flex justify-center items-center text-sm p-4 text-center shadow-sm border-2"
                                    style={{
                                        backgroundColor: (() => {
                                            if (config.messageType === 'piped') {
                                                const plaqueColorOption = messageOptions.find(group => group.type === 'PLAQUE_COLOUR')?.items
                                                    .find(item => item.id === config.plaqueColor);
                                                return plaqueColorOption ? getRealisticColor(plaqueColorOption.color) : '#FFFFFF';
                                            }
                                            return 'rgba(255, 255, 255, 0.9)';
                                        })(),
                                        color: (() => {
                                            if (config.messageType === 'piped') {
                                                const pipingColorOption = messageOptions.find(group => group.type === 'PIPING_COLOUR')?.items
                                                    .find(item => item.id === config.pipingColor);
                                                return pipingColorOption ? getRealisticColor(pipingColorOption.color) : '#EC4899';
                                            }
                                            return '#F472B6';
                                        })(),
                                        borderColor: (() => {
                                            if (config.messageType === 'piped') {
                                                const pipingColorOption = messageOptions.find(group => group.type === 'PIPING_COLOUR')?.items
                                                    .find(item => item.id === config.pipingColor);
                                                return pipingColorOption ? getRealisticColor(pipingColorOption.color) : '#EC4899';
                                            }
                                            return 'transparent';
                                        })()
                                    }}
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
                                        config.message || "Thông điệp..."
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Decoration Effects Based on Type */}
                        {selectedOuterIcing && (
                            <div className="absolute inset-0">
                                {/* Sprinkles - HẠT RẮC */}
                                {selectedOuterIcing.type === 'Sprinkles' && (
                                    <div className="absolute inset-0">
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <div
                                                key={`simple-sprinkle-${i}`}
                                                className="absolute w-1.5 h-3 rounded-full shadow-sm opacity-90"
                                                style={{
                                                    backgroundColor: getRealisticColor(selectedOuterIcing.color),
                                                    left: `${Math.random() * 65 + 17.5}%`,
                                                    top: `${Math.random() * 45 + 27.5}%`,
                                                    transform: `rotate(${Math.random() * 360}deg)`,
                                                    boxShadow: `1px 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)`
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Drip Effect - SỐT CHẢY TRÀN */}
                                {selectedOuterIcing.type === 'Drip' && (
                                    <div className="absolute inset-0">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div
                                                key={`simple-drip-${i}`}
                                                className="absolute rounded-b-full shadow-md opacity-85"
                                                style={{
                                                    background: `linear-gradient(to bottom, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}cc)`,
                                                    width: `${Math.random() * 3 + 3}px`,
                                                    height: `${Math.random() * 15 + 12}px`,
                                                    left: `${12 + i * 6.5}%`,
                                                    top: `${30 + Math.random() * 15}%`,
                                                    clipPath: 'polygon(30% 0%, 70% 0%, 85% 100%, 15% 100%)',
                                                    boxShadow: '1px 2px 4px rgba(0,0,0,0.4)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Short Skirt - VÁY BÁNH THẤP */}
                                {selectedOuterIcing.type === 'ShortSkirt' && (
                                    <div
                                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[108%] h-10"
                                        style={{
                                            background: `linear-gradient(to bottom, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}dd, ${getRealisticColor(selectedOuterIcing.color)}bb)`,
                                            borderRadius: '0 0 50% 50%',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.08)'
                                        }}
                                    >
                                        {/* Ruffle layers for simple view */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent"
                                            style={{ borderRadius: '0 0 50% 50%' }}
                                        />
                                        <div
                                            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[92%] h-2 bg-white/18"
                                            style={{ borderRadius: '0 0 40% 40%' }}
                                        />
                                    </div>
                                )}

                                {/* Tall Skirt - VÁY BÁNH CAO */}
                                {selectedOuterIcing.type === 'TallSkirt' && (
                                    <div
                                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[115%] h-16"
                                        style={{
                                            background: `linear-gradient(to bottom, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}ee, ${getRealisticColor(selectedOuterIcing.color)}cc, ${getRealisticColor(selectedOuterIcing.color)}aa)`,
                                            borderRadius: '0 0 60% 60%',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 3px 6px rgba(0, 0, 0, 0.12)'
                                        }}
                                    >
                                        {/* Multiple ruffle layers for simple view */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-b from-white/45 to-transparent"
                                            style={{ borderRadius: '0 0 60% 60%' }}
                                        />
                                        <div
                                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-[95%] h-4 bg-white/22"
                                            style={{ borderRadius: '0 0 50% 50%' }}
                                        />
                                        <div
                                            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[90%] h-2 bg-white/12"
                                            style={{ borderRadius: '0 0 40% 40%' }}
                                        />
                                    </div>
                                )}

                                {/* Bling - ĐỒ TRANG TRÍ LẤP LÁNH */}
                                {selectedOuterIcing.type === 'Bling' && (
                                    <div className="absolute inset-0">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div
                                                key={`simple-bling-${i}`}
                                                className="absolute rounded-full animate-pulse"
                                                style={{
                                                    background: `radial-gradient(circle, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}99, transparent)`,
                                                    width: `${Math.random() * 6 + 8}px`,
                                                    height: `${Math.random() * 6 + 8}px`,
                                                    left: `${Math.random() * 55 + 22.5}%`,
                                                    top: `${Math.random() * 35 + 32.5}%`,
                                                    boxShadow: `0 0 12px ${getRealisticColor(selectedOuterIcing.color)}aa, 0 0 20px ${getRealisticColor(selectedOuterIcing.color)}66, inset 0 0 4px rgba(255,255,255,0.6)`,
                                                    animation: `pulse 1.5s ease-in-out infinite alternate`
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* General Decoration and Outer Icing Effects - Chocolate Drops Style */}
                                {(selectedOuterIcing.type === 'Decoration' || selectedOuterIcing.type === 'OuterIcing') && (
                                    <div className="absolute inset-0">
                                        {/* Chocolate drop decorations like the image */}
                                        {Array.from({ length: 14 }).map((_, i) => (
                                            <div
                                                key={`simple-choco-drop-${i}`}
                                                className="absolute shadow-md opacity-90"
                                                style={{
                                                    width: `${Math.random() * 6 + 8}px`,
                                                    height: `${Math.random() * 8 + 10}px`,
                                                    background: `linear-gradient(135deg, ${getRealisticColor(selectedOuterIcing.color)}, ${getRealisticColor(selectedOuterIcing.color)}dd, ${getRealisticColor(selectedOuterIcing.color)}aa)`,
                                                    left: `${Math.random() * 65 + 17.5}%`,
                                                    top: `${Math.random() * 45 + 27.5}%`,
                                                    borderRadius: '50% 50% 50% 0',
                                                    transform: `rotate(${Math.random() * 360}deg)`,
                                                    boxShadow: `1px 2px 4px rgba(0,0,0,0.25), inset 1px 1px 1px rgba(255,255,255,0.2)`
                                                }}
                                            />
                                        ))}
                                        {/* Subtle base texture */}
                                        <div
                                            className="absolute inset-0 rounded-full opacity-15"
                                            style={{
                                                background: `radial-gradient(circle at 40% 40%, ${getRealisticColor(selectedOuterIcing.color)}66, transparent 50%)`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Size indicator */}
                        <div className="absolute bottom-4 right-4 text-2xl font-bold">
                            {selectedSize}
                        </div>

                        {renderCakeControls()}
                    </div>
                </div>
            </motion.div>
        );
    };

    // Render cake control buttons
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
            </motion.div>
        );
    };

    // Render the appropriate customization panel based on selected part
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
                        Thử lại
                    </Button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                    <p className="text-gray-500">Đang tải tùy chọn...</p>
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
                            <div className="grid grid-cols-2 gap-4">
                                {partOptions.find(group => group.type === 'Size')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.size === option.name ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSizeSelect(option)}
                                        className={`relative flex p-4 rounded-xl border-2 
                                            ${config.size === option.name
                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                : 'border-gray-200 hover:border-pink-300'} 
                                            transition-all duration-300 transform`}
                                    >
                                        <div className="flex-1">
                                            <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                                {option.name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2">{option.description}</div>
                                            <div className="text-pink-600 font-bold mt-2 text-lg">
                                                {option.price.toLocaleString()} VND
                                            </div>
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
                                TẦNG BÁNH
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {partOptions.find(group => group.type === 'Sponge')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.sponge === option.id ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSpongeSelect(option)}
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
                                                    className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {partOptions.find(group => group.type === 'Filling')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.filling === option.id ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleFillingSelect(option)}
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
                                                    className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
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

                        {/* Icing options */}
                        <div className="mb-8">
                            <h3 className="font-bold mb-4 text-2xl text-pink-500">
                                LỚP PHỦ
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {partOptions.find(group => group.type === 'Icing')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.icing === option.id ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleIcingSelect(option)}
                                        className={`relative flex flex-col p-4 rounded-xl border-2
                                            ${config.icing === option.id
                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                : 'border-gray-200 hover:border-pink-300'}
                                            transition-all duration-300`}
                                    >
                                        <div className="w-full mb-3">
                                            {/* {option.image ? (
                                                <Image
                                                    src={option.image.file_url}
                                                    alt={option.name}
                                                    width={200}
                                                    height={200}
                                                    className="rounded-lg object-cover w-full h-32"
                                                />
                                            ) : (
                                                <div
                                                    className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
                                                />
                                            )} */}
                                            <div
                                                className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
                                            />
                                        </div>
                                        <div className="text-left w-full">
                                            <div className="font-medium text-gray-900">{option.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                                            <div className="text-pink-500 font-bold mt-2">
                                                {option.price.toLocaleString()} VND
                                            </div>
                                        </div>
                                        {config.icing === option.id && (
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
                                KEM NHÂN
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {partOptions.find(group => group.type === 'Goo')?.items.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        variants={selectedVariants}
                                        animate={config.goo === option.id ? "selected" : "unselected"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleGooSelect(option)}
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
                                                    className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
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

            case 'decoration':
                return (
                    <div className="space-y-6">
                        <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            TRANG TRÍ
                        </h3>

                        {decorationOptions.map(group => (
                            <div key={group.type} className="mb-8">
                                <h4 className="font-semibold text-xl text-gray-800 mb-4 capitalize">
                                    {group.type === 'OuterIcing' ? '🧁 PHỦ KEM NGOÀI' :
                                        group.type === 'Decoration' ? '✨ TRANG TRÍ' :
                                            group.type === 'Drip' ? '💧 SỐT CHẢY TRÀN' :
                                                group.type === 'Sprinkles' ? '🌟 HẠT RẮC' :
                                                    group.type === 'Bling' ? '💎 ĐỒ TRANG TRÍ LẤP LÁNH' :
                                                        group.type === 'TallSkirt' ? '👗 VÁY BÁNH CAO' :
                                                            group.type === 'ShortSkirt' ? '🎀 VÁY BÁNH THẤP' : `🎨 ${group.type}`}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {group.items.map(option => (
                                        <motion.button
                                            key={option.id}
                                            variants={selectedVariants}
                                            animate={Array.isArray(config.outerIcing) && config.outerIcing.includes(option.id) ? "selected" : "unselected"}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleDecorationSelect(option)}
                                            onMouseEnter={() => handleDecorationPreview(option.id)}
                                            onMouseLeave={clearDecorationPreview}
                                            className={`relative flex flex-col p-4 rounded-xl border-2
                                                ${Array.isArray(config.outerIcing) && config.outerIcing.includes(option.id)
                                                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                    : previewDecoration === option.id
                                                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50'
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
                                                        className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-4xl opacity-50">
                                                                {group.type === 'Drip' ? '💧' :
                                                                    group.type === 'Sprinkles' ? '✨' :
                                                                        group.type === 'TallSkirt' ? '👗' :
                                                                            group.type === 'Bling' ? '💎' : '🎨'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left w-full">
                                                <div className="font-medium text-gray-900">{option.name}</div>
                                                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                                                <div className="text-pink-500 font-bold mt-2">
                                                    {option.price.toLocaleString()} VND
                                                </div>
                                            </div>
                                            {Array.isArray(config.outerIcing) && config.outerIcing.includes(option.id) && (
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
                        ))}

                        <div className="mt-6 text-center text-sm text-gray-500">
                            {previewDecoration ? (
                                <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                                    <span className="animate-pulse">👁️</span>
                                    Đang xem trước trang trí - Di chuột ra để thoát
                                </div>
                            ) : (
                                'Di chuột vào tùy chọn để xem trước trên bánh'
                            )}
                        </div>
                        {renderCompleteButton()}
                    </div>
                );

            case 'message':
                // Define message type options
                const messageTypeOptions = [
                    { id: 'none', name: 'KHÔNG', icon: '✖️' },
                    { id: 'piped', name: 'CHỮ VIẾT TAY', icon: '✍️' },
                    { id: 'edible', name: 'HÌNH ẢNH ĂN ĐƯỢC', icon: '🖼️' }
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
                                    onClick={() => handleMessageTypeSelect(option.id as 'none' | 'piped' | 'edible')}
                                    className={`relative flex flex-col items-center p-4 rounded-xl border-2
                                        ${config.messageType === option.id
                                            ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                            : 'border-gray-200 hover:border-pink-300'}
                                        transition-all duration-300`}
                                >
                                    <div className="text-3xl mb-2">{option.icon}</div>
                                    <div className="text-sm font-medium text-center">{option.name}</div>
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

                        {/* Message Content Options */}
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
                                        {messageOptions.find(group => group.type === 'PLAQUE_COLOUR') && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Màu Thông Điệp
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {messageOptions.find(group => group.type === 'PLAQUE_COLOUR')?.items.map(option => (
                                                        <motion.button
                                                            key={option.id}
                                                            variants={selectedVariants}
                                                            animate={config.plaqueColor === option.id ? "selected" : "unselected"}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handlePlaqueColorSelect(option)}
                                                            className={`relative flex items-center space-x-3 p-3 rounded-xl border-2
                                                                ${config.plaqueColor === option.id
                                                                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                                    : 'border-gray-200 hover:border-pink-300'}
                                                                transition-all duration-300`}
                                                        >
                                                            <div
                                                                className="w-8 h-8 rounded-lg border border-gray-300 shadow-sm"
                                                                style={{ backgroundColor: getRealisticColor(option.color) }}
                                                            />
                                                            <span className="text-sm font-medium">{option.color}</span>
                                                            {config.plaqueColor === option.id && (
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
                                        )}

                                        {/* Piping Color Selection */}
                                        {messageOptions.find(group => group.type === 'PIPING_COLOUR') && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Màu Viền
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {messageOptions.find(group => group.type === 'PIPING_COLOUR')?.items.map(option => (
                                                        <motion.button
                                                            key={option.id}
                                                            variants={selectedVariants}
                                                            animate={config.pipingColor === option.id ? "selected" : "unselected"}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handlePipingColorSelect(option)}
                                                            className={`relative flex items-center space-x-3 p-3 rounded-xl border-2
                                                                ${config.pipingColor === option.id
                                                                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                                    : 'border-gray-200 hover:border-pink-300'}
                                                                transition-all duration-300`}
                                                        >
                                                            <div
                                                                className="w-8 h-8 rounded-lg border border-gray-300 shadow-sm"
                                                                style={{ backgroundColor: getRealisticColor(option.color) }}
                                                            />
                                                            <span className="text-sm font-medium">{option.color}</span>
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
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {renderCompleteButton()}
                    </div>
                );

            case 'extras':
                return (
                    <div>
                        <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            THÊM PHẦN
                        </h3>
                        <div className="space-y-8">
                            {/* Group extras by type */}
                            {extraOptions.map(group => (
                                <div key={group.type} className="space-y-4">
                                    <h4 className="font-semibold text-xl text-gray-800 pl-2 border-l-4 border-pink-500">
                                        {group.type === 'Candles' ? 'NẾN TRANG TRÍ 🕯️' :
                                            group.type === 'CakeBoard' ? 'ĐẾ BÁNH 🎂' :
                                                group.type === 'Topper' ? 'TOPPER 🧁' : group.type}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {group.items.map(option => (
                                            <motion.button
                                                key={option.id}
                                                variants={selectedVariants}
                                                animate={
                                                    (group.type === 'Candles' && config.candles === option.id) ||
                                                        (group.type === 'CakeBoard' && config.board === option.id) ||
                                                        (Array.isArray(config.extras) && config.extras.includes(option.id))
                                                        ? "selected" : "unselected"
                                                }
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleExtraSelect(option)}
                                                className={`relative flex items-center p-6 rounded-xl border-2 w-full
                                                    ${(group.type === 'Candles' && config.candles === option.id) ||
                                                        (group.type === 'CakeBoard' && config.board === option.id) ||
                                                        (Array.isArray(config.extras) && config.extras.includes(option.id))
                                                        ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                                                        : 'border-gray-200 hover:border-pink-300'
                                                    }
                                                    transition-all duration-300`}
                                            >
                                                <div className="flex-1 flex items-center gap-6">
                                                    <div className={`relative w-24 h-24 rounded-lg overflow-hidden 
                                                        ${option.image
                                                            ? ''
                                                            : `${convertColorToTailwind(option.color)}`}`
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
                                                                {group.type === 'Candles' ? '🕯️' :
                                                                    group.type === 'CakeBoard' ? '🎂' :
                                                                        group.type === 'Topper' ? '🧁' : '🍰'}
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
                                                {((group.type === 'Candles' && config.candles === option.id) ||
                                                    (group.type === 'CakeBoard' && config.board === option.id) ||
                                                    (Array.isArray(config.extras) && config.extras.includes(option.id))) && (
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
                            ))}
                        </div>
                        <div className="mt-6 text-center text-sm text-gray-500">
                            Chọn thêm trang trí hoặc phụ kiện để hoàn thiện bánh của bạn
                        </div>
                        {renderCompleteButton()}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen relative overflow-hidden"
        >
            {/* Enhanced global styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Dancing+Script:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
                
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(236, 72, 153, 0.4) rgba(255, 255, 255, 0.1);
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, rgba(236, 72, 153, 0.6), rgba(139, 92, 246, 0.6));
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(139, 92, 246, 0.8));
                    box-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }

                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1); }
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .float-animation {
                    animation: float 3s ease-in-out infinite;
                }

                .sparkle-animation {
                    animation: sparkle 2s ease-in-out infinite;
                }

                .shimmer-effect {
                    position: relative;
                    overflow: hidden;
                }

                .shimmer-effect::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.4),
                        transparent
                    );
                    transform: translateX(-100%);
                    animation: shimmer 2s infinite;
                }

                .glass-morphism {
                    background: rgba(255, 255, 255, 0.25);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                }

                .glass-morphism-dark {
                    background: rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .text-gradient {
                    background: linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .text-gradient-gold {
                    background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .button-glow {
                    box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
                    transition: all 0.3s ease;
                }

                .button-glow:hover {
                    box-shadow: 0 0 30px rgba(236, 72, 153, 0.5);
                    transform: translateY(-2px);
                }

                .card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .card-hover:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }

                .neon-border {
                    border: 2px solid transparent;
                    background: linear-gradient(white, white) padding-box,
                                linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6) border-box;
                }

                .neon-glow {
                    filter: drop-shadow(0 0 10px rgba(236, 72, 153, 0.5));
                }

                body {
                    font-family: 'Poppins', 'Inter', sans-serif;
                    background: #f8fafc;
                }

                .font-dancing {
                    font-family: 'Dancing Script', cursive;
                }

                .font-poppins {
                    font-family: 'Poppins', sans-serif;
                }

                /* Enhanced button styles */
                .btn-primary {
                    background: linear-gradient(135deg, #ec4899, #8b5cf6);
                    border: none;
                    color: white;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
                }

                .btn-primary:hover {
                    background: linear-gradient(135deg, #be185d, #7c3aed);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.4);
                }

                /* Enhanced card styles */
                .card-modern {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }

                .card-modern:hover {
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    transform: translateY(-4px);
                }

                /* Enhanced gradient text */
                .text-gradient-premium {
                    background: linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6, #10b981);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    background-size: 300% 300%;
                    animation: gradientShift 3s ease infinite;
                }

                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                /* Enhanced glassmorphism */
                .glass-premium {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(25px);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }

                /* Neon glow effects */
                .neon-pink {
                    box-shadow: 0 0 20px rgba(236, 72, 153, 0.5),
                               0 0 40px rgba(236, 72, 153, 0.3),
                               0 0 60px rgba(236, 72, 153, 0.1);
                }

                .neon-purple {
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.5),
                               0 0 40px rgba(139, 92, 246, 0.3),
                               0 0 60px rgba(139, 92, 246, 0.1);
                }
            `}</style>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row w-full max-w-7xl mx-auto gap-8 p-6 relative z-10"
            >
                {/* Left side - Enhanced Cake Preview */}
                <motion.div
                    layout
                    className="flex-1 sticky top-6 h-fit"
                >
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative aspect-square w-full max-w-2xl mx-auto glass-premium rounded-3xl shadow-2xl p-8 neon-pink card-modern"
                    >
                        {/* Enhanced background with animated elements */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-purple-100/30 to-blue-100/30" />

                            {/* Animated sparkles in background */}
                            {Array.from({ length: 15 }).map((_, i) => (
                                <motion.div
                                    key={`bg-sparkle-${i}`}
                                    className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                    }}
                                    animate={{
                                        scale: [0, 1, 0],
                                        opacity: [0, 1, 0],
                                        rotate: [0, 180, 360],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}

                            {/* Shimmer effect overlay */}
                            <div className="absolute inset-0 shimmer-effect" />
                        </div>

                        {/* Floating decorative elements around cake */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[Sparkles, Heart, Star, Zap].map((Icon, i) => (
                                <motion.div
                                    key={`floating-icon-${i}`}
                                    className="absolute text-pink-400/30"
                                    style={{
                                        left: `${20 + i * 20}%`,
                                        top: `${10 + i * 15}%`,
                                    }}
                                    animate={{
                                        y: [0, -20, 0],
                                        rotate: [0, 360],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 4 + i,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.5
                                    }}
                                >
                                    <Icon size={24} />
                                </motion.div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedPart || 'default'}
                                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                transition={{
                                    duration: 0.6,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20
                                }}
                                ref={cakePreviewRef}
                                className="relative z-10"
                            >
                                {/* Enhanced cake visualization */}
                                {renderCake()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Enhanced floating action buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsZoomed(!isZoomed)}
                                className="p-4 glass-morphism rounded-full shadow-lg button-glow neon-glow transition-all group"
                            >
                                <motion.div
                                    animate={{ rotate: isZoomed ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {isZoomed ? (
                                        <svg className="w-6 h-6 text-pink-600 group-hover:text-purple-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-pink-600 group-hover:text-purple-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                        </svg>
                                    )}
                                </motion.div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSaveDesign}
                                className="p-4 glass-morphism rounded-full shadow-lg button-glow neon-glow transition-all group"
                            >
                                <svg className="w-6 h-6 text-pink-600 group-hover:text-purple-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                    <path d="M17 21v-8H7v8M7 3v5h8" />
                                </svg>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    if (cakePreviewRef.current) {
                                        html2canvas(cakePreviewRef.current).then(canvas => {
                                            const link = document.createElement('a');
                                            link.download = 'my-custom-cake.png';
                                            link.href = canvas.toDataURL();
                                            link.click();
                                        });
                                    }
                                }}
                                className="p-4 glass-morphism rounded-full shadow-lg button-glow neon-glow transition-all group"
                            >
                                <Download className="w-6 h-6 text-pink-600 group-hover:text-purple-600 transition-colors" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Right side - Enhanced Configuration Panel */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full md:w-[420px]"
                >
                    <div className="glass-premium rounded-3xl shadow-2xl neon-purple card-modern">
                        {/* Enhanced header */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="p-8 border-b border-white/30 relative overflow-hidden"
                        >
                            {/* Header background animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10" />
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />

                            <div className="flex justify-between items-center relative z-10">
                                <motion.div
                                    initial={{ y: -20 }}
                                    animate={{ y: 0 }}
                                    className="space-y-2"
                                >
                                    <h1 className="text-5xl font-bold text-gradient-premium font-dancing">
                                        ✨ BÁNH CUSTOM ✨
                                    </h1>
                                    <p className="text-sm text-gray-700 font-medium font-poppins">
                                        Tạo chiếc bánh trong mơ của bạn
                                    </p>
                                </motion.div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 180 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleResetConfig}
                                    className="p-3 glass-morphism-dark rounded-full hover:bg-pink-50/20 transition-all neon-glow"
                                    title="Reset Design"
                                >
                                    <svg
                                        className="w-6 h-6 text-pink-600"
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

                            {/* Enhanced price display */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-4 relative"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center shadow-lg neon-glow"
                                        >
                                            <span className="text-lg">💰</span>
                                        </motion.div>
                                        <div>
                                            <motion.div
                                                key={config.price}
                                                initial={{ scale: 1.2, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-2xl font-bold text-gradient-gold font-poppins"
                                            >
                                                {config.price.toLocaleString()} VND
                                            </motion.div>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 text-sm glass-morphism-dark hover:bg-pink-50/20 text-pink-700 rounded-full transition-all neon-glow"
                                        onClick={() => setShowJson(!showJson)}
                                    >
                                        {showJson ? '🙈 Ẩn chi tiết' : '👁️ Xem chi tiết'}
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Enhanced price breakdown */}
                            <AnimatePresence>
                                {showJson && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mt-4"
                                    >
                                        <div className="glass-premium rounded-xl p-6 text-sm space-y-3 border border-white/20">
                                            <h3 className="font-bold text-pink-700 mb-4 flex items-center text-lg font-poppins">
                                                📊 Chi tiết giá:
                                            </h3>
                                            <div className="space-y-3 text-gray-700 font-poppins">
                                                {config.size && (
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/20">
                                                        <span className="font-medium">🍰 Kích thước ({config.size})</span>
                                                        <span className="font-bold text-pink-600">{partOptions.find(g => g.type === 'Size')?.items.find(i => i.name === config.size)?.price.toLocaleString() || 0} VND</span>
                                                    </div>
                                                )}
                                                {config.sponge && (
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/20">
                                                        <span className="font-medium">🧽 Bánh bột</span>
                                                        <span className="font-bold text-pink-600">{getSelectedOption('Sponge', config.sponge)?.price.toLocaleString() || 0} VND</span>
                                                    </div>
                                                )}
                                                {config.filling && (
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/20">
                                                        <span className="font-medium">🥧 Nhân bánh</span>
                                                        <span className="font-bold text-pink-600">{getSelectedOption('Filling', config.filling)?.price.toLocaleString() || 0} VND</span>
                                                    </div>
                                                )}
                                                {config.icing && (
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/20">
                                                        <span className="font-medium">🧁 Kem bánh</span>
                                                        <span className="font-bold text-pink-600">{getSelectedOption('Icing', config.icing)?.price.toLocaleString() || 0} VND</span>
                                                    </div>
                                                )}
                                                {config.outerIcing && (
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/20">
                                                        <span className="font-medium">✨ Trang trí</span>
                                                        <span className="font-bold text-pink-600">{getSelectedOption('OuterIcing', config.outerIcing)?.price.toLocaleString() || 0} VND</span>
                                                    </div>
                                                )}
                                                {Array.isArray(config.extras) && config.extras.length > 0 && (
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/20">
                                                        <span className="font-medium">🎁 Phụ kiện ({config.extras.length})</span>
                                                        <span className="font-bold text-pink-600">
                                                            {config.extras.reduce((total, extraId) => {
                                                                const extra = extraOptions.flatMap(g => g.items).find(i => i.id === extraId);
                                                                return total + (extra?.price || 0);
                                                            }, 0).toLocaleString()} VND
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Enhanced scrollable content */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {!selectedPart ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-4"
                                            variants={containerVariants}
                                        >
                                            <MenuItem
                                                icon="🍰"
                                                title="BÁNH"
                                                subtitle={config.size || "Chọn kích thước và hương vị"}
                                                onClick={() => handlePartSelect('cake')}
                                                gradient="from-pink-500 to-rose-500"
                                                disabled={false}
                                                completed={completedSteps.cake}
                                            />
                                            <MenuItem
                                                icon="🧁"
                                                title="TRANG TRÍ"
                                                subtitle={getSelectedOption('OuterIcing', config.outerIcing)?.name || "Chọn kiểu trang trí"}
                                                onClick={() => handlePartSelect('decoration')}
                                                gradient="from-purple-500 to-indigo-500"
                                                disabled={!completedSteps.cake}
                                                completed={completedSteps.decoration}
                                            />
                                            <MenuItem
                                                icon="✍️"
                                                title="THÔNG ĐIỆP"
                                                subtitle={config.message || (config.messageType === 'none' ? "Không có thông điệp" : "Thêm thông điệp")}
                                                onClick={() => handlePartSelect('message')}
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
                                                onClick={() => handlePartSelect('extras')}
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
                                            <div className="flex items-center gap-3 mb-6">
                                                <motion.button
                                                    whileHover={{ scale: 1.1, x: -5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setSelectedPart(null)}
                                                    className="p-3 glass-morphism-dark hover:bg-pink-50/20 rounded-full transition-all neon-glow"
                                                >
                                                    <ArrowLeft className="w-6 h-6 text-pink-600" />
                                                </motion.button>
                                                <h2 className="text-2xl font-bold text-gradient font-dancing">
                                                    {selectedPart === 'cake' ? '🍰 BÁNH' :
                                                        selectedPart === 'decoration' ? '🧁 TRANG TRÍ' :
                                                            selectedPart === 'message' ? '✍️ THÔNG ĐIỆP' : '🍪 THÊM PHẦN'}
                                                </h2>
                                            </div>
                                            {renderCustomizationPanel()}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Enhanced action buttons */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="p-6 border-t border-white/20 flex gap-4 relative overflow-hidden"
                        >
                            {/* Button background animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5" />

                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSaveDesign}
                                className="flex-1 glass-premium border-2 border-pink-500/50 text-pink-600 py-5 text-lg font-bold rounded-xl hover:bg-pink-50/20 transition-all shadow-lg hover:shadow-xl neon-pink relative overflow-hidden group font-poppins"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <span className="text-xl">💾</span>
                                    LƯU THIẾT KẾ
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOrderCake}
                                disabled={!completedSteps.cake || !completedSteps.decoration || !completedSteps.message || !completedSteps.extras}
                                className={`flex-1 py-5 text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl relative overflow-hidden group font-poppins
                                    ${(!completedSteps.cake || !completedSteps.decoration || !completedSteps.message || !completedSteps.extras)
                                        ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600'
                                        : 'btn-primary neon-purple'}`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    THÊM VÀO GIỎ HÀNG
                                </span>
                                {(completedSteps.cake && completedSteps.decoration && completedSteps.message && completedSteps.extras) && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Add the BakerySwitchModal */}
            <BakerySwitchModal
                isOpen={bakerySwitchModal.isOpen}
                currentBakeryName={bakerySwitchModal.currentBakeryName}
                newBakeryName={bakerySwitchModal.newBakeryName}
                onConfirm={bakerySwitchModal.onConfirm}
                onCancel={bakerySwitchModal.onCancel}
            />
        </motion.div>
    );
};

// Enhanced MenuItem component for the main menu
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
            whileHover={{
                scale: 1.03,
                y: -6,
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)"
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            variants={itemVariants}
            className={`w-full flex items-center gap-6 p-8 rounded-2xl transition-all glass-premium relative overflow-hidden group
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg card-modern'}
                ${completed ? 'neon-pink border-2 border-pink-500/30' : 'border border-white/20'}`}
        >
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />

            <motion.div
                whileHover={{
                    rotate: [0, -15, 15, -10, 10, 0],
                    scale: [1, 1.3, 1]
                }}
                transition={{ duration: 0.6 }}
                className="text-5xl relative z-10 filter drop-shadow-lg"
            >
                {icon}
            </motion.div>

            <div className="flex-1 text-left relative z-10">
                <motion.div
                    className={`font-bold text-2xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-dancing`}
                >
                    {title}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 1 }}
                    className="text-base text-gray-700 mt-2 font-medium font-poppins"
                >
                    {subtitle}
                </motion.div>
            </div>

            {completed ? (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg neon-glow relative z-10"
                >
                    <Check className="w-6 h-6" />
                </motion.div>
            ) : (
                <motion.div
                    whileHover={{ x: 10, scale: 1.3 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${disabled ? 'text-gray-400 bg-gray-100/50' : 'text-pink-500 bg-gradient-to-r from-pink-100/70 to-purple-100/70 shadow-lg'
                        }`}
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </motion.div>
            )}

            {/* Sparkle effects for completed items */}
            {completed && (
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            style={{
                                left: `${20 + i * 30}%`,
                                top: `${20 + i * 20}%`,
                            }}
                            animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.5,
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.button>
    );
};

export default CakeCustomizer;