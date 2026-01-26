import { initStripe, useStripe as useStripeHook } from '@stripe/stripe-react-native';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY';

// Initialize Stripe
export const initializeStripe = async () => {
  await initStripe({
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    merchantIdentifier: 'merchant.com.famemely',
    urlScheme: 'famemely',
  });
};

// Product IDs
export const PRODUCTS = {
  PREMIUM_MONTHLY: 'price_premium_monthly',
  PREMIUM_YEARLY: 'price_premium_yearly',
  STICKER_PACK_1: 'price_sticker_pack_1',
  STICKER_PACK_2: 'price_sticker_pack_2',
} as const;

// Premium features
export const PREMIUM_FEATURES = [
  'No ads',
  'Exclusive sticker packs',
  'Priority matchmaking',
  'Custom game themes',
  'Unlimited champion cards export',
];

export { useStripeHook as useStripe };
