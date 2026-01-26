import { Platform } from 'react-native';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY';

// Initialize Stripe (native only)
export const initializeStripe = async () => {
  if (Platform.OS === 'web') {
    console.log('Stripe not available on web');
    return;
  }

  // Only import on native platforms
  // This uses a try-catch to handle web bundling
  try {
    const stripeModule = require('@stripe/stripe-react-native');
    if (stripeModule && stripeModule.initStripe) {
      await stripeModule.initStripe({
        publishableKey: STRIPE_PUBLISHABLE_KEY,
        merchantIdentifier: 'merchant.com.famemely',
        urlScheme: 'famemely',
      });
    }
  } catch (error) {
    console.log('Stripe initialization skipped:', error);
  }
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

// useStripe hook placeholder (actual implementation would use the stripe hook)
export const useStripe = () => {
  if (Platform.OS === 'web') {
    return {
      initPaymentSheet: async () => ({ error: { message: 'Not available on web' } }),
      presentPaymentSheet: async () => ({ error: { message: 'Not available on web' } }),
    };
  }

  return null;
};
