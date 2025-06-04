
import type { Property, Agent, GeneralUser, PlatformAdmin, Inquiry } from './types';

export const mockAgents: Agent[] = [
  {
    id: 'agent1',
    name: 'Adaobi Okeke',
    email: 'adaobi@homelandcapital.com',
    phone: '0801 234 5678',
    agency: 'Okeke Premium Properties',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'agent',
  },
  {
    id: 'agent2',
    name: 'Bayo Adebayo',
    email: 'bayo@homelandcapital.com',
    phone: '0802 345 6789',
    agency: 'Adebayo & Sons Estates',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'agent',
  },
];

export const mockGeneralUsers: GeneralUser[] = [
  {
    id: 'user1',
    name: 'Charlie User', // Keeping generic for broad user base
    email: 'charlie@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'user',
    savedPropertyIds: ['prop1', 'prop3'],
  },
  {
    id: 'user2',
    name: 'Dave Guest',
    email: 'dave@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'user',
    savedPropertyIds: [],
  },
];

export const mockPlatformAdmins: PlatformAdmin[] = [
  {
    id: 'admin1',
    name: 'Diana Admin', // Keeping generic
    email: 'diana@homelandcapital.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'platform_admin',
  },
];


export let mockProperties: Property[] = [
  {
    id: 'prop1',
    title: 'Spacious Family Home in Ikeja GRA',
    description:
      'A beautiful and spacious family home located in a quiet suburban neighborhood. Features a large backyard, modern kitchen, and open floor plan. Perfect for families looking for comfort and style.',
    price: 45000000, // Adjusted price for Naira
    location: 'Ikeja GRA, Lagos',
    address: '10 Oduduwa Crescent, Ikeja GRA, Lagos',
    type: 'House',
    bedrooms: 4,
    bathrooms: 3,
    areaSqFt: 2500,
    images: [
      'https://placehold.co/600x400.png?width=600&height=400',
      'https://placehold.co/600x400.png?width=600&height=401',
      'https://placehold.co/600x400.png?width=600&height=402',
    ],
    agent: mockAgents[0],
    amenities: ['Garden', 'Garage', 'Fireplace', 'Hardwood Floors', 'Borehole'],
    yearBuilt: 2005,
    coordinates: { lat: 6.6059, lng: 3.3490 }, // Ikeja, Lagos
  },
  {
    id: 'prop2',
    title: 'Modern Victoria Island Apartment with City Views',
    description:
      'Chic and modern apartment in the heart of Victoria Island. Enjoy stunning city views, high-end finishes, and access to building amenities like a gym and rooftop pool. Ideal for urban professionals.',
    price: 75000000, // Adjusted price
    location: 'Victoria Island, Lagos',
    address: '20 Akin Adesola Street, Victoria Island, Lagos',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1200,
    images: [
      'https://placehold.co/600x400.png?width=600&height=403',
      'https://placehold.co/600x400.png?width=600&height=404',
    ],
    agent: mockAgents[1],
    amenities: ['Gym', 'Pool', 'Concierge', 'Balcony', 'City Views', 'Standby Generator'],
    yearBuilt: 2018,
    coordinates: { lat: 6.4281, lng: 3.4218 }, // Victoria Island, Lagos
  },
  {
    id: 'prop3',
    title: 'Cozy Lekki Phase 1 Condo',
    description:
      'Charming 2-bedroom condo in Lekki Phase 1. Features an updated kitchen, private balcony, and community amenities. Perfect for modern living or as an investment.',
    price: 32000000, // Adjusted price
    location: 'Lekki Phase 1, Lagos',
    address: '5 Freedom Way, Lekki Phase 1, Lagos',
    type: 'Condo',
    bedrooms: 2,
    bathrooms: 1,
    areaSqFt: 950,
    images: [
      'https://placehold.co/600x400.png?width=600&height=405',
      'https://placehold.co/600x400.png?width=600&height=406',
    ],
    agent: mockAgents[0],
    amenities: ['Gated Community', 'Community Pool', 'Balcony', 'Updated Kitchen', '24/7 Security'],
    yearBuilt: 1995,
    coordinates: { lat: 6.4344, lng: 3.4824 }, // Lekki Phase 1, Lagos
  },
  {
    id: 'prop4',
    title: 'Luxury Banana Island Villa with Panoramic Views',
    description: 'An exquisite luxury villa in Banana Island offering breathtaking views. This property boasts a private infinity pool, expansive terraces, a home cinema, and state-of-the-art security. Designed for opulent living and entertaining.',
    price: 250000000, // Adjusted price
    location: 'Banana Island, Lagos',
    address: '7 Banana Road, Banana Island, Lagos',
    type: 'House',
    bedrooms: 5,
    bathrooms: 5.5,
    areaSqFt: 6000,
    images: [
      'https://placehold.co/600x400.png?width=600&height=407',
      'https://placehold.co/600x400.png?width=600&height=408',
      'https://placehold.co/600x400.png?width=600&height=409',
      'https://placehold.co/600x400.png?width=600&height=410',
    ],
    agent: mockAgents[1],
    amenities: ['Infinity Pool', 'Home Cinema', 'Smart Home System', 'Panoramic Views', 'Wine Cellar', 'Guest Chalet', 'BQ'],
    yearBuilt: 2020,
    coordinates: { lat: 6.4512, lng: 3.4450 }, // Banana Island, Lagos
  },
];

export let mockInquiries: Inquiry[] = [
  {
    id: 'inq1',
    propertyId: 'prop1',
    propertyName: 'Spacious Family Home in Ikeja GRA',
    inquirerName: 'Eve Prospect',
    inquirerEmail: 'eve@example.com',
    message: 'I am very interested in the family home in Ikeja GRA. Could I schedule a viewing?',
    dateReceived: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'new',
  },
  {
    id: 'inq2',
    propertyId: 'prop2',
    propertyName: 'Modern Victoria Island Apartment with City Views',
    inquirerName: 'Frank Buyer',
    inquirerEmail: 'frank@example.com',
    inquirerPhone: '0803 987 6543',
    message: 'What are the service charges for the Victoria Island apartment? Also interested in financing options.',
    dateReceived: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'contacted',
  },
  {
    id: 'inq3',
    propertyId: 'prop1',
    propertyName: 'Spacious Family Home in Ikeja GRA',
    inquirerName: 'Charlie User', // Inquiry from charlie
    inquirerEmail: 'charlie@example.com',
    message: 'Interested in the Ikeja GRA property, can I get more photos?',
    dateReceived: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'new',
  },
];
