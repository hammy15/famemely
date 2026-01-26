// Web-specific Stripe implementation (placeholder)
// Web payments would use Stripe.js directly

export const initializeStripe = async () => {
  console.log('Stripe: Web version - use Stripe.js for payments');
};

export const PRODUCTS = {
  PREMIUM_MONTHLY: 'price_premium_monthly',
  PREMIUM_YEARLY: 'price_premium_yearly',
  STICKER_PACK_1: 'price_sticker_pack_1',
  STICKER_PACK_2: 'price_sticker_pack_2',
} as const;

export const PREMIUM_FEATURES = [
  'No ads',
  'Exclusive sticker packs',
  'Priority matchmaking',
  'Custom game themes',
  'Unlimited champion cards export',
];

export const useStripe = () => {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Use Stripe.js on web' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Use Stripe.js on web' } }),
  };
};
