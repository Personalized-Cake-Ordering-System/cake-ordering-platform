# Cart System Migration Guide

This document outlines how to migrate from the old useCart hook (Zustand-based) to the new CartContext system.

## Why We're Migrating

The previous cart implementation had several issues:
- When adding new products, the cart payload would replace existing items instead of adding to them
- Inconsistent integration with the backend API
- Multiple cart implementations (local storage via Zustand, React Context, direct API calls)

The new CartContext system provides:
- Proper synchronization with the backend API
- Consistent cart operations (add, update, remove)
- Better error handling and feedback
- Works with both custom cakes and pre-made cakes

## Files That Need Migration

The following files still use the old useCart from '@/app/store/useCart' and need to be updated:

- `components/shared/client/header/header.tsx`
- `app/(root)/(client)/layout.tsx`
- `app/(root)/(client)/stores/[storeId]/components/StoreDetailPage.tsx`
- `app/(root)/(client)/checkout/page.tsx`
- `app/(root)/(client)/cakes/[cakeId]/page.tsx`

## How to Migrate

1. Change the import from:
```javascript
import { useCart } from '@/app/store/useCart';
```
to:
```javascript
import { useCart } from '@/contexts/CartContext';
```

2. Update the usage of the hook:

### Old useCart API:
```javascript
const { items, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
```

### New CartContext API:
```javascript
const { cartItems, isLoading, error, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
```

3. Key differences to note:

- `items` is now `cartItems`
- All methods return Promises and are asynchronous
- The structure of CartItem is different:

### Old CartItem Structure:
```typescript
interface CartItem {
  id: string;
  quantity: number;
  config: CakeConfig;
  price: number;
}
```

### New CartItem Structure:
```typescript
interface CartItem {
  cake_name: string;
  main_image?: ApiImage | null;
  main_image_id?: string;
  quantity: number;
  cake_note?: string;
  sub_total_price: number;
  available_cake_id?: string | null;
  custom_cake_id?: string | null;
  bakery_id: string;
}
```

4. Method usage changes:

### addToCart:
- Old: `addToCart(item)` - synchronous, returns void
- New: `await addToCart(item)` - async, returns boolean success status

### updateQuantity:
- Old: `updateQuantity(id, quantity)` - synchronous, returns void
- New: `await updateQuantity(itemId, newQuantity)` - async, returns boolean

### removeFromCart:
- Old: `removeFromCart(id)` - synchronous, returns void
- New: `await removeFromCart(itemId)` - async, returns boolean

### clearCart:
- Old: `clearCart()` - synchronous, returns void
- New: `await clearCart()` - async, returns boolean

## Example Migration

### Before:
```javascript
const { items, addToCart } = useCart();

const handleAddToCart = () => {
  addToCart({
    id: cakeId,
    quantity: 1,
    config: cakeConfig,
    price: price
  });
  toast.success('Item added to cart!');
};
```

### After:
```javascript
const { cartItems, addToCart } = useCart();

const handleAddToCart = async () => {
  const cartItem = {
    cake_name: cake.name,
    main_image: cake.main_image,
    main_image_id: cake.main_image?.id,
    quantity: 1,
    cake_note: "",
    sub_total_price: cake.price,
    available_cake_id: cake.id,
    custom_cake_id: null,
    bakery_id: cake.bakery_id
  };
  
  const success = await addToCart(cartItem);
  if (success) {
    toast.success('Item added to cart!');
  }
};
```

## Testing the Migration

After updating each file, make sure to test the following functionality:
1. Adding items to cart
2. Updating item quantities 
3. Removing items from cart
4. Viewing the cart page
5. Checking out with items in the cart

## Rollback Plan

If issues are encountered, keep the original useCart hook implementation in place until all issues with the new CartContext are resolved. 