import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe client
// Provide a dummy key if environment variable is missing to prevent crash during initialization
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_to_prevent_crash', {
  apiVersion: '2024-12-18.acacia',
  appInfo: {
    name: 'Flowwentory',
    version: '2.0.0',
  },
});

// Server-only functions should stay here
