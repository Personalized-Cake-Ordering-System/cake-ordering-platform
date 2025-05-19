// "use client" ;

// import { Button } from '@/components/ui/button' ;
// import { useCart } from '@/app/store/useCart' ;
// import { CakeConfig } from '@/types/cake' ;
// import { AnimatePresence, motion } from 'framer-motion' ;
// import { ArrowLeft, Check, Download } from 'lucide-react' ;
// import { useRouter, useSearchParams } from 'next/navigation' ;
// import Image from 'next/image' ;
// import React, { useEffect, useState, useRef } from 'react' ;
// import { useCakeConfigStore } from '@/components/shared/client/stores/cake-config' ;
// import { toast } from 'react-hot-toast' ;
// import html2canvas from 'html2canvas' ;

// // API response types
// interface ApiError {
//     code: string ;
//     message: string ;
//     details?: any ;
// }

// interface ApiResponse<T> {
//     status_code: number ;
//     errors: ApiError[] ;
//     meta_data: {
//         total_items_count: number ;
//         page_size: number ;
//         total_pages_count: number ;
//         page_index: number ;
//         has_next: boolean ;
//         has_previous: boolean ;
//     } ;
//     payload: T[] ;
// }

// interface ApiImage {
//     file_name: string ;
//     file_url: string ;
//     id: string ;
//     created_at: string ;
//     created_by: string ;
//     updated_at: string | null ;
//     updated_by: string | null ;
//     is_deleted: boolean ;
// }

// interface ApiItem {
//     id: string ;
//     name: string ;
//     price: number ;
//     color: string ;
//     is_default: boolean ;
//     description: string ;
//     image_id: string | null ;
//     image: ApiImage | null ;
//     type: string ;
//     bakery_id: string ;
//     bakery: null ;
//     created_at: string ;
//     created_by: string ;
//     updated_at: string | null ;
//     updated_by: string | null ;
//     is_deleted: boolean ;
// }

// interface ApiOptionGroup {
//     type: string ;
//     items: ApiItem[] ;
// }

// // Define type for the selected part
// type SelectedPart = 'cake' | 'decoration' | 'message' | 'extras' | null ;

// // Type for step status tracking
// type StepStatus = {
//     cake: boolean ;
//     decoration: boolean ;
//     message: boolean ;
//     extras: boolean ;
// } ;

// // Type for board shape
// type BoardShape = 'round' | 'square' ;

// // Get initial cake configuration
// const getInitialCakeConfig = (): CakeConfig => {
//     if (typeof window === 'undefined') {
//         // Return default config when running on server
//         return {
//             size: '',
//             price: 0,
//             sponge: '',
//             outerIcing: '',
//             filling: '',
//             icing: '',
//             topping: null,
//             message: '',
//             candles: null,
//             board: '',
//             goo: null,
//             extras: [],
//             messageType: 'none',
//             plaqueColor: 'white',
//             uploadedImage: null,
//             imageUrl: null,
//             pipingColor: 'white'
//         } ;
//     }

//     // Try to get saved config from localStorage
//     const savedConfig = localStorage.getItem('cakeConfig') ;
//     if (savedConfig) {
//         try {
//             return JSON.parse(savedConfig) ;
//         } catch (error) {
//             console.error('Error parsing saved cake config:', error) ;
//         }
//     }

//     // Return default config if no saved config exists
//     return {
//         size: '',
//         price: 0,
//         sponge: '',
//         outerIcing: '',
//         filling: '',
//         icing: '',
//         topping: null,
//         message: '',
//         candles: null,
//         board: '', 
//         goo: null,
//         extras: [],
//         messageType: 'none',
//         plaqueColor: 'white',
//         uploadedImage: null,
//         imageUrl: null,
//         pipingColor: 'white'
//     } ;
// } ;

// // Animation variants for selected items
// const selectedVariants = {
//     selected: {
//         scale: [1, 1.05, 1],
//         boxShadow: "0 0 0 3px rgba(236, 72, 153, 0.4)",
//         transition: {
//             duration: 0.3
//         }
//     },
//     unselected: {
//         scale: 1,
//         boxShadow: "0 0 0 0px rgba(236, 72, 153, 0)",
//         transition: {
//             duration: 0.2
//         }
//     }
// } ;

// const CakeCustomizer = ({ storeId }: { storeId: string }) => {
//     const { addToCart, items } = useCart() ;
//     const router = useRouter() ;
//     const searchParams = useSearchParams() ;
//     const editId = searchParams.get('editId') ;
//     const { config, setConfig } = useCakeConfigStore() ;
//     const cakePreviewRef = useRef<HTMLDivElement>(null) ;

//     // UI state
//     const [selectedPart, setSelectedPart] = useState<SelectedPart>(null) ;
//     const [showJson, setShowJson] = useState(false) ;
//     const [isZoomed, setIsZoomed] = useState(false) ;

//     // API data state
//     const [decorationOptions, setDecorationOptions] = useState<ApiOptionGroup[]>([]) ;
//     const [partOptions, setPartOptions] = useState<ApiOptionGroup[]>([]) ;
//     const [messageOptions, setMessageOptions] = useState<ApiOptionGroup[]>([]) ;
//     const [extraOptions, setExtraOptions] = useState<ApiOptionGroup[]>([]) ;
    
//     // Status and error handling
//     const [error, setError] = useState<ApiError | null>(null) ;
//     const [isLoading, setIsLoading] = useState(false) ;

//     // Tracking completion status of steps
//     const [completedSteps, setCompletedSteps] = useState<StepStatus>({
//         cake: false,
//         decoration: false,
//         message: false,
//         extras: false
//     }) ;

//     // Current active step
//     const [currentStep, setCurrentStep] = useState<'cake' | 'decoration' | 'message' | 'extras'>('cake') ;

//     // Load data when the component mounts
//     useEffect(() => {
//         Promise.all([
//             fetchDecorationOptions(),
//             fetchPartOptions(),
//             fetchMessageOptions(),
//             fetchExtraOptions()
//         ]).catch(error => {
//             console.error('Error initializing cake customizer:', error) ;
//             toast.error('Failed to load cake options. Please try again.') ;
//         }) ;
//     }, [storeId]) ;

//     // Update the initial state to load existing item if editing
//     useEffect(() => {
//         if (editId) {
//             const itemToEdit = items.find(item => item.id === editId) ;
//             if (itemToEdit) {
//                 setConfig(itemToEdit.config) ;
//             }
//         }
//     }, [editId, items, setConfig]) ;

//     // Reset the cake configuration to defaults
//     const handleResetConfig = () => {
//         const defaultConfig: CakeConfig = {
//             size: '',
//             price: 0,
//             sponge: '',
//             outerIcing: '',
//             filling: '',
//             icing: '',
//             topping: null,
//             message: '',
//             candles: null,
//             board: '', 
//             goo: null,
//             extras: [],
//             messageType: 'none',
//             plaqueColor: 'white',
//             uploadedImage: null,
//             imageUrl: null,
//             pipingColor: 'white'
//         } ;
//         setConfig(defaultConfig) ;
//         setCompletedSteps({
//             cake: false,
//             decoration: false,
//             message: false,
//             extras: false
//         }) ;
//         setCurrentStep('cake') ;
//         setSelectedPart(null) ;
//     } ;

//     // API fetch functions
//     const fetchDecorationOptions = async () => {
//         try {
//             setIsLoading(true) ;
//             setError(null) ;
//             const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/decoration_options?bakeryId=${storeId}`) ;
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`) ;
//             }
//             const data: ApiResponse<ApiOptionGroup> = await response.json() ;
//             if (data.errors && data.errors.length > 0) {
//                 throw new Error(data.errors[0].message) ;
//             }
//             setDecorationOptions(data.payload) ;
//             return data.payload ;
//         } catch (error) {
//             console.error('Error fetching decoration options:', error) ;
//             setError({
//                 code: 'FETCH_ERROR',
//                 message: error instanceof Error ? error.message : 'Failed to fetch decoration options'
//             }) ;
//             return [] ;
//         } finally {
//             setIsLoading(false) ;
//         }
//     } ;

//     const fetchPartOptions = async () => {
//         try {
//             setIsLoading(true) ;
//             setError(null) ;
//             const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/part_options?bakeryId=${storeId}`) ;
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`) ;
//             }
//             const data: ApiResponse<ApiOptionGroup> = await response.json() ;
//             if (data.errors && data.errors.length > 0) {
//                 throw new Error(data.errors[0].message) ;
//             }
//             setPartOptions(data.payload) ;

//             // Set default size if not already set
//             if (!config.size && data.payload.length > 0) {
//                 const sizeGroup = data.payload.find(group => group.type === 'Size') ;
//                 if (sizeGroup && sizeGroup.items.length > 0) {
//                     const defaultSize = sizeGroup.items[0] ;
//                     setConfig(prev => ({
//                         ...prev,
//                         size: defaultSize.name,
//                         price: defaultSize.price
//                     })) ;
//                 }
//             }
//             return data.payload ;
//         } catch (error) {
//             console.error('Error fetching part options:', error) ;
//             setError({
//                 code: 'FETCH_ERROR',
//                 message: error instanceof Error ? error.message : 'Failed to fetch part options'
//             }) ;
//             return [] ;
//         } finally {
//             setIsLoading(false) ;
//         }
//     } ;

//     const fetchMessageOptions = async () => {
//         try {
//             setIsLoading(true) ;
//             setError(null) ;
//             const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/message_options?bakeryId=${storeId}`) ;
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`) ;
//             }
//             const data: ApiResponse<ApiOptionGroup> = await response.json() ;
//             if (data.errors && data.errors.length > 0) {
//                 throw new Error(data.errors[0].message) ;
//             }
//             setMessageOptions(data.payload) ;
//             return data.payload ;
//         } catch (error) {
//             console.error('Error fetching message options:', error) ;
//             setError({
//                 code: 'FETCH_ERROR',
//                 message: error instanceof Error ? error.message : 'Failed to fetch message options'
//             }) ;
//             return [] ;
//         } finally {
//             setIsLoading(false) ;
//         }
//     } ;

//     const fetchExtraOptions = async () => {
//         try {
//             setIsLoading(true) ;
//             setError(null) ;
//             const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/extra_options?bakeryId=${storeId}`) ;
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`) ;
//             }
//             const data: ApiResponse<ApiOptionGroup> = await response.json() ;
//             if (data.errors && data.errors.length > 0) {
//                 throw new Error(data.errors[0].message) ;
//             }
//             setExtraOptions(data.payload) ;
//             return data.payload ;
//         } catch (error) {
//             console.error('Error fetching extra options:', error) ;
//             setError({
//                 code: 'FETCH_ERROR',
//                 message: error instanceof Error ? error.message : 'Failed to fetch extra options'
//             }) ;
//             return [] ;
//         } finally {
//             setIsLoading(false) ;
//         }
//     } ;

//     // Handle part selection
//     const handlePartSelect = (part: SelectedPart) => {
//         setError(null) ;

//         // Determine which steps are available based on completion status
//         const canSelectCake = true ; // Always available
//         const canSelectDecoration = completedSteps.cake ;
//         const canSelectMessage = completedSteps.decoration ;
//         const canSelectExtras = completedSteps.message ;

//         // Only allow selecting steps that are available
//         if (part === 'cake') {
//             setSelectedPart(part) ;
//             if (partOptions.length === 0) {
//                 fetchPartOptions() ;
//             }
//         } else if (part === 'decoration' && canSelectDecoration) {
//             setSelectedPart(part) ;
//             if (decorationOptions.length === 0) {
//                 fetchDecorationOptions() ;
//             }
//         } else if (part === 'message' && canSelectMessage) {
//             setSelectedPart(part) ;
//             if (messageOptions.length === 0) {
//                 fetchMessageOptions() ;
//             }
//         } else if (part === 'extras' && canSelectExtras) {
//             setSelectedPart(part) ;
//             if (extraOptions.length === 0) {
//                 fetchExtraOptions() ;
//             }
//         } else if (part !== null) {
//             // Show error message if trying to select a locked step
//             toast.error('Please complete the previous steps first') ;
//         }

//         // Update current step based on selection
//         if (part === 'cake' && !completedSteps.cake) {
//             setCurrentStep('cake') ;
//         } else if (part === 'decoration' && !completedSteps.decoration) {
//             setCurrentStep('decoration') ;
//         } else if (part === 'message' && !completedSteps.message) {
//             setCurrentStep('message') ;
//         } else if (part === 'extras' && !completedSteps.extras) {
//             setCurrentStep('extras') ;
//         }
//     } ;

//     // Handle option selection for size
//     const handleSizeSelect = (option: ApiItem) => {
//         // Find current size option to calculate price difference
//         const currentSizeId = config.size ;
//         const currentSize = partOptions.find(group => group.type === 'Size')?.items
//             .find(item => item.name === currentSizeId) ;
        
//         // Calculate price difference and update config
//         const currentPrice = currentSize?.price || 0 ;
//         const priceDifference = option.price - currentPrice ;
        
//         setConfig(prev => ({
//             ...prev,
//             size: option.name,
//             price: prev.price + priceDifference
//         })) ;
//     } ;

//     // Handle option selection for sponge
//     const handleSpongeSelect = (option: ApiItem) => {
//         // Find current sponge to calculate price difference
//         const currentSpongeId = config.sponge ;
//         const currentSponge = partOptions.find(group => group.type === 'Sponge')?.items
//             .find(item => item.id === currentSpongeId) ;
        
//         // Calculate price difference
//         const currentPrice = currentSponge?.price || 0 ;
//         const priceDifference = option.price - currentPrice ;
        
//         setConfig(prev => ({
//             ...prev,
//             sponge: option.id,
//             price: prev.price + priceDifference
//         })) ;
//     } ;

//     // Handle option selection for filling
//     const handleFillingSelect = (option: ApiItem) => {
//         // Find current filling to calculate price difference
//         const currentFillingId = config.filling ;
//         const currentFilling = partOptions.find(group => group.type === 'Filling')?.items
//             .find(item => item.id === currentFillingId) ;
        
//         // Calculate price difference
//         const currentPrice = currentFilling?.price || 0 ;
//         const priceDifference = option.price - currentPrice ;
        
//         setConfig(prev => ({
//             ...prev,
//             filling: option.id,
//             price: prev.price + priceDifference
//         })) ;
//     } ;

//     // Handle option selection for icing
//     const handleIcingSelect = (option: ApiItem) => {
//         // Find current icing to calculate price difference
//         const currentIcingId = config.icing ;
//         const currentIcing = partOptions.find(group => group.type === 'Icing')?.items
//             .find(item => item.id === currentIcingId) ;
        
//         // Calculate price difference
//         const currentPrice = currentIcing?.price || 0 ;
//         const priceDifference = option.price - currentPrice ;
        
//         setConfig(prev => ({
//             ...prev,
//             icing: option.id,
//             price: prev.price + priceDifference
//         })) ;
//     } ;

//     // Handle option selection for outer icing (decoration)
//     const handleDecorationSelect = (option: ApiItem) => {
//         // Find current outer icing to calculate price difference
//         const currentIcingId = config.outerIcing ;
//         const currentIcing = decorationOptions.flatMap(group => group.items)
//             .find(item => item.id === currentIcingId) ;
        
//         // Calculate price difference
//         const currentPrice = currentIcing?.price || 0 ;
//         const priceDifference = option.price - currentPrice ;
        
//         setConfig(prev => ({
//             ...prev,
//             outerIcing: option.id,
//             price: prev.price + priceDifference
//         })) ;
//     } ;

//     // Handle option selection for goo
//     const handleGooSelect = (option: ApiItem) => {
//         // Find current goo to calculate price difference
//         const currentGooId = config.goo ;
//         const currentGoo = partOptions.find(group => group.type === 'Goo')?.items
//             .find(item => item.id === currentGooId) ;
        
//         // Calculate price difference
//         const currentPrice = currentGoo?.price || 0 ;
//         const priceDifference = option.price - currentPrice ;
        
//         setConfig(prev => ({
//             ...prev,
//             goo: option.id,
//             price: prev.price + priceDifference
//         })) ;
//     } ;

//     // Handle option selection for message type
//     const handleMessageTypeSelect = (messageType: 'none' | 'piped' | 'edible') => {
//         // Find current message type to calculate price difference
//         const currentMessageType = config.messageType ;
//         const currentMessageOption = messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item => 
//             (currentMessageType === 'none' && item.name === 'NONE') ||
//             (currentMessageType === 'piped' && item.name === 'PIPED MESSAGE') ||
//             (currentMessageType === 'edible' && item.name === 'EDIBLE IMAGE')
//         ) ;
        
//         // Find new message type to calculate price
//         const newMessageOption = messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item => 
//             (messageType === 'none' && item.name === 'NONE') ||
//             (messageType === 'piped' && item.name === 'PIPED MESSAGE') ||
//             (messageType === 'edible' && item.name === 'EDIBLE IMAGE')
//         ) ;
        
//         // Calculate price difference
//         const currentPrice = currentMessageOption?.price || 0 ;
//         const newPrice = newMessageOption?.price || 0 ;
//         const priceDifference = newPrice - currentPrice ;
        
//         setConfig(prev => ({
//             ...prev,
//             messageType,
//             // Reset related fields when changing message type
//             message: messageType === 'none' ? '' : prev.message,
//             uploadedImage: messageType === 'edible' ? prev.uploadedImage : null,
//             price: prev.price + priceDifference
//         })) ;
//     } ;

//     // Handle message text change
//     const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setConfig(prev => ({
//             ...prev,
//             message: e.target.value.slice(0, 30)
//         })) ;
//     } ;

//     // Handle plaque color selection for piped message
//     const handlePlaqueColorSelect = (option: ApiItem) => {
//         setConfig(prev => ({
//             ...prev,
//             plaqueColor: option.id
//         })) ;
//     } ;

//     // Handle piping color selection for piped message
//     const handlePipingColorSelect = (option: ApiItem) => {
//         setConfig(prev => ({
//             ...prev,
//             pipingColor: option.id
//         })) ;
//     } ;

//     // Handle image upload for edible image
//     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0] ;
//         if (file) {
//             const reader = new FileReader() ;
//             reader.onload = (e) => {
//                 setConfig(prev => ({
//                     ...prev,
//                     uploadedImage: e.target?.result as string
//                 })) ;
//             } ;
//             reader.readAsDataURL(file) ;
//         }
//     } ;

//     // Handle removing uploaded image
//     const handleImageRemove = () => {
//         setConfig(prev => ({
//             ...prev,
//             uploadedImage: null
//         })) ;
//     } ;

//     // Handle selecting extras (candles, board, etc.)
//     const handleExtraSelect = (option: ApiItem) => {
//         const extras = Array.isArray(config.extras) ? [...config.extras] : [] ;
//         const isAlreadySelected = extras.includes(option.id) ;
        
//         // Check if there's an existing option of same type to replace
//         const existingOptionOfSameType = extras.find(id => {
//             const existingOption = extraOptions.flatMap(group => group.items)
//                 .find(item => item.id === id) ;
//             return existingOption?.type === option.type && id !== option.id ;
//         }) ;
        
//         let priceDifference = 0 ;
        
//         if (isAlreadySelected) {
//             // Remove if already selected
//             const newExtras = extras.filter(id => id !== option.id) ;
//             priceDifference = -option.price ;
            
//             setConfig(prev => ({
//                 ...prev,
//                 extras: newExtras,
//                 price: prev.price + priceDifference,
//                 // If removing a board or candles, update those fields too
//                 ...(option.type === 'CakeBoard' ? { board: '' } : {}),
//                 ...(option.type === 'Candles' ? { candles: null } : {})
//             })) ;
//         } else {
//             // If replacing an existing option of same type
//             let newExtras = [...extras] ;
            
//             if (existingOptionOfSameType) {
//                 const existingOption = extraOptions.flatMap(group => group.items)
//                     .find(item => item.id === existingOptionOfSameType) ;
                
//                 // Remove existing and its price
//                 newExtras = newExtras.filter(id => id !== existingOptionOfSameType) ;
//                 priceDifference = option.price - (existingOption?.price || 0) ;
//             } else {
//                 // Just add the new option's price
//                 priceDifference = option.price ;
//             }
            
//             // Add the new option
//             newExtras.push(option.id) ;
            
//             setConfig(prev => ({
//                 ...prev,
//                 extras: newExtras,
//                 price: prev.price + priceDifference,
//                 // Update board or candles field if applicable
//                 ...(option.type === 'CakeBoard' ? { board: option.id } : {}),
//                 ...(option.type === 'Candles' ? { candles: option.id } : {})
//             })) ;
//         }
//     } ;

//     // Complete the current step and move to the next
//     const handleStepComplete = () => {
//         // Validation checks for each step
//         if (currentStep === 'cake') {
//             if (!config.size || !config.sponge || !config.filling || !config.icing) {
//                 toast.error('Please select size, sponge, filling, and icing options') ;
//                 return ;
//             }
//             setCompletedSteps(prev => ({ ...prev, cake: true })) ;
//             setCurrentStep('decoration') ;
//             setSelectedPart('decoration') ;
//         } 
//         else if (currentStep === 'decoration') {
//             if (!config.outerIcing) {
//                 toast.error('Please select a decoration option') ;
//                 return ;
//             }
//             setCompletedSteps(prev => ({ ...prev, decoration: true })) ;
//             setCurrentStep('message') ;
//             setSelectedPart('message') ;
//         }
//         else if (currentStep === 'message') {
//             // Message step is optional, always allow completion
//             setCompletedSteps(prev => ({ ...prev, message: true })) ;
//             setCurrentStep('extras') ;
//             setSelectedPart('extras') ;
//         }
//         else if (currentStep === 'extras') {
//             // Extras are optional, always allow completion
//             setCompletedSteps(prev => ({ ...prev, extras: true })) ;
//             setSelectedPart(null) ;
//             toast.success('Cake customization complete! You can now add it to cart.') ;
//         }
//     } ;

//     // Save the current design to localStorage
//     const handleSaveDesign = () => {
//         try {
//             localStorage.setItem('cakeConfig', JSON.stringify(config)) ;
//             toast.success('Design saved successfully!') ;
//         } catch (error) {
//             console.error('Error saving design:', error) ;
//             toast.error('Failed to save design') ;
//         }
//     } ;

//     // Add the customized cake to cart
//     const handleOrderCake = async () => {
//         try {
//             console.log('Order button clicked') ;
//             console.log('Current cake config:', config) ;

//             // Get the access token from localStorage
//             const accessToken = localStorage.getItem('accessToken') ;
//             if (!accessToken) {
//                 toast.error('You need to be logged in to add items to cart') ;
//                 return ;
//             }

//             // Capture the cake preview as an image
//             let cakeImageUrl = null ;
//             if (cakePreviewRef.current) {
//                 try {
//                     // Show loading toast
//                     const loadingToast = toast.loading('Generating cake image...') ;

//                     // Capture the cake preview
//                     const canvas = await html2canvas(cakePreviewRef.current, {
//                         backgroundColor: null,
//                         scale: 2, // Higher quality
//                         logging: false,
//                         useCORS: true,
//                         allowTaint: true
//                     }) ;

//                     // Convert canvas to data URL
//                     cakeImageUrl = canvas.toDataURL('image/png') ;

//                     // Update loading toast
//                     toast.dismiss(loadingToast) ;
//                     toast.success('Cake image generated successfully!') ;
//                 } catch (error) {
//                     console.error('Error capturing cake image:', error) ;
//                     toast.error('Failed to generate cake image. Using default image instead.') ;
//                 }
//             }

//             // Get message options from API response
//             const messageTypeGroup = messageOptions.find(group => group.type === 'MESSAGE_TYPE') ;
//             const plaqueColorGroup = messageOptions.find(group => group.type === 'PLAQUE_COLOUR') ;
//             const pipingColorGroup = messageOptions.find(group => group.type === 'PIPING_COLOUR') ;

//             // Get the selected message type option
//             const selectedMessageType = messageTypeGroup?.items.find(item =>
//                 (config.messageType === 'none' && item.name === 'NONE') ||
//                 (config.messageType === 'piped' && item.name === 'PIPED MESSAGE') ||
//                 (config.messageType === 'edible' && item.name === 'EDIBLE IMAGE')
//             ) ;

//             // Get the selected plaque color option
//             const selectedPlaqueColor = plaqueColorGroup?.items.find(item =>
//                 item.name.toLowerCase().includes(config.plaqueColor.toLowerCase())
//             ) ;

//             // Get the selected piping color option
//             const selectedPipingColor = pipingColorGroup?.items.find(item =>
//                 item.name.toLowerCase().includes(config.pipingColor.toLowerCase())
//             ) ;

//             // Collect all selected message option IDs
//             const messageOptionIds = [
//                 selectedMessageType?.id,
//                 config.messageType === 'piped' ? selectedPlaqueColor?.id : null,
//                 config.messageType === 'piped' ? selectedPipingColor?.id : null
//             ].filter(Boolean) as string[] ;

//             console.log('Selected message option IDs:', messageOptionIds) ;

//             // Ensure we have valid GUID IDs for all selections
//             const defaultGuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6' ;
            
//             // Helper to ensure we have valid GUIDs
//             const getValidGuid = (id: string | undefined): string => {
//                 if (!id) return defaultGuid ;
//                 // Simple validation - GUIDs should be in format like '00000000-0000-0000-0000-000000000000'
//                 const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i ;
//                 return guidPattern.test(id) ? id : defaultGuid ;
//             } ;

//             // Get selected options for description
//             const selectedSize = config.size ;
//             const selectedSponge = getSelectedOption('Sponge', config.sponge) ;
//             const selectedFilling = getSelectedOption('Filling', config.filling) ;
//             const selectedIcing = getSelectedOption('Icing', config.icing) ;
//             const selectedOuterIcing = getSelectedOption('OuterIcing', config.outerIcing) ;
//             const selectedGoo = getSelectedOption('Goo', config.goo) ;

//             // Prepare the API request body
//             const requestBody = {
//                 cake_name: `Custom ${selectedSize} Cake`,
//                 cake_description: `Delicious ${selectedSize} cake with ${selectedSponge?.name || 'Unknown'} sponge, filled with ${selectedFilling?.name || 'Unknown'}, iced with ${selectedIcing?.name || 'Unknown'}, and covered in ${selectedOuterIcing?.name || 'Unknown'} icing${config.goo ? `, topped with ${selectedGoo?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
//                 bakery_id: storeId,
//                 model: "CustomCake", // Add required model field
//                 price: config.price, // Add explicit price field to ensure consistency
//                 message_selection: {
//                     text: config.message,
//                     message_type: config.messageType === 'edible' ? 'IMAGE' : config.messageType === 'piped' ? 'TEXT' : 'NONE',
//                     image_id: config.uploadedImage ? defaultGuid : null,
//                     cake_message_option_ids: messageOptionIds.map(getValidGuid)
//                 },
//                 part_selections: [
//                     {
//                         part_type: "SIZE",
//                         part_option_id: getValidGuid(partOptions.find(group => group.type === 'Size')?.items.find(item => item.name === config.size)?.id)
//                     },
//                     {
//                         part_type: "SPONGE",
//                         part_option_id: getValidGuid(partOptions.find(group => group.type === 'Sponge')?.items.find(item => item.id === config.sponge)?.id)
//                     },
//                     {
//                         part_type: "FILLING",
//                         part_option_id: getValidGuid(partOptions.find(group => group.type === 'Filling')?.items.find(item => item.id === config.filling)?.id)
//                     },
//                     {
//                         part_type: "ICING",
//                         part_option_id: getValidGuid(partOptions.find(group => group.type === 'Icing')?.items.find(item => item.id === config.icing)?.id)
//                     },
//                     // Add GOO part type if selected
//                     ...(config.goo ? [{
//                         part_type: "GOO",
//                         part_option_id: getValidGuid(partOptions.find(group => group.type === 'Goo')?.items.find(item => item.id === config.goo)?.id)
//                     }] : [])
//                 ],
//                 decoration_selections: [
//                     {
//                         decoration_type: "OUTER_ICING",
//                         decoration_option_id: getValidGuid(decorationOptions.find(group => group.items.some(item => item.id === config.outerIcing))?.items.find(item => item.id === config.outerIcing)?.id)
//                     }
//                 ],
//                 extra_selections: Array.isArray(config.extras) ? config.extras.filter(id => {
//                     // Only include extras that actually exist in the extraOptions array
//                     const option = extraOptions.flatMap(group => group.items).find(item => item.id === id) ;
//                     return !!option ; // Only keep extras that exist
//                 }).map(id => {
//                     const option = extraOptions.flatMap(group => group.items).find(item => item.id === id) ;
//                     return {
//                         extra_type: option?.type || "UNKNOWN",
//                         extra_option_id: getValidGuid(option?.id)
//                     } ;
//                 }) : []
//             } ;
//             console.log('Prepared request body:', requestBody) ;

//             // Call the API to create the custom cake
//             console.log('Making API request to create custom cake...') ;
//             const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/custom_cakes', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${accessToken}`
//                 },
//                 body: JSON.stringify(requestBody)
//             }) ;

//             const responseText = await response.text() ;
//             console.log('API raw response:', responseText) ;
            
//             let data ;
//             try {
//                 data = JSON.parse(responseText) ;
//                 console.log('Parsed API response:', data) ;
//             } catch (parseError) {
//                 console.error('Error parsing API response:', parseError) ;
//                 toast.error(`Server responded with invalid JSON. Check console for details.`) ;
//                 return ;
//             }

//             if (!response.ok) {
//                 console.error('API request failed:', response.status, response.statusText) ;
//                 const errorMessage = data?.errors && Array.isArray(data.errors) && data.errors.length > 0 
//                     ? `Error: ${data.errors.join(', ')}` 
//                     : 'Failed to create custom cake' ;
//                 toast.error(errorMessage) ;
//                 return ;
//             }

//             // Continue with the rest of the code
//             console.log('API response:', data) ;

//             // Prepare the cart data according to the API requirements
//             const cartData = {
//                 bakeryId: storeId,
//                 order_note: "",
//                 phone_number: "",
//                 shipping_address: "",
//                 latitude: "",
//                 longitude: "",
//                 pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
//                 shipping_type: "DELIVERY",
//                 payment_type: "CASH",
//                 voucher_code: "",
//                 cartItems: [
//                     {
//                         cake_name: `Custom ${selectedSize} Cake`,
//                         main_image_id: data.payload.image_id || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//                         main_image: data.payload.image || {
//                             id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//                             created_at: new Date().toISOString(),
//                             created_by: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//                             updated_at: new Date().toISOString(),
//                             updated_by: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//                             is_deleted: false,
//                             file_name: "custom-cake.jpg",
//                             file_url: cakeImageUrl || "/imagecake.jpg"
//                         },
//                         quantity: 1,
//                         cake_note: `Delicious ${selectedSize} cake with ${selectedSponge?.name || 'Unknown'} sponge, filled with ${selectedFilling?.name || 'Unknown'}, iced with ${selectedIcing?.name || 'Unknown'}, and covered in ${selectedOuterIcing?.name || 'Unknown'} icing${config.goo ? `, topped with ${selectedGoo?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
//                         sub_total_price: config.price,
//                         total_price: config.price, // Add total_price field for consistency
//                         available_cake_id: null,
//                         custom_cake_id: data.payload.id,
//                         bakery_id: storeId
//                     }
//                 ]
//             } ;

//             console.log('Adding to cart with data:', cartData) ;

//             // Make the API call to add to cart
//             const cartResponse = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/carts', {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${accessToken}`
//                 },
//                 body: JSON.stringify(cartData)
//             }) ;

//             if (!cartResponse.ok) {
//                 const errorData = await cartResponse.json() ;
//                 console.error('Error adding to cart:', errorData) ;
//                 throw new Error('Failed to add item to cart') ;
//             }

//             const cartResult = await cartResponse.json() ;
//             console.log('Cart API response:', cartResult) ;

//             // Also add to local cart state for UI updates
//             const cartItem = {
//                 id: data.payload.id,
//                 quantity: 1,
//                 price: config.price,
//                 storeId: storeId,
//                 config: {
//                     ...config,
//                     name: `Custom ${selectedSize} Cake`,
//                     description: `Delicious ${selectedSize} cake with ${selectedSponge?.name || 'Unknown'} sponge, filled with ${selectedFilling?.name || 'Unknown'}, iced with ${selectedIcing?.name || 'Unknown'}, and covered in ${selectedOuterIcing?.name || 'Unknown'} icing${config.goo ? `, topped with ${selectedGoo?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
//                     type: 'custom',
//                     extras: Array.isArray(config.extras) ? config.extras : [],
//                     imageUrl: cakeImageUrl // Add the captured image URL
//                 }
//             } ;

//             addToCart(cartItem) ;
//             toast.success('Cake added to cart successfully!') ;
//             console.log('Order process completed successfully') ;
//             router.push('/cart') ;
//         } catch (error) {
//             console.error('Error in handleOrderCake:', error) ;
//             toast.error('Failed to order cake. Please try again.') ;
//         }
//     } ;

//     // Helper function to get a selected option
//     const getSelectedOption = (type: string, id: string | null): ApiItem | undefined => {
//         if (!id) return undefined ;
        
//         if (type === 'Sponge' || type === 'Filling' || type === 'Size' || type === 'Goo' || type === 'Icing') {
//             return partOptions.find(group => group.type === type)?.items
//                 .find(item => item.id === id) ;
//         }
        
//         if (type === 'OuterIcing') {
//             return decorationOptions.flatMap(group => group.items)
//                 .find(item => item.id === id) ;
//         }
        
//         if (type === 'Candles' || type === 'CakeBoard') {
//             return extraOptions.find(group => group.type === type)?.items
//                 .find(item => item.id === id) ;
//         }
        
//         return undefined ;
//     } ;

//     // Format color from API to Tailwind class
//     const convertColorToTailwind = (color: string): string => {
//         if (!color) return 'bg-gray-200' ;
        
//         // Remove any 'bg-' prefix if exists
//         const normalizedColor = color.toLowerCase().trim().replace('bg-', '') ;
        
//         // Map API color names to Tailwind classes
//         const colorMap: Record<string, string> = {
//             'white': 'bg-white',
//             'black': 'bg-black',
//             'gray': 'bg-gray-500',
//             'red': 'bg-red-500',
//             'orange': 'bg-orange-500',
//             'yellow': 'bg-yellow-500',
//             'green': 'bg-green-500',
//             'blue': 'bg-blue-500',
//             'indigo': 'bg-indigo-500',
//             'purple': 'bg-purple-500',
//             'pink': 'bg-pink-500',
//             'brown': 'bg-amber-800'
//         } ;
        
//         return colorMap[normalizedColor] || `bg-${normalizedColor}-500` ;
//     } ;

//     // Render the cake visualization based on selected options
//     const renderCake = () => {
//         // Get selected options
//         const selectedSize = config.size ;
//         const selectedSponge = getSelectedOption('Sponge', config.sponge) ;
//         const selectedFilling = getSelectedOption('Filling', config.filling) ;
//         const selectedIcing = getSelectedOption('Icing', config.icing) ;
//         const selectedOuterIcing = getSelectedOption('OuterIcing', config.outerIcing) ;
//         const selectedGoo = getSelectedOption('Goo', config.goo) ;
//         const selectedCandles = getSelectedOption('Candles', config.candles) ;
//         const selectedBoard = getSelectedOption('CakeBoard', config.board) ;
        
//         // Get colors for visualization
//         const spongeColor = selectedSponge ? convertColorToTailwind(selectedSponge.color) : 'bg-amber-50' ;
//         const fillingColor = selectedFilling ? convertColorToTailwind(selectedFilling.color) : 'bg-white' ;
//         const icingColor = selectedIcing ? convertColorToTailwind(selectedIcing.color) : 'bg-pink-200' ;
//         const gooColor = selectedGoo ? convertColorToTailwind(selectedGoo.color) : null ;
        
//         // Handle special preview for message section
//         if (selectedPart === 'message') {
//             const messageColor = config.messageType === 'piped'
//                 ? convertColorToTailwind(config.plaqueColor)
//                 : 'bg-white' ;
            
//             const textColor = config.messageType === 'piped'
//                 ? convertColorToTailwind(config.pipingColor)
//                 : 'text-pink-600' ;
            
//             return (
//                 <div className="relative w-full aspect-square flex items-center justify-center">
//                     <div className="relative w-[80%] aspect-square rounded-full">
//                         <div className={`absolute inset-0 rounded-full ${icingColor} shadow-lg`}>
//                             <div className={`absolute inset-[15%] rounded-full flex items-center justify-center ${messageColor}`}>
//                                 {config.messageType === 'edible' && config.uploadedImage ? (
//                                     <Image
//                                         src={config.uploadedImage}
//                                         alt="Uploaded design"
//                                         className="w-full h-full object-contain rounded-full"
//                                         width={200}
//                                         height={200}
//                                     />
//                                 ) : (
//                                     <div className={`text-center ${textColor} italic p-8`}>
//                                         {config.message || "Thông điệp của bạn..."}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                     <div className="absolute bottom-4 right-4 text-2xl font-bold">
//                         {selectedSize}
//                     </div>
//                     {renderCakeControls()}
//                 </div>
//             ) ;
//         }
        
//         return (
//             <div className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}>
//                 <div className="relative flex justify-center items-center">
//                     <div className="relative w-full max-w-md aspect-square">
//                         {/* Cake Board */}
//                         {selectedBoard && (
//                             <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-[140%]">
//                                 <div className="relative">
//                                     {/* Main board with gradient */}
//                                     <div
//                                         className={`h-4 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-2xl' : 'rounded-full'} 
//                                             bg-gradient-to-b from-white to-gray-50 transition-all duration-300`}
//                                         style={{
//                                             boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
//                                         }}
//                                     >
//                                         {/* Add subtle sheen effect */}
//                                         <div className={`absolute inset-0 ${selectedBoard.name.toLowerCase().includes('square') ? 'rounded-2xl' : 'rounded-full'}
//                                             bg-gradient-to-r from-white/40 via-transparent to-white/40 transition-all duration-300`} />
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Cake base */}
//                         <div className="absolute bottom-6 w-full h-3/4 flex">
//                             {/* Left side (sponge layers) */}
//                             <div className={`w-1/2 h-full flex flex-col`}>
//                                 {Array(5).fill(0).map((_, i) => (
//                                     <React.Fragment key={i}>
//                                         <div className={`flex-1 ${spongeColor}`} />
//                                         {gooColor && <div className={`h-1 ${gooColor}`} />}
//                                     </React.Fragment>
//                                 ))}
//                             </div>

//                             {/* Right side (icing) */}
//                             <div className={`w-1/2 h-full ${icingColor}`}>
//                                 {/* Add decorative icing details */}
//                                 <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/20 to-transparent" />
//                             </div>

//                             {/* Filling preview */}
//                             <div className={`absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-2 ${fillingColor}`} />
//                         </div>

//                         {/* Candles */}
//                         {selectedCandles && (
//                             <div className="absolute w-full flex justify-center -top-4">
//                                 {Array(6).fill(0).map((_, i) => (
//                                     <motion.div
//                                         key={i}
//                                         initial={{ y: 20, opacity: 0 }}
//                                         animate={{ y: 0, opacity: 1 }}
//                                         transition={{ delay: i * 0.1 }}
//                                         className="mx-3 flex flex-col items-center"
//                                     >
//                                         {/* Flame with animation */}
//                                         <motion.div
//                                             animate={{
//                                                 scale: [1, 1.2, 1],
//                                                 rotate: [-5, 5, -5],
//                                                 opacity: [0.8, 1, 0.8],
//                                             }}
//                                             transition={{
//                                                 duration: 2,
//                                                 repeat: Infinity,
//                                                 repeatType: "reverse"
//                                             }}
//                                             className="relative w-3 h-4"
//                                         >
//                                             <div className="absolute inset-0 bg-amber-400 rounded-full blur-sm opacity-50" />
//                                             <div className="absolute inset-0 bg-amber-300 rounded-full" />
//                                         </motion.div>

//                                         {/* Candle body */}
//                                         <motion.div
//                                             className={`w-2 h-16 rounded-full shadow-lg transform -translate-y-1 
//                                                 bg-gradient-to-b ${convertColorToTailwind(selectedCandles.color)}`}
//                                             whileHover={{ scale: 1.1 }}
//                                         />
//                                     </motion.div>
//                                 ))}
//                             </div>
//                         )}

//                         {/* Message */}
//                         {(config.message || config.messageType !== 'none') && (
//                             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                                 <div className={`w-32 h-32 rounded-full flex justify-center items-center text-sm p-4 text-center shadow-sm
//                                     ${config.messageType === 'piped'
//                                         ? `${convertColorToTailwind(config.plaqueColor)} text-${convertColorToTailwind(config.pipingColor).replace('bg-', '')}`
//                                         : 'bg-white/90 text-pink-400'}`}
//                                 >
//                                     {config.messageType === 'edible' && config.uploadedImage ? (
//                                         <Image
//                                             src={config.uploadedImage}
//                                             alt="Uploaded design"
//                                             width={120}
//                                             height={120}
//                                             className="rounded-full object-cover"
//                                         />
//                                     ) : (
//                                         config.message || "Thông điệp..."
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Size indicator */}
//                         <div className="absolute bottom-4 right-4 text-2xl font-bold">
//                             {selectedSize}
//                         </div>

//                         {renderCakeControls()}
//                     </div>
//                 </div>
//             </div>
//         ) ;
//     } ;

//     // Render cake control buttons
//     const renderCakeControls = () => {
//         return (
//             <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6"
//             >
//                 <motion.button
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     onClick={() => setIsZoomed(!isZoomed)}
//                     className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white/95 transition-all"
//                 >
//                     <svg
//                         className="w-6 h-6"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                     >
//                         {isZoomed ? (
//                             <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" />
//                         ) : (
//                             <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
//                         )}
//                     </svg>
//                 </motion.button>

//                 <motion.button
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     onClick={handleSaveDesign}
//                     className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white/95 transition-all"
//                 >
//                     <svg
//                         className="w-6 h-6"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                     >
//                         <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
//                         <path d="M17 21v-8H7v8M7 3v5h8" />
//                     </svg>
//                 </motion.button>
//             </motion.div>
//         ) ;
//     } ;

//     // Render the appropriate customization panel based on selected part
//     const renderCustomizationPanel = () => {
//         if (!selectedPart) return null ;

//         if (error) {
//             return (
//                 <div className="flex flex-col items-center justify-center h-64 space-y-4">
//                     <div className="text-red-500 text-xl">⚠️</div>
//                     <p className="text-red-500 text-center">{error.message}</p>
//                     <Button
//                         onClick={() => {
//                             setError(null) ;
//                             handlePartSelect(selectedPart) ;
//                         }}
//                         variant="outline"
//                     >
//                         Thử lại
//                     </Button>
//                 </div>
//             ) ;
//         }

//         if (isLoading) {
//             return (
//                 <div className="flex flex-col items-center justify-center h-64 space-y-4">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
//                     <p className="text-gray-500">Đang tải tùy chọn...</p>
//                 </div>
//             ) ;
//         }

//         const renderCompleteButton = () => (
//             <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleStepComplete}
//                 className="mt-8 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 text-lg font-bold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//             >
//                 HOÀN THÀNH BƯỚC NÀY
//             </motion.button>
//         ) ;

//         switch (selectedPart) {
//             case 'cake':
//                 return (
//                     <div className="space-y-6">
//                         {/* Size options */}
//                         <div className="mb-8">
//                             <h3 className="font-bold mb-4 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//                                 KÍCH THƯỚC
//                             </h3>
//                             <div className="grid grid-cols-1 gap-4">
//                                 {partOptions.find(group => group.type === 'Size')?.items.map((option) => (
//                                     <motion.button
//                                         key={option.id}
//                                         variants={selectedVariants}
//                                         animate={config.size === option.name ? "selected" : "unselected"}
//                                         whileHover={{ scale: 1.02 }}
//                                         whileTap={{ scale: 0.98 }}
//                                         onClick={() => handleSizeSelect(option)}
//                                         className={`relative flex p-4 rounded-xl border-2 
//                                             ${config.size === option.name
//                                                 ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                 : 'border-gray-200 hover:border-pink-300'} 
//                                             transition-all duration-300 transform`}
//                                     >
//                                         <div className="flex-1">
//                                             <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//                                                 {option.name}
//                                             </div>
//                                             <div className="text-sm text-gray-600 mt-2">{option.description}</div>
//                                             <div className="text-pink-600 font-bold mt-2 text-lg">
//                                                 {option.price.toLocaleString()} VND
//                                             </div>
//                                         </div>
//                                         {config.size === option.name && (
//                                             <motion.div
//                                                 initial={{ scale: 0 }}
//                                                 animate={{ scale: 1 }}
//                                                 className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                             >
//                                                 <Check className="w-4 h-4" />
//                                             </motion.div>
//                                         )}
//                                     </motion.button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Sponge options */}
//                         <div className="mb-8">
//                             <h3 className="font-bold mb-4 text-2xl text-pink-500">
//                                 BÁNH BỘT
//                             </h3>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 {partOptions.find(group => group.type === 'Sponge')?.items.map((option) => (
//                                     <motion.button
//                                         key={option.id}
//                                         variants={selectedVariants}
//                                         animate={config.sponge === option.id ? "selected" : "unselected"}
//                                         whileHover={{ scale: 1.02 }}
//                                         whileTap={{ scale: 0.98 }}
//                                         onClick={() => handleSpongeSelect(option)}
//                                         className={`relative flex flex-col p-4 rounded-xl border-2
//                                             ${config.sponge === option.id
//                                                 ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                 : 'border-gray-200 hover:border-pink-300'}
//                                             transition-all duration-300`}
//                                     >
//                                         <div className="w-full mb-3">
//                                             {option.image ? (
//                                                 <Image
//                                                     src={option.image.file_url}
//                                                     alt={option.name}
//                                                     width={200}
//                                                     height={200}
//                                                     className="rounded-lg object-cover w-full h-32"
//                                                 />
//                                             ) : (
//                                                 <div
//                                                     className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
//                                                 />
//                                             )}
//                                         </div>
//                                         <div className="text-left w-full">
//                                             <div className="font-medium text-gray-900">{option.name}</div>
//                                             <div className="text-sm text-gray-600 mt-1">{option.description}</div>
//                                             <div className="text-pink-500 font-bold mt-2">
//                                                 {option.price.toLocaleString()} VND
//                                             </div>
//                                         </div>
//                                         {config.sponge === option.id && (
//                                             <motion.div
//                                                 initial={{ scale: 0 }}
//                                                 animate={{ scale: 1 }}
//                                                 className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                             >
//                                                 <Check className="w-4 h-4" />
//                                             </motion.div>
//                                         )}
//                                     </motion.button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Filling options */}
//                         <div className="mb-8">
//                             <h3 className="font-bold mb-4 text-2xl text-pink-500">
//                                 NHÂN BÁNH
//                             </h3>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 {partOptions.find(group => group.type === 'Filling')?.items.map((option) => (
//                                     <motion.button
//                                         key={option.id}
//                                         variants={selectedVariants}
//                                         animate={config.filling === option.id ? "selected" : "unselected"}
//                                         whileHover={{ scale: 1.02 }}
//                                         whileTap={{ scale: 0.98 }}
//                                         onClick={() => handleFillingSelect(option)}
//                                         className={`relative flex flex-col p-4 rounded-xl border-2
//                                             ${config.filling === option.id
//                                                 ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                 : 'border-gray-200 hover:border-pink-300'}
//                                             transition-all duration-300`}
//                                     >
//                                         <div className="w-full mb-3">
//                                             {option.image ? (
//                                                 <Image
//                                                     src={option.image.file_url}
//                                                     alt={option.name}
//                                                     width={200}
//                                                     height={200}
//                                                     className="rounded-lg object-cover w-full h-32"
//                                                 />
//                                             ) : (
//                                                 <div
//                                                     className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
//                                                 />
//                                             )}
//                                         </div>
//                                         <div className="text-left w-full">
//                                             <div className="font-medium text-gray-900">{option.name}</div>
//                                             <div className="text-sm text-gray-600 mt-1">{option.description}</div>
//                                             <div className="text-pink-500 font-bold mt-2">
//                                                 {option.price.toLocaleString()} VND
//                                             </div>
//                                         </div>
//                                         {config.filling === option.id && (
//                                             <motion.div
//                                                 initial={{ scale: 0 }}
//                                                 animate={{ scale: 1 }}
//                                                 className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                             >
//                                                 <Check className="w-4 h-4" />
//                                             </motion.div>
//                                         )}
//                                     </motion.button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Icing options */}
//                         <div className="mb-8">
//                             <h3 className="font-bold mb-4 text-2xl text-pink-500">
//                                 KEM BÁNH
//                             </h3>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 {partOptions.find(group => group.type === 'Icing')?.items.map((option) => (
//                                     <motion.button
//                                         key={option.id}
//                                         variants={selectedVariants}
//                                         animate={config.icing === option.id ? "selected" : "unselected"}
//                                         whileHover={{ scale: 1.02 }}
//                                         whileTap={{ scale: 0.98 }}
//                                         onClick={() => handleIcingSelect(option)}
//                                         className={`relative flex flex-col p-4 rounded-xl border-2
//                                             ${config.icing === option.id
//                                                 ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                 : 'border-gray-200 hover:border-pink-300'}
//                                             transition-all duration-300`}
//                                     >
//                                         <div className="w-full mb-3">
//                                             {option.image ? (
//                                                 <Image
//                                                     src={option.image.file_url}
//                                                     alt={option.name}
//                                                     width={200}
//                                                     height={200}
//                                                     className="rounded-lg object-cover w-full h-32"
//                                                 />
//                                             ) : (
//                                                 <div
//                                                     className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
//                                                 />
//                                             )}
//                                         </div>
//                                         <div className="text-left w-full">
//                                             <div className="font-medium text-gray-900">{option.name}</div>
//                                             <div className="text-sm text-gray-600 mt-1">{option.description}</div>
//                                             <div className="text-pink-500 font-bold mt-2">
//                                                 {option.price.toLocaleString()} VND
//                                             </div>
//                                         </div>
//                                         {config.icing === option.id && (
//                                             <motion.div
//                                                 initial={{ scale: 0 }}
//                                                 animate={{ scale: 1 }}
//                                                 className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                             >
//                                                 <Check className="w-4 h-4" />
//                                             </motion.div>
//                                         )}
//                                     </motion.button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Goo options */}
//                         <div className="mb-8">
//                             <h3 className="font-bold mb-4 text-2xl text-pink-500">
//                                 NƯỚC SỐT
//                             </h3>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 {partOptions.find(group => group.type === 'Goo')?.items.map((option) => (
//                                     <motion.button
//                                         key={option.id}
//                                         variants={selectedVariants}
//                                         animate={config.goo === option.id ? "selected" : "unselected"}
//                                         whileHover={{ scale: 1.02 }}
//                                         whileTap={{ scale: 0.98 }}
//                                         onClick={() => handleGooSelect(option)}
//                                         className={`relative flex flex-col p-4 rounded-xl border-2
//                                             ${config.goo === option.id
//                                                 ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                 : 'border-gray-200 hover:border-pink-300'}
//                                             transition-all duration-300`}
//                                     >
//                                         <div className="w-full mb-3">
//                                             {option.image ? (
//                                                 <Image
//                                                     src={option.image.file_url}
//                                                     alt={option.name}
//                                                     width={200}
//                                                     height={200}
//                                                     className="rounded-lg object-cover w-full h-32"
//                                                 />
//                                             ) : (
//                                                 <div
//                                                     className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
//                                                 />
//                                             )}
//                                         </div>
//                                         <div className="text-left w-full">
//                                             <div className="font-medium text-gray-900">{option.name}</div>
//                                             <div className="text-sm text-gray-600 mt-1">{option.description}</div>
//                                             <div className="text-pink-500 font-bold mt-2">
//                                                 {option.price.toLocaleString()} VND
//                                             </div>
//                                         </div>
//                                         {config.goo === option.id && (
//                                             <motion.div
//                                                 initial={{ scale: 0 }}
//                                                 animate={{ scale: 1 }}
//                                                 className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                             >
//                                                 <Check className="w-4 h-4" />
//                                             </motion.div>
//                                         )}
//                                     </motion.button>
//                                 ))}
//                             </div>
//                         </div>
//                         {renderCompleteButton()}
//                     </div>
//                 ) ;

//             case 'decoration':
//                 return (
//                     <div className="space-y-6">
//                         <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//                             TRANG TRÍ
//                         </h3>
                        
//                         {decorationOptions.map(group => (
//                             <div key={group.type} className="mb-8">
//                                 <h4 className="font-semibold text-xl text-gray-800 mb-4 capitalize">
//                                     {group.type === 'OuterIcing' ? 'LỚP KEM BÊN NGOÀI' : 
//                                      group.type === 'Drip' ? 'KEM CHẢY' :
//                                      group.type === 'Sprinkles' ? 'SPRINKLES' :
//                                      group.type === 'Bling' ? 'TRANG TRÍ ÁNH KIM' :
//                                      group.type === 'TallSkirt' ? 'BÌA CAO' :
//                                      group.type === 'ShortSkirt' ? 'BÌA THẤP' : group.type}
//                                 </h4>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                     {group.items.map(option => (
//                                         <motion.button
//                                             key={option.id}
//                                             variants={selectedVariants}
//                                             animate={config.outerIcing === option.id ? "selected" : "unselected"}
//                                             whileHover={{ scale: 1.02 }}
//                                             whileTap={{ scale: 0.98 }}
//                                             onClick={() => handleDecorationSelect(option)}
//                                             className={`relative flex flex-col p-4 rounded-xl border-2
//                                                 ${config.outerIcing === option.id
//                                                     ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                     : 'border-gray-200 hover:border-pink-300'}
//                                                 transition-all duration-300`}
//                                         >
//                                             <div className="w-full mb-3">
//                                                 {option.image ? (
//                                                     <Image
//                                                         src={option.image.file_url}
//                                                         alt={option.name}
//                                                         width={200}
//                                                         height={200}
//                                                         className="rounded-lg object-cover w-full h-32"
//                                                     />
//                                                 ) : (
//                                                     <div
//                                                         className={`w-full h-32 rounded-lg shadow-md transition-transform duration-300 ${convertColorToTailwind(option.color)}`}
//                                                     >
//                                                         <div className="absolute inset-0 flex items-center justify-center">
//                                                             <span className="text-4xl opacity-50">
//                                                                 {group.type === 'Drip' ? '💧' :
//                                                                  group.type === 'Sprinkles' ? '✨' :
//                                                                  group.type === 'TallSkirt' ? '👗' :
//                                                                  group.type === 'Bling' ? '💎' : '🎨'}
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div className="text-left w-full">
//                                                 <div className="font-medium text-gray-900">{option.name}</div>
//                                                 <div className="text-sm text-gray-600 mt-1">{option.description}</div>
//                                                 <div className="text-pink-500 font-bold mt-2">
//                                                     {option.price.toLocaleString()} VND
//                                                 </div>
//                                             </div>
//                                             {config.outerIcing === option.id && (
//                                                 <motion.div
//                                                     initial={{ scale: 0 }}
//                                                     animate={{ scale: 1 }}
//                                                     className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                                 >
//                                                     <Check className="w-4 h-4" />
//                                                 </motion.div>
//                                             )}
//                                         </motion.button>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))}
                        
//                         <div className="mt-6 text-center text-sm text-gray-500">
//                             Chọn kiểu trang trí cho bánh của bạn
//                         </div>
//                         {renderCompleteButton()}
//                     </div>
//                 ) ;

//             case 'message':
//                 // Define message type options
//                 const messageTypeOptions = [
//                     { id: 'none', name: 'KHÔNG', icon: '✖️' },
//                     { id: 'piped', name: 'CHỮ VIẾT TAY', icon: '✍️' },
//                     { id: 'edible', name: 'HÌNH ẢNH ĂN ĐƯỢC', icon: '🖼️' }
//                 ] ;

//                 return (
//                     <div className="space-y-6">
//                         <h3 className="font-bold mb-4 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//                             THÔNG ĐIỆP
//                         </h3>

//                         {/* Message Type Selection */}
//                         <div className="grid grid-cols-3 gap-4 mb-6">
//                             {messageTypeOptions.map(option => (
//                                 <motion.button
//                                     key={option.id}
//                                     variants={selectedVariants}
//                                     animate={config.messageType === option.id ? "selected" : "unselected"}
//                                     whileHover={{ scale: 1.02 }}
//                                     whileTap={{ scale: 0.98 }}
//                                     onClick={() => handleMessageTypeSelect(option.id as 'none' | 'piped' | 'edible')}
//                                     className={`relative flex flex-col items-center p-4 rounded-xl border-2
//                                         ${config.messageType === option.id
//                                             ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                             : 'border-gray-200 hover:border-pink-300'}
//                                         transition-all duration-300`}
//                                 >
//                                     <div className="text-3xl mb-2">{option.icon}</div>
//                                     <div className="text-sm font-medium text-center">{option.name}</div>
//                                     {config.messageType === option.id && (
//                                         <motion.div
//                                             initial={{ scale: 0 }}
//                                             animate={{ scale: 1 }}
//                                             className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                         >
//                                             <Check className="w-4 h-4" />
//                                         </motion.div>
//                                     )}
//                                 </motion.button>
//                             ))}
//                         </div>

//                         {/* Message Content Options */}
//                         {config.messageType !== 'none' && (
//                             <motion.div
//                                 initial={{ opacity: 0, y: 20 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 className="space-y-4"
//                             >
//                                 {config.messageType === 'edible' ? (
//                                     <div className="space-y-4">
//                                         <div className="flex flex-col items-center space-y-2">
//                                             <label className="text-sm font-medium text-gray-700">
//                                                 Tải lên hình ảnh của bạn
//                                             </label>
//                                             <input
//                                                 type="file"
//                                                 accept="image/*"
//                                                 onChange={handleImageUpload}
//                                                 className="hidden"
//                                                 id="design-upload"
//                                             />
//                                             <label
//                                                 htmlFor="design-upload"
//                                                 className="cursor-pointer p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 transition-colors w-full"
//                                             >
//                                                 {config.uploadedImage ? (
//                                                     <div className="relative w-full aspect-square">
//                                                         <Image
//                                                             src={config.uploadedImage}
//                                                             alt="Uploaded design"
//                                                             fill
//                                                             className="object-contain rounded-lg"
//                                                         />
//                                                         <button
//                                                             onClick={(e) => {
//                                                                 e.preventDefault() ;
//                                                                 handleImageRemove() ;
//                                                             }}
//                                                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
//                                                         >
//                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                             </svg>
//                                                         </button>
//                                                     </div>
//                                                 ) : (
//                                                     <div className="text-center py-8">
//                                                         <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                                         </svg>
//                                                         <p className="mt-2 text-sm text-gray-600">Nhấn để tải lên thiết kế của bạn</p>
//                                                     </div>
//                                                 )}
//                                             </label>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Thông điệp của bạn (tối đa 30 ký tự)
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={config.message}
//                                                 onChange={handleMessageChange}
//                                                 maxLength={30}
//                                                 className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
//                                                 placeholder="Nhập thông điệp của bạn..."
//                                             />
//                                         </div>

//                                         {/* Plaque Color Selection */}
//                                         {messageOptions.find(group => group.type === 'PLAQUE_COLOUR') && (
//                                             <div className="space-y-2">
//                                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                     Màu nền
//                                                 </label>
//                                                 <div className="grid grid-cols-2 gap-3">
//                                                     {messageOptions.find(group => group.type === 'PLAQUE_COLOUR')?.items.map(option => (
//                                                         <motion.button
//                                                             key={option.id}
//                                                             variants={selectedVariants}
//                                                             animate={config.plaqueColor === option.id ? "selected" : "unselected"}
//                                                             whileHover={{ scale: 1.02 }}
//                                                             whileTap={{ scale: 0.98 }}
//                                                             onClick={() => handlePlaqueColorSelect(option)}
//                                                             className={`relative flex items-center space-x-3 p-3 rounded-xl border-2
//                                                                 ${config.plaqueColor === option.id
//                                                                     ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                                     : 'border-gray-200 hover:border-pink-300'}
//                                                                 transition-all duration-300`}
//                                                         >
//                                                             <div className={`w-8 h-8 rounded-lg ${convertColorToTailwind(option.color)}`} />
//                                                             <span className="text-sm">{option.name}</span>
//                                                             {config.plaqueColor === option.id && (
//                                                                 <motion.div
//                                                                     initial={{ scale: 0 }}
//                                                                     animate={{ scale: 1 }}
//                                                                     className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                                                 >
//                                                                     <Check className="w-4 h-4" />
//                                                                 </motion.div>
//                                                             )}
//                                                         </motion.button>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         )}

//                                         {/* Piping Color Selection */}
//                                         {messageOptions.find(group => group.type === 'PIPING_COLOUR') && (
//                                             <div className="space-y-2">
//                                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                     Màu chữ
//                                                 </label>
//                                                 <div className="grid grid-cols-2 gap-3">
//                                                     {messageOptions.find(group => group.type === 'PIPING_COLOUR')?.items.map(option => (
//                                                         <motion.button
//                                                             key={option.id}
//                                                             variants={selectedVariants}
//                                                             animate={config.pipingColor === option.id ? "selected" : "unselected"}
//                                                             whileHover={{ scale: 1.02 }}
//                                                             whileTap={{ scale: 0.98 }}
//                                                             onClick={() => handlePipingColorSelect(option)}
//                                                             className={`relative flex items-center space-x-3 p-3 rounded-xl border-2
//                                                                 ${config.pipingColor === option.id
//                                                                     ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                                     : 'border-gray-200 hover:border-pink-300'}
//                                                                 transition-all duration-300`}
//                                                         >
//                                                             <div className={`w-8 h-8 rounded-lg ${convertColorToTailwind(option.color)}`} />
//                                                             <span className="text-sm">{option.name}</span>
//                                                             {config.pipingColor === option.id && (
//                                                                 <motion.div
//                                                                     initial={{ scale: 0 }}
//                                                                     animate={{ scale: 1 }}
//                                                                     className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1"
//                                                                 >
//                                                                     <Check className="w-4 h-4" />
//                                                                 </motion.div>
//                                                             )}
//                                                         </motion.button>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 )}
//                             </motion.div>
//                         )}
//                         {renderCompleteButton()}
//                     </div>
//                 ) ;

//             case 'extras':
//                 return (
//                     <div>
//                         <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//                             THÊM PHẦN
//                         </h3>
//                         <div className="space-y-8">
//                             {/* Group extras by type */}
//                             {extraOptions.map(group => (
//                                 <div key={group.type} className="space-y-4">
//                                     <h4 className="font-semibold text-xl text-gray-800 pl-2 border-l-4 border-pink-500">
//                                         {group.type === 'Candles' ? 'NẾN TRANG TRÍ 🕯️' :
//                                          group.type === 'CakeBoard' ? 'ĐẾ BÁNH 🎂' :
//                                          group.type === 'Topper' ? 'TOPPER 🧁' : group.type}
//                                     </h4>
//                                     <div className="grid grid-cols-1 gap-4">
//                                         {group.items.map(option => (
//                                             <motion.button
//                                                 key={option.id}
//                                                 variants={selectedVariants}
//                                                 animate={
//                                                     (group.type === 'Candles' && config.candles === option.id) ||
//                                                     (group.type === 'CakeBoard' && config.board === option.id) ||
//                                                     (Array.isArray(config.extras) && config.extras.includes(option.id))
//                                                         ? "selected" : "unselected"
//                                                 }
//                                                 whileHover={{ scale: 1.02 }}
//                                                 whileTap={{ scale: 0.98 }}
//                                                 onClick={() => handleExtraSelect(option)}
//                                                 className={`relative flex items-center p-6 rounded-xl border-2 w-full
//                                                     ${
//                                                         (group.type === 'Candles' && config.candles === option.id) ||
//                                                         (group.type === 'CakeBoard' && config.board === option.id) ||
//                                                         (Array.isArray(config.extras) && config.extras.includes(option.id))
//                                                             ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
//                                                             : 'border-gray-200 hover:border-pink-300'
//                                                     }
//                                                     transition-all duration-300`}
//                                             >
//                                                 <div className="flex-1 flex items-center gap-6">
//                                                     <div className={`relative w-24 h-24 rounded-lg overflow-hidden 
//                                                         ${option.image
//                                                             ? ''
//                                                             : `${convertColorToTailwind(option.color)}`}`
//                                                     }>
//                                                         {option.image ? (
//                                                             <Image
//                                                                 src={option.image.file_url}
//                                                                 alt={option.name}
//                                                                 fill
//                                                                 className="object-cover"
//                                                             />
//                                                         ) : (
//                                                             <div className="w-full h-full flex items-center justify-center text-4xl">
//                                                                 {group.type === 'Candles' ? '🕯️' :
//                                                                  group.type === 'CakeBoard' ? '🎂' :
//                                                                  group.type === 'Topper' ? '🧁' : '🍰'}
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                     <div className="flex-1">
//                                                         <div className="font-bold text-lg text-gray-900">{option.name}</div>
//                                                         <div className="text-sm text-gray-600 mt-1">
//                                                             {option.description}
//                                                         </div>
//                                                         <div className="text-pink-600 font-bold mt-2 text-xl">
//                                                             {option.price.toLocaleString()} VND
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 {((group.type === 'Candles' && config.candles === option.id) ||
//                                                   (group.type === 'CakeBoard' && config.board === option.id) ||
//                                                   (Array.isArray(config.extras) && config.extras.includes(option.id))) && (
//                                                     <motion.div
//                                                         initial={{ scale: 0 }}
//                                                         animate={{ scale: 1 }}
//                                                         className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-2"
//                                                     >
//                                                         <Check className="w-5 h-5" />
//                                                     </motion.div>
//                                                 )}
//                                             </motion.button>
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="mt-6 text-center text-sm text-gray-500">
//                             Chọn thêm trang trí hoặc phụ kiện để hoàn thiện bánh của bạn
//                         </div>
//                         {renderCompleteButton()}
//                     </div>
//                 ) ;

//             default:
//                 return null ;
//         }
//     } ;

//     return (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
//         >
//             {/* Add global styles */}
//             <style jsx global>{`
//                 .custom-scrollbar {
//                     scrollbar-width: thin ;
//                     scrollbar-color: rgba(236, 72, 153, 0.3) transparent ;
//                 }

//                 .custom-scrollbar::-webkit-scrollbar {
//                     width: 6px ;
//                 }

//                 .custom-scrollbar::-webkit-scrollbar-track {
//                     background: transparent ;
//                 }

//                 .custom-scrollbar::-webkit-scrollbar-thumb {
//                     background-color: rgba(236, 72, 153, 0.3) ;
//                     border-radius: 3px ;
//                 }

//                 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//                     background-color: rgba(236, 72, 153, 0.5) ;
//                 }

//                 @keyframes float {
//                     0% { transform: translateY(0px) ; }
//                     50% { transform: translateY(-10px) ; }
//                     100% { transform: translateY(0px) ; }
//                 }

//                 .float-animation {
//                     animation: float 3s ease-in-out infinite ;
//                 }
//             `}</style>
            
//             <motion.div
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.2 }}
//                 className="flex flex-col md:flex-row w-full max-w-7xl mx-auto gap-8 p-6"
//             >
//                 {/* Left side - Cake Preview */}
//                 <motion.div
//                     layout
//                     className="flex-1 sticky top-6 h-fit"
//                 >
//                     <motion.div
//                         whileHover={{ scale: 1.02 }}
//                         transition={{ type: "spring", stiffness: 300 }}
//                         className="relative aspect-square w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100"
//                     >
//                         <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-purple-100/20 rounded-3xl" />
//                         <AnimatePresence mode="wait">
//                             <motion.div
//                                 key={selectedPart || 'default'}
//                                 initial={{ opacity: 0, scale: 0.8 }}
//                                 animate={{ opacity: 1, scale: 1 }}
//                                 exit={{ opacity: 0, scale: 0.8 }}
//                                 transition={{ duration: 0.3 }}
//                                 ref={cakePreviewRef}
//                             >
//                                 {/* Cake visualization goes here */}
//                                 {renderCake()}
//                             </motion.div>
//                         </AnimatePresence>
//                     </motion.div>
//                 </motion.div>

//                 {/* Right side - Configuration Panel */}
//                 <motion.div
//                     initial={{ x: 20, opacity: 0 }}
//                     animate={{ x: 0, opacity: 1 }}
//                     transition={{ delay: 0.3 }}
//                     className="w-full md:w-[400px]"
//                 >
//                     <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-100">
//                         <motion.div
//                             whileHover={{ scale: 1.02 }}
//                             className="p-8 border-b border-pink-100"
//                         >
//                             <div className="flex justify-between items-center">
//                                 <motion.h1
//                                     initial={{ y: -20 }}
//                                     animate={{ y: 0 }}
//                                     className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
//                                 >
//                                     BÁNH CUSTOM
//                                 </motion.h1>
//                                 <motion.button
//                                     whileHover={{ scale: 1.1 }}
//                                     whileTap={{ scale: 0.9 }}
//                                     onClick={handleResetConfig}
//                                     className="p-2 rounded-full hover:bg-pink-50 transition-all"
//                                     title="Reset Design"
//                                 >
//                                     <svg
//                                         className="w-5 h-5 text-pink-600"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={2}
//                                             d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                                         />
//                                     </svg>
//                                 </motion.button>
//                             </div>
//                             <motion.div
//                                 initial={{ scale: 0 }}
//                                 animate={{ scale: 1 }}
//                                 className="text-3xl font-bold text-pink-600 mt-2 flex items-center"
//                             >
//                                 {config.price.toLocaleString()} VND
//                                 <motion.button 
//                                     whileHover={{ scale: 1.05 }}
//                                     whileTap={{ scale: 0.95 }}
//                                     className="ml-2 text-sm bg-pink-100 hover:bg-pink-200 text-pink-700 px-2 py-1 rounded-full transition-colors"
//                                     onClick={() => setShowJson(!showJson)}
//                                 >
//                                     {showJson ? 'Ẩn chi tiết' : 'Xem chi tiết'}
//                                 </motion.button>
//                             </motion.div>
                            
//                             {/* Price summary section */}
//                             <AnimatePresence>
//                                 {showJson && (
//                                     <motion.div
//                                         initial={{ height: 0, opacity: 0 }}
//                                         animate={{ height: 'auto', opacity: 1 }}
//                                         exit={{ height: 0, opacity: 0 }}
//                                         className="overflow-hidden"
//                                     >
//                                         <div className="mt-4 bg-pink-50 rounded-lg p-4 text-sm">
//                                             <h3 className="font-bold text-pink-700 mb-2">Chi tiết giá:</h3>
//                                             <ul className="space-y-1">
//                                                 {/* Price details will be rendered here */}
//                                                 {/* We'll implement this in the next edits */}
//                                             </ul>
//                                         </div>
//                                     </motion.div>
//                                 )}
//                             </AnimatePresence>
//                         </motion.div>

//                         <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
//                             <div className="p-6">
//                                 <AnimatePresence mode="wait">
//                                     {!selectedPart ? (
//                                         <motion.div
//                                             initial={{ opacity: 0, y: 20 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             exit={{ opacity: 0, y: -20 }}
//                                             className="space-y-4"
//                                         >
//                                             <MenuItem
//                                                 icon="🍰"
//                                                 title="BÁNH"
//                                                 subtitle={config.size || "Chọn kích thước và hương vị"}
//                                                 onClick={() => handlePartSelect('cake')}
//                                                 gradient="from-pink-500 to-rose-500"
//                                                 disabled={false}
//                                                 completed={completedSteps.cake}
//                                             />
//                                             <MenuItem
//                                                 icon="🧁"
//                                                 title="TRANG TRÍ"
//                                                 subtitle={getSelectedOption('OuterIcing', config.outerIcing)?.name || "Chọn kiểu trang trí"}
//                                                 onClick={() => handlePartSelect('decoration')}
//                                                 gradient="from-purple-500 to-indigo-500"
//                                                 disabled={!completedSteps.cake}
//                                                 completed={completedSteps.decoration}
//                                             />
//                                             <MenuItem
//                                                 icon="✍️"
//                                                 title="THÔNG ĐIỆP"
//                                                 subtitle={config.message || (config.messageType === 'none' ? "Không có thông điệp" : "Thêm thông điệp")}
//                                                 onClick={() => handlePartSelect('message')}
//                                                 gradient="from-blue-500 to-cyan-500"
//                                                 disabled={!completedSteps.decoration}
//                                                 completed={completedSteps.message}
//                                             />
//                                             <MenuItem
//                                                 icon="🍪"
//                                                 title="THÊM PHẦN"
//                                                 subtitle={Array.isArray(config.extras) && config.extras.length > 0
//                                                     ? `Đã thêm ${config.extras.length} phần phụ`
//                                                     : "Thêm topping đặc biệt"}
//                                                 onClick={() => handlePartSelect('extras')}
//                                                 gradient="from-yellow-500 to-orange-500"
//                                                 disabled={!completedSteps.message}
//                                                 completed={completedSteps.extras}
//                                             />
//                                         </motion.div>
//                                     ) : (
//                                         <motion.div
//                                             initial={{ opacity: 0, x: 20 }}
//                                             animate={{ opacity: 1, x: 0 }}
//                                             exit={{ opacity: 0, x: -20 }}
//                                         >
//                                             <div className="flex items-center gap-2 mb-6">
//                                                 <motion.button
//                                                     whileHover={{ scale: 1.1 }}
//                                                     whileTap={{ scale: 0.9 }}
//                                                     onClick={() => setSelectedPart(null)}
//                                                     className="p-2 hover:bg-pink-50 rounded-full transition-colors"
//                                                 >
//                                                     <ArrowLeft className="w-6 h-6 text-pink-600" />
//                                                 </motion.button>
//                                                 <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//                                                     {selectedPart === 'cake' ? 'BÁNH' : 
//                                                      selectedPart === 'decoration' ? 'TRANG TRÍ' :
//                                                      selectedPart === 'message' ? 'THÔNG ĐIỆP' : 'THÊM PHẦN'}
//                                                 </h2>
//                                             </div>
//                                             {renderCustomizationPanel()}
//                                         </motion.div>
//                                     )}
//                                 </AnimatePresence>
//                             </div>
//                         </div>

//                         <motion.div
//                             whileHover={{ scale: 1.02 }}
//                             className="p-6 border-t border-pink-100 flex gap-4"
//                         >
//                             <motion.button
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                                 onClick={handleSaveDesign}
//                                 className="flex-1 bg-white border-2 border-pink-600 text-pink-600 py-4 text-lg font-bold rounded-xl hover:bg-pink-50 transition-all shadow-lg hover:shadow-xl"
//                             >
//                                 LƯU THIẾT KẾ
//                             </motion.button>
//                             <motion.button
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                                 onClick={handleOrderCake}
//                                 disabled={!completedSteps.cake || !completedSteps.decoration || !completedSteps.message || !completedSteps.extras}
//                                 className={`flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl
//                                     ${(!completedSteps.cake || !completedSteps.decoration || !completedSteps.message || !completedSteps.extras)
//                                         ? 'opacity-50 cursor-not-allowed from-gray-400 to-gray-500 hover:from-gray-400 hover:to-gray-500'
//                                         : 'hover:from-pink-700 hover:to-purple-700'}`}
//                             >
//                                 THÊM VÀO GIỎ HÀNG
//                             </motion.button>
//                         </motion.div>
//                     </div>
//                 </motion.div>
//             </motion.div>
//         </motion.div>
//     ) ;
// } ;

// // MenuItem component for the main menu
// const MenuItem = ({
//     icon,
//     title,
//     subtitle,
//     onClick,
//     gradient,
//     disabled,
//     completed
// }: {
//     icon: string ;
//     title: string ;
//     subtitle: string ;
//     onClick: () => void ;
//     gradient: string ;
//     disabled: boolean ;
//     completed: boolean ;
// }) => {
//     return (
//         <motion.button
//             whileHover={{ scale: 1.02, backgroundColor: 'rgb(249, 250, 251)' }}
//             whileTap={{ scale: 0.98 }}
//             onClick={onClick}
//             className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border border-pink-100
//                 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
//                 ${completed ? 'bg-green-50' : ''}`}
//         >
//             <motion.span
//                 whileHover={{ rotate: [0, -10, 10, -10, 0] }}
//                 transition={{ duration: 0.5 }}
//                 className="text-3xl"
//             >
//                 {icon}
//             </motion.span>
//             <div className="flex-1 text-left">
//                 <motion.div
//                     className={`font-bold text-lg bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
//                 >
//                     {title}
//                 </motion.div>
//                 <motion.div
//                     initial={{ opacity: 0.5 }}
//                     animate={{ opacity: 1 }}
//                     className="text-sm text-gray-600"
//                 >
//                     {subtitle}
//                 </motion.div>
//             </div>
//             {completed ? (
//                 <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
//                 >
//                     ✓
//                 </motion.div>
//             ) : (
//                 <motion.svg
//                     whileHover={{ x: 5 }}
//                     className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-pink-400'}`}
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                 >
//                     <path d="M9 18l6-6-6-6" />
//                 </motion.svg>
//             )}
//         </motion.button>
//     ) ;
// } ;

// export default CakeCustomizer ; 
"use client" ;

import { Button } from '@/components/ui/button' ;
import { useCart } from '@/app/store/useCart' ;
import { CakeConfig } from '@/types/cake' ;
import { AnimatePresence, motion } from 'framer-motion' ;
import { ArrowLeft, Check, Download } from 'lucide-react' ;
import { useRouter, useSearchParams } from 'next/navigation' ;
import Image from 'next/image' ;
import React, { useEffect, useState, useRef } from 'react' ;
import { useCakeConfigStore } from '@/components/shared/client/stores/cake-config' ;
import { toast } from 'react-hot-toast' ;
import html2canvas from 'html2canvas' ;

// API response types
interface ApiError {
    code: string ;
    message: string ;
    details?: any ;
}

interface ApiResponse<T> {
    status_code: number ;
    errors: ApiError[] ;
    meta_data: {
        total_items_count: number ;
        page_size: number ;
        total_pages_count: number ;
        page_index: number ;
        has_next: boolean ;
        has_previous: boolean ;
    } ;
    payload: T[] ;
}

interface ApiImage {
    file_name: string ;
    file_url: string ;
    id: string ;
    created_at: string ;
    created_by: string ;
    updated_at: string | null ;
    updated_by: string | null ;
    is_deleted: boolean ;
}

interface ApiItem {
    id: string ;
    name: string ;
    price: number ;
    color: string ;
    is_default: boolean ;
    description: string ;
    image_id: string | null ;
    image: ApiImage | null ;
    type: string ;
    bakery_id: string ;
    bakery: null ;
    created_at: string ;
    created_by: string ;
    updated_at: string | null ;
    updated_by: string | null ;
    is_deleted: boolean ;
}

interface ApiOptionGroup {
    type: string ;
    items: ApiItem[] ;
}

// Define type for the selected part
type SelectedPart = 'cake' | 'decoration' | 'message' | 'extras' | null ;

// Type for step status tracking
type StepStatus = {
    cake: boolean ;
    decoration: boolean ;
    message: boolean ;
    extras: boolean ;
} ;

// Type for board shape
type BoardShape = 'round' | 'square' ;

// Get initial cake configuration
const getInitialCakeConfig = (): CakeConfig => {
    if (typeof window === 'undefined') {
        // Return default config when running on server
        return {
            size: '',
            price: 0,
            sponge: '',
            outerIcing: '',
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
        } ;
    }

    // Try to get saved config from localStorage
    const savedConfig = localStorage.getItem('cakeConfig') ;
    if (savedConfig) {
        try {
            return JSON.parse(savedConfig) ;
        } catch (error) {
            console.error('Error parsing saved cake config:', error) ;
        }
    }

    // Return default config if no saved config exists
    return {
        size: '',
        price: 0,
        sponge: '',
        outerIcing: '',
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
    } ;
} ;

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
} ;

const CakeCustomizer = ({ storeId }: { storeId: string }) => {
    const { addToCart, items } = useCart() ;
    const router = useRouter() ;
    const searchParams = useSearchParams() ;
    const editId = searchParams.get('editId') ;
    const { config, setConfig } = useCakeConfigStore() ;
    const cakePreviewRef = useRef<HTMLDivElement>(null) ;

    // UI state
    const [selectedPart, setSelectedPart] = useState<SelectedPart>(null) ;
    const [showJson, setShowJson] = useState(false) ;
    const [isZoomed, setIsZoomed] = useState(false) ;

    // API data state
    const [decorationOptions, setDecorationOptions] = useState<ApiOptionGroup[]>([]) ;
    const [partOptions, setPartOptions] = useState<ApiOptionGroup[]>([]) ;
    const [messageOptions, setMessageOptions] = useState<ApiOptionGroup[]>([]) ;
    const [extraOptions, setExtraOptions] = useState<ApiOptionGroup[]>([]) ;
    
    // Status and error handling
    const [error, setError] = useState<ApiError | null>(null) ;
    const [isLoading, setIsLoading] = useState(false) ;

    // Tracking completion status of steps
    const [completedSteps, setCompletedSteps] = useState<StepStatus>({
        cake: false,
        decoration: false,
        message: false,
        extras: false
    }) ;

    // Current active step
    const [currentStep, setCurrentStep] = useState<'cake' | 'decoration' | 'message' | 'extras'>('cake') ;

    // Load data when the component mounts
    useEffect(() => {
        Promise.all([
            fetchDecorationOptions(),
            fetchPartOptions(),
            fetchMessageOptions(),
            fetchExtraOptions()
        ]).catch(error => {
            console.error('Error initializing cake customizer:', error) ;
            toast.error('Failed to load cake options. Please try again.') ;
        }) ;
    }, [storeId]) ;

    // Update the initial state to load existing item if editing
    useEffect(() => {
        if (editId) {
            const itemToEdit = items.find(item => item.id === editId) ;
            if (itemToEdit) {
                setConfig(itemToEdit.config) ;
            }
        }
    }, [editId, items, setConfig]) ;

    // Reset the cake configuration to defaults
    const handleResetConfig = () => {
        const defaultConfig: CakeConfig = {
            size: '',
            price: 0,
            sponge: '',
            outerIcing: '',
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
        } ;
        setConfig(defaultConfig) ;
        setCompletedSteps({
            cake: false,
            decoration: false,
            message: false,
            extras: false
        }) ;
        setCurrentStep('cake') ;
        setSelectedPart(null) ;
    } ;

    // API fetch functions
    const fetchDecorationOptions = async () => {
        try {
            setIsLoading(true) ;
            setError(null) ;
            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/decoration_options?bakeryId=${storeId}`) ;
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`) ;
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json() ;
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message) ;
            }
            setDecorationOptions(data.payload) ;
            return data.payload ;
        } catch (error) {
            console.error('Error fetching decoration options:', error) ;
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch decoration options'
            }) ;
            return [] ;
        } finally {
            setIsLoading(false) ;
        }
    } ;

    const fetchPartOptions = async () => {
        try {
            setIsLoading(true) ;
            setError(null) ;
            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/part_options?bakeryId=${storeId}`) ;
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`) ;
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json() ;
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message) ;
            }
            setPartOptions(data.payload) ;

            // Set default size if not already set
            if (!config.size && data.payload.length > 0) {
                const sizeGroup = data.payload.find(group => group.type === 'Size') ;
                if (sizeGroup && sizeGroup.items.length > 0) {
                    const defaultSize = sizeGroup.items[0] ;
                    setConfig(prev => ({
                        ...prev,
                        size: defaultSize.name,
                        price: defaultSize.price
                    })) ;
                }
            }
            return data.payload ;
        } catch (error) {
            console.error('Error fetching part options:', error) ;
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch part options'
            }) ;
            return [] ;
        } finally {
            setIsLoading(false) ;
        }
    } ;

    const fetchMessageOptions = async () => {
        try {
            setIsLoading(true) ;
            setError(null) ;
            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/message_options?bakeryId=${storeId}`) ;
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`) ;
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json() ;
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message) ;
            }
            setMessageOptions(data.payload) ;
            return data.payload ;
        } catch (error) {
            console.error('Error fetching message options:', error) ;
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch message options'
            }) ;
            return [] ;
        } finally {
            setIsLoading(false) ;
        }
    } ;

    const fetchExtraOptions = async () => {
        try {
            setIsLoading(true) ;
            setError(null) ;
            const response = await fetch(`https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/extra_options?bakeryId=${storeId}`) ;
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`) ;
            }
            const data: ApiResponse<ApiOptionGroup> = await response.json() ;
            if (data.errors && data.errors.length > 0) {
                throw new Error(data.errors[0].message) ;
            }
            setExtraOptions(data.payload) ;
            return data.payload ;
        } catch (error) {
            console.error('Error fetching extra options:', error) ;
            setError({
                code: 'FETCH_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch extra options'
            }) ;
            return [] ;
        } finally {
            setIsLoading(false) ;
        }
    } ;

    // Handle part selection
    const handlePartSelect = (part: SelectedPart) => {
        setError(null) ;

        // Determine which steps are available based on completion status
        const canSelectCake = true ; // Always available
        const canSelectDecoration = completedSteps.cake ;
        const canSelectMessage = completedSteps.decoration ;
        const canSelectExtras = completedSteps.message ;

        // Only allow selecting steps that are available
        if (part === 'cake') {
            setSelectedPart(part) ;
            if (partOptions.length === 0) {
                fetchPartOptions() ;
            }
        } else if (part === 'decoration' && canSelectDecoration) {
            setSelectedPart(part) ;
            if (decorationOptions.length === 0) {
                fetchDecorationOptions() ;
            }
        } else if (part === 'message' && canSelectMessage) {
            setSelectedPart(part) ;
            if (messageOptions.length === 0) {
                fetchMessageOptions() ;
            }
        } else if (part === 'extras' && canSelectExtras) {
            setSelectedPart(part) ;
            if (extraOptions.length === 0) {
                fetchExtraOptions() ;
            }
        } else if (part !== null) {
            // Show error message if trying to select a locked step
            toast.error('Please complete the previous steps first') ;
        }

        // Update current step based on selection
        if (part === 'cake' && !completedSteps.cake) {
            setCurrentStep('cake') ;
        } else if (part === 'decoration' && !completedSteps.decoration) {
            setCurrentStep('decoration') ;
        } else if (part === 'message' && !completedSteps.message) {
            setCurrentStep('message') ;
        } else if (part === 'extras' && !completedSteps.extras) {
            setCurrentStep('extras') ;
        }
    } ;

    // Handle option selection for size
    const handleSizeSelect = (option: ApiItem) => {
        // Find current size option to calculate price difference
        const currentSizeId = config.size ;
        const currentSize = partOptions.find(group => group.type === 'Size')?.items
            .find(item => item.name === currentSizeId) ;
        
        // Calculate price difference and update config
        const currentPrice = currentSize?.price || 0 ;
        const priceDifference = option.price - currentPrice ;
        
        setConfig(prev => ({
            ...prev,
            size: option.name,
            price: prev.price + priceDifference
        })) ;
    } ;

    // Handle option selection for sponge
    const handleSpongeSelect = (option: ApiItem) => {
        // Find current sponge to calculate price difference
        const currentSpongeId = config.sponge ;
        const currentSponge = partOptions.find(group => group.type === 'Sponge')?.items
            .find(item => item.id === currentSpongeId) ;
        
        // Calculate price difference
        const currentPrice = currentSponge?.price || 0 ;
        const priceDifference = option.price - currentPrice ;
        
        setConfig(prev => ({
            ...prev,
            sponge: option.id,
            price: prev.price + priceDifference
        })) ;
    } ;

    // Handle option selection for filling
    const handleFillingSelect = (option: ApiItem) => {
        // Find current filling to calculate price difference
        const currentFillingId = config.filling ;
        const currentFilling = partOptions.find(group => group.type === 'Filling')?.items
            .find(item => item.id === currentFillingId) ;
        
        // Calculate price difference
        const currentPrice = currentFilling?.price || 0 ;
        const priceDifference = option.price - currentPrice ;
        
        setConfig(prev => ({
            ...prev,
            filling: option.id,
            price: prev.price + priceDifference
        })) ;
    } ;

    // Handle option selection for icing
    const handleIcingSelect = (option: ApiItem) => {
        // Find current icing to calculate price difference
        const currentIcingId = config.icing ;
        const currentIcing = partOptions.find(group => group.type === 'Icing')?.items
            .find(item => item.id === currentIcingId) ;
        
        // Calculate price difference
        const currentPrice = currentIcing?.price || 0 ;
        const priceDifference = option.price - currentPrice ;
        
        setConfig(prev => ({
            ...prev,
            icing: option.id,
            price: prev.price + priceDifference
        })) ;
    } ;

    // Handle option selection for outer icing (decoration)
    const handleDecorationSelect = (option: ApiItem) => {
        // Find current outer icing to calculate price difference
        const currentIcingId = config.outerIcing ;
        const currentIcing = decorationOptions.flatMap(group => group.items)
            .find(item => item.id === currentIcingId) ;
        
        // Calculate price difference
        const currentPrice = currentIcing?.price || 0 ;
        const priceDifference = option.price - currentPrice ;
        
        setConfig(prev => ({
            ...prev,
            outerIcing: option.id,
            price: prev.price + priceDifference
        })) ;
    } ;

    // Handle option selection for goo
    const handleGooSelect = (option: ApiItem) => {
        // Find current goo to calculate price difference
        const currentGooId = config.goo ;
        const currentGoo = partOptions.find(group => group.type === 'Goo')?.items
            .find(item => item.id === currentGooId) ;
        
        // Calculate price difference
        const currentPrice = currentGoo?.price || 0 ;
        const priceDifference = option.price - currentPrice ;
        
        setConfig(prev => ({
            ...prev,
            goo: option.id,
            price: prev.price + priceDifference
        })) ;
    } ;

    // Handle option selection for message type
    const handleMessageTypeSelect = (messageType: 'none' | 'piped' | 'edible') => {
        // Find current message type to calculate price difference
        const currentMessageType = config.messageType ;
        const currentMessageOption = messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item => 
            (currentMessageType === 'none' && item.name === 'NONE') ||
            (currentMessageType === 'piped' && item.name === 'PIPED MESSAGE') ||
            (currentMessageType === 'edible' && item.name === 'EDIBLE IMAGE')
        ) ;
        
        // Find new message type to calculate price
        const newMessageOption = messageOptions.find(group => group.type === 'MESSAGE_TYPE')?.items.find(item => 
            (messageType === 'none' && item.name === 'NONE') ||
            (messageType === 'piped' && item.name === 'PIPED MESSAGE') ||
            (messageType === 'edible' && item.name === 'EDIBLE IMAGE')
        ) ;
        
        // Calculate price difference
        const currentPrice = currentMessageOption?.price || 0 ;
        const newPrice = newMessageOption?.price || 0 ;
        const priceDifference = newPrice - currentPrice ;
        
        setConfig(prev => ({
            ...prev,
            messageType,
            // Reset related fields when changing message type
            message: messageType === 'none' ? '' : prev.message,
            uploadedImage: messageType === 'edible' ? prev.uploadedImage : null,
            price: prev.price + priceDifference
        })) ;
    } ;

    // Handle message text change
    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({
            ...prev,
            message: e.target.value.slice(0, 30)
        })) ;
    } ;

    // Handle plaque color selection for piped message
    const handlePlaqueColorSelect = (option: ApiItem) => {
        setConfig(prev => ({
            ...prev,
            plaqueColor: option.id
        })) ;
    } ;

    // Handle piping color selection for piped message
    const handlePipingColorSelect = (option: ApiItem) => {
        setConfig(prev => ({
            ...prev,
            pipingColor: option.id
        })) ;
    } ;

    // Handle image upload for edible image
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ;
        if (file) {
            const reader = new FileReader() ;
            reader.onload = (e) => {
                setConfig(prev => ({
                    ...prev,
                    uploadedImage: e.target?.result as string
                })) ;
            } ;
            reader.readAsDataURL(file) ;
        }
    } ;

    // Handle removing uploaded image
    const handleImageRemove = () => {
        setConfig(prev => ({
            ...prev,
            uploadedImage: null
        })) ;
    } ;

    // Handle selecting extras (candles, board, etc.)
    const handleExtraSelect = (option: ApiItem) => {
        const extras = Array.isArray(config.extras) ? [...config.extras] : [] ;
        const isAlreadySelected = extras.includes(option.id) ;
        
        // Check if there's an existing option of same type to replace
        const existingOptionOfSameType = extras.find(id => {
            const existingOption = extraOptions.flatMap(group => group.items)
                .find(item => item.id === id) ;
            return existingOption?.type === option.type && id !== option.id ;
        }) ;
        
        let priceDifference = 0 ;
        
        if (isAlreadySelected) {
            // Remove if already selected
            const newExtras = extras.filter(id => id !== option.id) ;
            priceDifference = -option.price ;
            
            setConfig(prev => ({
                ...prev,
                extras: newExtras,
                price: prev.price + priceDifference,
                // If removing a board or candles, update those fields too
                ...(option.type === 'CakeBoard' ? { board: '' } : {}),
                ...(option.type === 'Candles' ? { candles: null } : {})
            })) ;
        } else {
            // If replacing an existing option of same type
            let newExtras = [...extras] ;
            
            if (existingOptionOfSameType) {
                const existingOption = extraOptions.flatMap(group => group.items)
                    .find(item => item.id === existingOptionOfSameType) ;
                
                // Remove existing and its price
                newExtras = newExtras.filter(id => id !== existingOptionOfSameType) ;
                priceDifference = option.price - (existingOption?.price || 0) ;
            } else {
                // Just add the new option's price
                priceDifference = option.price ;
            }
            
            // Add the new option
            newExtras.push(option.id) ;
            
            setConfig(prev => ({
                ...prev,
                extras: newExtras,
                price: prev.price + priceDifference,
                // Update board or candles field if applicable
                ...(option.type === 'CakeBoard' ? { board: option.id } : {}),
                ...(option.type === 'Candles' ? { candles: option.id } : {})
            })) ;
        }
    } ;

    // Complete the current step and move to the next
    const handleStepComplete = () => {
        // Validation checks for each step
        if (currentStep === 'cake') {
            if (!config.size || !config.sponge || !config.filling || !config.icing) {
                toast.error('Please select size, sponge, filling, and icing options') ;
                return ;
            }
            setCompletedSteps(prev => ({ ...prev, cake: true })) ;
            setCurrentStep('decoration') ;
            setSelectedPart('decoration') ;
        } 
        else if (currentStep === 'decoration') {
            if (!config.outerIcing) {
                toast.error('Please select a decoration option') ;
                return ;
            }
            setCompletedSteps(prev => ({ ...prev, decoration: true })) ;
            setCurrentStep('message') ;
            setSelectedPart('message') ;
        }
        else if (currentStep === 'message') {
            // Message step is optional, always allow completion
            setCompletedSteps(prev => ({ ...prev, message: true })) ;
            setCurrentStep('extras') ;
            setSelectedPart('extras') ;
        }
        else if (currentStep === 'extras') {
            // Extras are optional, always allow completion
            setCompletedSteps(prev => ({ ...prev, extras: true })) ;
            setSelectedPart(null) ;
            toast.success('Cake customization complete! You can now add it to cart.') ;
        }
    } ;

    // Save the current design to localStorage
    const handleSaveDesign = () => {
        try {
            localStorage.setItem('cakeConfig', JSON.stringify(config)) ;
            toast.success('Design saved successfully!') ;
        } catch (error) {
            console.error('Error saving design:', error) ;
            toast.error('Failed to save design') ;
        }
    } ;

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
            const currentCartResponse = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/carts', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accept': '*/*'
                }
            });
            
            const currentCartData = await currentCartResponse.json();
            let existingCartItems = [];
            let existingBakeryId = null;
            
            if (currentCartData.status_code === 200 && currentCartData.payload && currentCartData.payload.cartItems) {
                existingCartItems = currentCartData.payload.cartItems;
                if (existingCartItems.length > 0 && existingCartItems[0].bakery_id) {
                    existingBakeryId = existingCartItems[0].bakery_id;
                }
            }
            
            // If we have items from a different bakery, ask for confirmation
            if (existingBakeryId && existingCartItems.length > 0 && existingBakeryId !== storeId) {
                const confirmChange = window.confirm(
                    'Giỏ hàng của bạn đang có bánh từ một tiệm bánh khác. Thêm bánh này sẽ xóa các mặt hàng hiện tại trong giỏ hàng của bạn. Bạn có muốn tiếp tục không?'
                );
                
                if (!confirmChange) {
                    return; // User canceled, do nothing
                }
                
                // Clear current cart items for the API call
                existingCartItems = [];
                
                // Use the new changeBakery function to clear cart and set new bakeryId
                const { changeBakery } = useCart.getState();
                changeBakery(storeId, true);
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

            // Get current cart from API first to preserve existing items
            console.log('Fetching current cart to preserve existing items...');
            const updatedCartResponse = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/carts', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accept': '*/*'
                }
            });
            
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
                cake_note: `Delicious ${selectedSize} cake with ${selectedSponge?.name || 'Unknown'} sponge, filled with ${selectedFilling?.name || 'Unknown'}, iced with ${selectedIcing?.name || 'Unknown'}, and covered in ${selectedOuterIcing?.name || 'Unknown'} icing${config.goo ? `, topped with ${selectedGoo?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
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
                    name: `Custom ${selectedSize} Cake`,
                    description: `Delicious ${selectedSize} cake with ${selectedSponge?.name || 'Unknown'} sponge, filled with ${selectedFilling?.name || 'Unknown'}, iced with ${selectedIcing?.name || 'Unknown'}, and covered in ${selectedOuterIcing?.name || 'Unknown'} icing${config.goo ? `, topped with ${selectedGoo?.name || ''} drip` : ''}${Array.isArray(config.extras) && config.extras.length > 0 ? `. With ${config.extras.length} special extras added` : ''}.${config.message ? ` Personalized with "${config.message}"` : ''}`,
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

    // Helper function to get a selected option
    const getSelectedOption = (type: string, id: string | null): ApiItem | undefined => {
        if (!id) return undefined ;
        
        if (type === 'Sponge' || type === 'Filling' || type === 'Size' || type === 'Goo' || type === 'Icing') {
            return partOptions.find(group => group.type === type)?.items
                .find(item => item.id === id) ;
        }
        
        if (type === 'OuterIcing') {
            return decorationOptions.flatMap(group => group.items)
                .find(item => item.id === id) ;
        }
        
        if (type === 'Candles' || type === 'CakeBoard') {
            return extraOptions.find(group => group.type === type)?.items
                .find(item => item.id === id) ;
        }
        
        return undefined ;
    } ;

    // Format color from API to Tailwind class
    const convertColorToTailwind = (color: string): string => {
        if (!color) return 'bg-gray-200' ;
        
        // Remove any 'bg-' prefix if exists
        const normalizedColor = color.toLowerCase().trim().replace('bg-', '') ;
        
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
        } ;
        
        return colorMap[normalizedColor] || `bg-${normalizedColor}-500` ;
    } ;

    // Render the cake visualization based on selected options
    const renderCake = () => {
        // Get selected options
        const selectedSize = config.size ;
        const selectedSponge = getSelectedOption('Sponge', config.sponge) ;
        const selectedFilling = getSelectedOption('Filling', config.filling) ;
        const selectedIcing = getSelectedOption('Icing', config.icing) ;
        const selectedOuterIcing = getSelectedOption('OuterIcing', config.outerIcing) ;
        const selectedGoo = getSelectedOption('Goo', config.goo) ;
        const selectedCandles = getSelectedOption('Candles', config.candles) ;
        const selectedBoard = getSelectedOption('CakeBoard', config.board) ;
        
        // Get colors for visualization
        const spongeColor = selectedSponge ? convertColorToTailwind(selectedSponge.color) : 'bg-amber-50' ;
        const fillingColor = selectedFilling ? convertColorToTailwind(selectedFilling.color) : 'bg-white' ;
        const icingColor = selectedIcing ? convertColorToTailwind(selectedIcing.color) : 'bg-pink-200' ;
        const gooColor = selectedGoo ? convertColorToTailwind(selectedGoo.color) : null ;
        
        // Handle special preview for message section
        if (selectedPart === 'message') {
            const messageColor = config.messageType === 'piped'
                ? convertColorToTailwind(config.plaqueColor)
                : 'bg-white' ;
            
            const textColor = config.messageType === 'piped'
                ? convertColorToTailwind(config.pipingColor)
                : 'text-pink-600' ;
            
            return (
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="relative w-[80%] aspect-square rounded-full">
                        <div className={`absolute inset-0 rounded-full ${icingColor} shadow-lg`}>
                            <div className={`absolute inset-[15%] rounded-full flex items-center justify-center ${messageColor}`}>
                                {config.messageType === 'edible' && config.uploadedImage ? (
                                    <Image
                                        src={config.uploadedImage}
                                        alt="Uploaded design"
                                        className="w-full h-full object-contain rounded-full"
                                        width={200}
                                        height={200}
                                    />
                                ) : (
                                    <div className={`text-center ${textColor} italic p-8`}>
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
            ) ;
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
                                        <div className={`flex-1 ${spongeColor}`} />
                                        {gooColor && <div className={`h-1 ${gooColor}`} />}
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
                                <div className={`w-32 h-32 rounded-full flex justify-center items-center text-sm p-4 text-center shadow-sm
                                    ${config.messageType === 'piped'
                                        ? `${convertColorToTailwind(config.plaqueColor)} text-${convertColorToTailwind(config.pipingColor).replace('bg-', '')}`
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
                                        config.message || "Thông điệp..."
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Size indicator */}
                        <div className="absolute bottom-4 right-4 text-2xl font-bold">
                            {selectedSize}
                        </div>

                        {renderCakeControls()}
                    </div>
                </div>
            </div>
        ) ;
    } ;

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
        ) ;
    } ;

    // Render the appropriate customization panel based on selected part
    const renderCustomizationPanel = () => {
        if (!selectedPart) return null ;

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="text-red-500 text-xl">⚠️</div>
                    <p className="text-red-500 text-center">{error.message}</p>
                    <Button
                        onClick={() => {
                            setError(null) ;
                            handlePartSelect(selectedPart) ;
                        }}
                        variant="outline"
                    >
                        Thử lại
                    </Button>
                </div>
            ) ;
        }

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                    <p className="text-gray-500">Đang tải tùy chọn...</p>
                </div>
            ) ;
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
        ) ;

        switch (selectedPart) {
            case 'cake':
                return (
                    <div className="space-y-6">
                        {/* Size options */}
                        <div className="mb-8">
                            <h3 className="font-bold mb-4 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                KÍCH THƯỚC
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
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
                                BÁNH BỘT
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
                                KEM BÁNH
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
                                NƯỚC SỐT
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
                ) ;

            case 'decoration':
                return (
                    <div className="space-y-6">
                        <h3 className="font-bold mb-6 text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            TRANG TRÍ
                        </h3>
                        
                        {decorationOptions.map(group => (
                            <div key={group.type} className="mb-8">
                                <h4 className="font-semibold text-xl text-gray-800 mb-4 capitalize">
                                    {group.type === 'OuterIcing' ? 'LỚP KEM BÊN NGOÀI' : 
                                     group.type === 'Drip' ? 'KEM CHẢY' :
                                     group.type === 'Sprinkles' ? 'SPRINKLES' :
                                     group.type === 'Bling' ? 'TRANG TRÍ ÁNH KIM' :
                                     group.type === 'TallSkirt' ? 'BÌA CAO' :
                                     group.type === 'ShortSkirt' ? 'BÌA THẤP' : group.type}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {group.items.map(option => (
                                        <motion.button
                                            key={option.id}
                                            variants={selectedVariants}
                                            animate={config.outerIcing === option.id ? "selected" : "unselected"}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleDecorationSelect(option)}
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
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        <div className="mt-6 text-center text-sm text-gray-500">
                            Chọn kiểu trang trí cho bánh của bạn
                        </div>
                        {renderCompleteButton()}
                    </div>
                ) ;

            case 'message':
                // Define message type options
                const messageTypeOptions = [
                    { id: 'none', name: 'KHÔNG', icon: '✖️' },
                    { id: 'piped', name: 'CHỮ VIẾT TAY', icon: '✍️' },
                    { id: 'edible', name: 'HÌNH ẢNH ĂN ĐƯỢC', icon: '🖼️' }
                ] ;

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
                                                                e.preventDefault() ;
                                                                handleImageRemove() ;
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
                                                    Màu nền
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
                                                            <div className={`w-8 h-8 rounded-lg ${convertColorToTailwind(option.color)}`} />
                                                            <span className="text-sm">{option.name}</span>
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
                                                            onClick={() => handlePipingColorSelect(option)}
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
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {renderCompleteButton()}
                    </div>
                ) ;

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
                                                    ${
                                                        (group.type === 'Candles' && config.candles === option.id) ||
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
                ) ;

            default:
                return null ;
        }
    } ;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
        >
            {/* Add global styles */}
            <style jsx global>{`
                .custom-scrollbar {
                    scrollbar-width: thin ;
                    scrollbar-color: rgba(236, 72, 153, 0.3) transparent ;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px ;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent ;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(236, 72, 153, 0.3) ;
                    border-radius: 3px ;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(236, 72, 153, 0.5) ;
                }

                @keyframes float {
                    0% { transform: translateY(0px) ; }
                    50% { transform: translateY(-10px) ; }
                    100% { transform: translateY(0px) ; }
                }

                .float-animation {
                    animation: float 3s ease-in-out infinite ;
                }
            `}</style>
            
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
                                {/* Cake visualization goes here */}
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
                                                {/* Price details will be rendered here */}
                                                {/* We'll implement this in the next edits */}
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
                                            <div className="flex items-center gap-2 mb-6">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setSelectedPart(null)}
                                                    className="p-2 hover:bg-pink-50 rounded-full transition-colors"
                                                >
                                                    <ArrowLeft className="w-6 h-6 text-pink-600" />
                                                </motion.button>
                                                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                                    {selectedPart === 'cake' ? 'BÁNH' : 
                                                     selectedPart === 'decoration' ? 'TRANG TRÍ' :
                                                     selectedPart === 'message' ? 'THÔNG ĐIỆP' : 'THÊM PHẦN'}
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
                                THÊM VÀO GIỎ HÀNG
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    ) ;
} ;

// MenuItem component for the main menu
const MenuItem = ({
    icon,
    title,
    subtitle,
    onClick,
    gradient,
    disabled,
    completed
}: {
    icon: string ;
    title: string ;
    subtitle: string ;
    onClick: () => void ;
    gradient: string ;
    disabled: boolean ;
    completed: boolean ;
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
    ) ;
} ;

export default CakeCustomizer ;