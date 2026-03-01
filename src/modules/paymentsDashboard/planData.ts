import { Plan } from "./Planselector";

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic plan',
    price: 10,
    description: 'Includes up to 10 users, 20 GB individual data and access to all features.',
    icon: '◈',
    badge: 'Limited time only',
    badgeColor: '#16a34a',
  },
  {
    id: 'premium',
    name: 'Premium plan',
    price: 20,
    description: 'Includes up to 20 users, 40 GB individual data and access to all features.',
    icon: '◈',
  },
  {
    id: 'enterprise',
    name: 'Enterprise plan',
    price: 40,
    description: 'Unlimited users, unlimited individual data and access to all features.',
    icon: '⚡',
  },
  {
    id: 'ultimate',
    name: 'Ultimate plan',
    price: 60,
    description: 'Unlimited users, unlimited individual data and access to all features.',
    icon: '◇',
  },
  {
    id: 'secret',
    name: 'Secret plan',
    price: 99,
    description: 'Exclusive access with all premium features and priority support.',
    icon: '🚀',
  },
];