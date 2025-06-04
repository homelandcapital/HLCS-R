
export type UserRole = 'agent' | 'user' | 'platform_admin';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Agent extends BaseUser {
  role: 'agent';
  phone: string;
  agency?: string;
}

export interface GeneralUser extends BaseUser {
  role: 'user';
  // Add any user-specific fields if necessary, e.g., savedSearches, preferences
}

export interface PlatformAdmin extends BaseUser {
  role: 'platform_admin';
  // Add any admin-specific fields if necessary, e.g., permissions
}

export type AuthenticatedUser = Agent | GeneralUser | PlatformAdmin;

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  type: 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Land';
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  images: string[];
  agent: Agent; // A property is listed by an Agent
  amenities?: string[];
  yearBuilt?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type InquiryStatus = 'new' | 'contacted' | 'resolved' | 'archived';

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone?: string;
  message: string;
  dateReceived: string; // Using string for simplicity with mock data, can be Date
  status: InquiryStatus;
}
