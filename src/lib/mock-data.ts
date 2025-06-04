
import type { Property, Agent, GeneralUser, PlatformAdmin, Inquiry, Message, NigerianState } from './types';

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
    name: 'Charlie User',
    email: 'charlie@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'user',
    savedPropertyIds: ['HLCS-R243B8D', 'HLCS-R249Z1Y'], // Updated IDs
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
    name: 'Diana Admin',
    email: 'diana@homelandcapital.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'platform_admin',
  },
];


export let mockProperties: Property[] = [
  {
    id: 'HLCS-R243B8D', // Updated ID
    title: 'Spacious Family Home in Ikeja GRA',
    description:
      'A beautiful and spacious family home located in a quiet suburban neighborhood. Features a large backyard, modern kitchen, and open floor plan. Perfect for families looking for comfort and style.',
    price: 45000000,
    listingType: 'For Sale',
    location: 'Ikeja GRA',
    state: 'Lagos' as NigerianState,
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
    status: 'approved',
    isPromoted: false,
    amenities: ['Garden', 'Garage', 'Fireplace', 'Hardwood Floors', 'Borehole'],
    yearBuilt: 2005,
    coordinates: { lat: 6.6059, lng: 3.3490 },
  },
  {
    id: 'HLCS-R241A7C', // Updated ID
    title: 'Modern Victoria Island Apartment with City Views',
    description:
      'Chic and modern apartment in the heart of Victoria Island. Enjoy stunning city views, high-end finishes, and access to building amenities like a gym and rooftop pool. Ideal for urban professionals.',
    price: 75000000,
    listingType: 'For Rent',
    location: 'Victoria Island',
    state: 'Lagos' as NigerianState,
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
    status: 'approved',
    isPromoted: true, // Example of a promoted property
    amenities: ['Gym', 'Pool', 'Concierge', 'Balcony', 'City Views', 'Standby Generator'],
    yearBuilt: 2018,
    coordinates: { lat: 6.4281, lng: 3.4218 },
  },
  {
    id: 'HLCS-R249Z1Y', // Updated ID
    title: 'Cozy Lekki Phase 1 Condo',
    description:
      'Charming 2-bedroom condo in Lekki Phase 1. Features an updated kitchen, private balcony, and community amenities. Perfect for modern living or as an investment.',
    price: 32000000,
    listingType: 'For Sale',
    location: 'Lekki Phase 1',
    state: 'Lagos' as NigerianState,
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
    status: 'approved',
    isPromoted: false,
    amenities: ['Gated Community', 'Community Pool', 'Balcony', 'Updated Kitchen', '24/7 Security'],
    yearBuilt: 1995,
    coordinates: { lat: 6.4344, lng: 3.4824 },
  },
  {
    id: 'HLCS-R245G0H', // Updated ID
    title: 'Luxury Banana Island Villa with Panoramic Views',
    description: 'An exquisite luxury villa in Banana Island offering breathtaking views. This property boasts a private infinity pool, expansive terraces, a home cinema, and state-of-the-art security. Designed for opulent living and entertaining.',
    price: 250000000,
    listingType: 'For Sale',
    location: 'Banana Island',
    state: 'Lagos' as NigerianState,
    address: '7 Banana Road, Banana Island, Lagos',
    type: 'House',
    bedrooms: 5,
    bathrooms: 5, // Assuming float is fine, else needs adjustment
    areaSqFt: 6000,
    images: [
      'https://placehold.co/600x400.png?width=600&height=407',
      'https://placehold.co/600x400.png?width=600&height=408',
      'https://placehold.co/600x400.png?width=600&height=409',
      'https://placehold.co/600x400.png?width=600&height=410',
    ],
    agent: mockAgents[1],
    status: 'approved',
    isPromoted: false,
    amenities: ['Infinity Pool', 'Home Cinema', 'Smart Home System', 'Panoramic Views', 'Wine Cellar', 'Guest Chalet', 'BQ'],
    yearBuilt: 2020,
    coordinates: { lat: 6.4512, lng: 3.4450 },
  },
  {
    id: 'HLCS-R241E5N', // Updated ID
    title: 'New Build in Eko Atlantic - Pending Approval',
    description: 'A brand new architectural marvel in Eko Atlantic city. Awaiting final approval for listing. Features stunning ocean views and ultra-modern design.',
    price: 180000000,
    listingType: 'For Sale',
    location: 'Eko Atlantic',
    state: 'Lagos' as NigerianState,
    address: '1 Ocean Drive, Eko Atlantic, Lagos',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2200,
    images: ['https://placehold.co/600x400.png?width=600&height=411'],
    agent: mockAgents[0],
    status: 'pending',
    isPromoted: false,
    amenities: ['Ocean View', 'Smart Home', 'Gym', 'Pool'],
    yearBuilt: new Date().getFullYear(),
    coordinates: { lat: 6.4000, lng: 3.4000 },
  },
];

export let mockInquiries: Inquiry[] = [
  {
    id: 'inq1',
    propertyId: 'HLCS-R243B8D', // Updated ID
    propertyName: 'Spacious Family Home in Ikeja GRA',
    inquirerName: 'Eve Prospect',
    inquirerEmail: 'eve@example.com',
    message: 'I am very interested in the family home in Ikeja GRA. Could I schedule a viewing?',
    dateReceived: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    conversation: [],
  },
  {
    id: 'inq2',
    propertyId: 'HLCS-R241A7C', // Updated ID
    propertyName: 'Modern Victoria Island Apartment with City Views',
    inquirerName: 'Frank Buyer',
    inquirerEmail: 'frank@example.com',
    inquirerPhone: '0803 987 6543',
    message: 'What are the service charges for the Victoria Island apartment? Also interested in financing options.',
    dateReceived: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'contacted',
    conversation: [
      {
        id: 'msg1-inq2',
        senderId: 'admin1',
        senderRole: 'platform_admin',
        senderName: 'Diana Admin',
        content: 'Hello Frank, the service charge is NGN 1.5M per annum. We can discuss financing options when you call.',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      }
    ],
  },
  {
    id: 'inq3',
    propertyId: 'HLCS-R243B8D', // Updated ID
    propertyName: 'Spacious Family Home in Ikeja GRA',
    inquirerName: 'Charlie User',
    inquirerEmail: 'charlie@example.com',
    message: 'Interested in the Ikeja GRA property, can I get more photos?',
    dateReceived: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    conversation: [],
  },
];
