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
  agent: Agent;
  amenities?: string[];
  yearBuilt?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency?: string;
  avatarUrl?: string;
}
