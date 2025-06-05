
import type { Property, Agent, GeneralUser, PlatformAdmin, Inquiry, Message, NigerianState, PlatformSettings, PromotionTierConfig } from './types';

export const mockAgents: Agent[] = [
  {
    id: 'agent1', // Note: This mock ID is not a UUID. Real agent IDs from Supabase will be UUIDs.
    name: 'Adaobi Okeke',
    email: 'adaobi@homelandcapital.com',
    phone: '0801 234 5678',
    agency: 'Okeke Premium Properties',
    avatar_url: 'https://placehold.co/100x100.png', // Corrected to avatar_url
    role: 'agent',
  },
  {
    id: 'agent2', // Note: This mock ID is not a UUID.
    name: 'Bayo Adebayo',
    email: 'bayo@homelandcapital.com',
    phone: '0802 345 6789',
    agency: 'Adebayo & Sons Estates',
    avatar_url: 'https://placehold.co/100x100.png', // Corrected to avatar_url
    role: 'agent',
  },
];

export const mockGeneralUsers: GeneralUser[] = [
  {
    id: 'user1', // Note: This mock ID is not a UUID.
    name: 'Charlie User',
    email: 'charlie@example.com',
    avatar_url: 'https://placehold.co/100x100.png', // Corrected to avatar_url
    role: 'user',
    savedPropertyIds: [], // Cleared old non-UUIDs. Real saved IDs will be UUIDs.
  },
  {
    id: 'user2', // Note: This mock ID is not a UUID.
    name: 'Dave Guest',
    email: 'dave@example.com',
    avatar_url: 'https://placehold.co/100x100.png', // Corrected to avatar_url
    role: 'user',
    savedPropertyIds: [],
  },
];

export const mockPlatformAdmins: PlatformAdmin[] = [
  {
    id: 'admin1', // Note: This mock ID is not a UUID.
    name: 'Diana Admin',
    email: 'diana@homelandcapital.com',
    avatar_url: 'https://placehold.co/100x100.png', // Corrected to avatar_url
    role: 'platform_admin',
  },
];

const defaultPromotionTiers: PromotionTierConfig[] = [
  { id: 'basic', name: 'Basic Boost', fee: 5000, duration: 7, description: 'Standard visibility boost for 7 days.' },
  { id: 'premium', name: 'Premium Spotlight', fee: 12000, duration: 14, description: 'Enhanced visibility and higher placement for 14 days.' },
  { id: 'ultimate', name: 'Ultimate Feature', fee: 25000, duration: 30, description: 'Maximum visibility, top of search, and prominent highlighting for 30 days.' },
];

export let mockPlatformSettings: PlatformSettings = {
  promotionsEnabled: true,
  promotionTiers: defaultPromotionTiers,
  siteName: 'Homeland Capital',
  defaultCurrency: 'NGN',
  maintenanceMode: false,
  notificationEmail: 'admin@homelandcapital.com',
  predefinedAmenities: "Pool, Garage, Gym, Air Conditioning, Balcony, Hardwood Floors, Borehole, Standby Generator, Security Post",
};


// mockProperties is now largely superseded by the database.
// It can be kept for reference or removed if all property data comes from DB.
// For now, let's keep it but acknowledge it's not the source of truth for pages fetching from DB.
export let mockProperties: Property[] = [
  // Properties here would have old ID formats.
  // If any part of the app still uses this directly for display, it needs to be updated.
  // Example:
  // {
  //   id: 'HLCS-R243B8D', // OLD ID
  //   title: 'Spacious Family Home in Ikeja GRA',
  //   description:
  //     'A beautiful and spacious family home located in a quiet suburban neighborhood. Features a large backyard, modern kitchen, and open floor plan. Perfect for families looking for comfort and style.',
  //   price: 45000000,
  //   listing_type: 'For Sale',
  //   location_area_city: 'Ikeja GRA',
  //   state: 'Lagos' as NigerianState,
  //   address: '10 Oduduwa Crescent, Ikeja GRA, Lagos',
  //   property_type: 'House',
  //   bedrooms: 4,
  //   bathrooms: 3,
  //   area_sq_ft: 2500,
  //   images: [
  //     'https://placehold.co/600x400.png?width=600&height=400',
  //     'https://placehold.co/600x400.png?width=600&height=401',
  //     'https://placehold.co/600x400.png?width=600&height=402',
  //   ],
  //   agent_id: mockAgents[0].id, // This would need to be a UUID if linking to real agents
  //   status: 'approved',
  //   is_promoted: false,
  //   amenities: ['Garden', 'Garage', 'Fireplace', 'Hardwood Floors', 'Borehole'],
  //   year_built: 2005,
  //   coordinates_lat: 6.6059,
  //   coordinates_lng: 3.3490,
  //   created_at: new Date().toISOString(),
  //   updated_at: new Date().toISOString(),
  // },
];

// mockInquiries is now superseded by the database for active inquiry management.
// Kept for reference or if needed for specific mock scenarios not yet migrated.
export let mockInquiries: Inquiry[] = [
  // {
  //   id: 'inq1', // This is not a UUID. DB uses UUIDs.
  //   property_id: 'HLCS-R243B8D', // This should be a UUID if linking to DB properties
  //   property_name: 'Spacious Family Home in Ikeja GRA',
  //   inquirer_name: 'Eve Prospect',
  //   inquirer_email: 'eve@example.com',
  //   initial_message: 'I am very interested in the family home in Ikeja GRA. Could I schedule a viewing?',
  //   created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  //   status: 'new',
  //   conversation: [],
  // },
];

    