
import type { Property, Agent, GeneralUser, PlatformAdmin, Inquiry } from './types';

export const mockAgents: Agent[] = [
  {
    id: 'agent1',
    name: 'Alice Wonderland',
    email: 'alice@homelandcapital.com',
    phone: '555-1234',
    agency: 'Wonderland Realty',
    avatarUrl: 'https://placehold.co/100x100.png',
    role: 'agent',
  },
  {
    id: 'agent2',
    name: 'Bob The Builder',
    email: 'bob@homelandcapital.com',
    phone: '555-5678',
    agency: 'BuildIt Estates',
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
    id: 'prop1',
    title: 'Spacious Family Home in Suburbia',
    description:
      'A beautiful and spacious family home located in a quiet suburban neighborhood. Features a large backyard, modern kitchen, and open floor plan. Perfect for families looking for comfort and style.',
    price: 450000,
    location: 'Willow Creek, Suburbia',
    address: '123 Oak Street, Willow Creek, SU 98765',
    type: 'House',
    bedrooms: 4,
    bathrooms: 3,
    areaSqFt: 2500,
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
    agent: mockAgents[0],
    amenities: ['Garden', 'Garage', 'Fireplace', 'Hardwood Floors'],
    yearBuilt: 2005,
    coordinates: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  },
  {
    id: 'prop2',
    title: 'Modern Downtown Apartment with City Views',
    description:
      'Chic and modern apartment in the heart of downtown. Enjoy stunning city views, high-end finishes, and access to building amenities like a gym and rooftop pool. Ideal for urban professionals.',
    price: 750000,
    location: 'Metropolis Center, Downtown',
    address: '456 High Tower Ave, Suite 1502, Metropolis Center, MC 12345',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1200,
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
    agent: mockAgents[1],
    amenities: ['Gym', 'Pool', 'Concierge', 'Balcony', 'City Views'],
    yearBuilt: 2018,
    coordinates: { lat: 40.7128, lng: -74.0060 }, // New York
  },
  {
    id: 'prop3',
    title: 'Cozy Condo near the Beach',
    description:
      'Charming 2-bedroom condo just steps away from the sandy shores. Features an updated kitchen, private balcony, and community pool. Perfect for a vacation home or coastal living.',
    price: 320000,
    location: 'Sunset Beach, Coastline City',
    address: '789 Ocean Drive, Unit B, Sunset Beach, CC 54321',
    type: 'Condo',
    bedrooms: 2,
    bathrooms: 1,
    areaSqFt: 950,
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
    agent: mockAgents[0],
    amenities: ['Beach Access', 'Community Pool', 'Balcony', 'Updated Kitchen'],
    yearBuilt: 1995,
    coordinates: { lat: 25.7617, lng: -80.1918 }, // Miami
  },
  {
    id: 'prop4',
    title: 'Luxury Villa with Panoramic Views',
    description: 'An exquisite luxury villa offering breathtaking panoramic views of the hills and city. This property boasts a private infinity pool, expansive terraces, a home cinema, and state-of-the-art security. Designed for opulent living and entertaining.',
    price: 2500000,
    location: 'Serene Hills, Prestige City',
    address: '1 Vista Lane, Serene Hills, PC 67890',
    type: 'House',
    bedrooms: 5,
    bathrooms: 5.5, // Note: bathrooms can be float for 0.5 baths
    areaSqFt: 6000,
    images: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
    agent: mockAgents[1],
    amenities: ['Infinity Pool', 'Home Cinema', 'Smart Home System', 'Panoramic Views', 'Wine Cellar', 'Guest House'],
    yearBuilt: 2020,
    coordinates: { lat: 37.7749, lng: -122.4194 }, // San Francisco
  },
];

export let mockInquiries: Inquiry[] = [
  {
    id: 'inq1',
    propertyId: 'prop1',
    propertyName: 'Spacious Family Home in Suburbia',
    agentId: mockAgents[0].id,
    agentName: mockAgents[0].name,
    inquirerName: 'Eve Prospect',
    inquirerEmail: 'eve@example.com',
    message: 'I am very interested in the family home in Willow Creek. Could I schedule a viewing?',
    dateReceived: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'new',
  },
  {
    id: 'inq2',
    propertyId: 'prop2',
    propertyName: 'Modern Downtown Apartment with City Views',
    agentId: mockAgents[1].id,
    agentName: mockAgents[1].name,
    inquirerName: 'Frank Buyer',
    inquirerEmail: 'frank@example.com',
    inquirerPhone: '555-9876',
    message: 'What are the HOA fees for the downtown apartment? Also interested in financing options.',
    dateReceived: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'contacted',
  },
];
