import { loadStripe, Stripe } from '@stripe/stripe-js';

// Client-side Stripe promise
let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

// Plan Constants
export const STRIPE_PLANS = {
  PRO: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_123',
    name: 'Pro',
    limits: {
      sku: 10000,
      users: 5
    }
  },
  ENTERPRISE: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_456',
    name: 'Enterprise',
    limits: {
      sku: -1, // Unlimited
      users: -1 // Unlimited
    }
  }
};
