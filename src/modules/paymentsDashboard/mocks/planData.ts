// planData.ts

import { Plan } from "../components/MiniPlanselector";

export const PLANS: Plan[] = [
  {
    id: 'summer',
    name: 'Summer',
    price: 20,
    volume: 50, // litres
    description: 'Beat the heat with refreshing water packs.',
    icon: '🌤️',
    badge: 'Seasonal',
    badgeColor: '#3b82f6',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 50,
    volume: 80,
    description: 'Stay hydrated with a balanced amount for families.',
    icon: '🚰',
  },
  {
    id: 'party',
    name: 'Party',
    price: 100,
    volume: 200,
    description: 'Party-size packs to keep the celebration flowing.',
    icon: '🎉',
    badge: 'Popular',
    badgeColor: '#f97316',
  },
  {
    id: 'festive',
    name: 'Festive',
    price: 150,
    volume: 300,
    description: 'Ideal for big gatherings and festivals.',
    icon: '🥳',
    badge: 'Festive Offer',
    badgeColor: '#10b981',
  },
];