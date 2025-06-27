
import type { Database } from './database.types';

export type UserRole = 'agent' | 'user' | 'platform_admin';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: UserRole;
  banned_until?: string | null;
}

export interface Agent extends BaseUser {
  role: 'agent';
  phone: string;
  agency?: string | null;
  government_id_url?: string | null;
}

export interface GeneralUser extends BaseUser {
  role: 'user';
  savedPropertyIds?: string[];
}

export interface PlatformAdmin extends BaseUser {
  role: 'platform_admin';
}

export type AuthenticatedUser = Agent | GeneralUser | PlatformAdmin;


export type PropertyStatus = Database['public']['Enums']['property_status_enum'];
export const propertyStatuses: PropertyStatus[] = ['pending', 'approved', 'rejected'];

export type NigerianState = Database['public']['Enums']['nigerian_state_enum'];
export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
] as const;

export const nigerianStateCapitals = [
  "Umuahia", "Yola", "Uyo", "Awka", "Bauchi", "Yenagoa", "Makurdi", "Maiduguri",
  "Calabar", "Asaba", "Abakaliki", "Benin City", "Ado-Ekiti", "Enugu", "Gombe",
  "Owerri", "Dutse", "Kaduna", "Kano", "Katsina", "Birnin Kebbi", "Lokoja",
  "Ilorin", "Ikeja", "Lafia", "Minna", "Abeokuta", "Akure", "Oshogbo", "Ibadan",
  "Jos", "Port Harcourt", "Sokoto", "Jalingo", "Damaturu", "Gusau", "Abuja"
] as const;
export type NigerianStateCapital = typeof nigerianStateCapitals[number];


export type ListingType = Database['public']['Enums']['listing_type_enum'];
export const listingTypes: ListingType[] = ['For Sale', 'For Rent', 'For Lease'];

export const propertyTypes: string[] = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Shortlet', 'Office Space', 'Warehouse'];


export interface PromotionTierConfig {
  id: string;
  name: string;
  fee: number;
  duration: number;
  description: string;
}

export interface PromotionDetails {
  tier_id: string;
  tier_name: string;
  promoted_at: string;
}

export interface Property {
  id: string; 
  human_readable_id?: string | null; 
  title: string;
  description: string;
  price: number; 
  listing_type: ListingType;
  location_area_city: string;
  state: NigerianState;
  address: string;
  property_type: string; 
  bedrooms: number; 
  bathrooms: number; 
  area_sq_ft?: number | null; 
  images?: string[] | null; 
  amenities?: string[] | null; 
  year_built?: number | null; 
  coordinates_lat?: number | null; 
  coordinates_lng?: number | null; 

  agent_id: string | null; 
  agent?: Agent | null; 

  status: PropertyStatus;
  rejection_reason?: string | null; 

  is_promoted?: boolean | null; 
  promotion_tier_id?: string | null; 
  promotion_tier_name?: string | null; 
  promoted_at?: string | null; 
  promotion_expires_at?: string | null; 

  created_at: string; 
  updated_at: string; 

  promotionDetails?: PromotionDetails | null;
}


export type InquiryStatus = Database['public']['Enums']['inquiry_status'];
export const inquiryStatuses: InquiryStatus[] = ['new', 'contacted', 'resolved', 'archived'];

export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender_id: string | null;
  sender_role: UserRole;
  sender_name: string;
  content: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  property_id: string;
  property_name: string;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string | null;
  initial_message: string;
  created_at: string;
  updated_at?: string | null;
  status: InquiryStatus;
  user_id?: string | null;
  conversation?: InquiryMessage[];
}

// Machinery Types
export type MachineryCondition = Database['public']['Enums']['machinery_condition_enum'];
export const machineryConditions: MachineryCondition[] = ['New', 'Used', 'Refurbished'];

export type MachineryCategory = string;

export interface Machinery {
  id: string;
  human_readable_id: string;
  title: string;
  description: string;
  category: MachineryCategory;
  manufacturer?: string | null;
  model?: string | null;
  year?: number | null;
  condition: MachineryCondition;
  price: number;
  listing_type: ListingType;
  location_city: string;
  state: NigerianState;
  images?: string[] | null;
  specifications?: { [key: string]: string | number } | null;
  agent_id: string | null;
  agent?: Agent | null;
  status: PropertyStatus; // Reusing status from properties
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

// Machinery Inquiry Types
export type MachineryInquiryStatus = 'new' | 'contacted' | 'resolved' | 'archived';

export interface MachineryInquiryMessage {
  id: string;
  inquiry_id: string;
  sender_id: string | null;
  sender_role: UserRole;
  sender_name: string;
  content: string;
  timestamp: string;
}

export interface MachineryInquiry {
  id: string;
  machinery_id: string;
  machinery_title: string;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string | null;
  initial_message: string;
  created_at: string;
  updated_at?: string | null;
  status: MachineryInquiryStatus;
  user_id?: string | null;
  conversation?: MachineryInquiryMessage[];
}

export type MachineryRequestStatus = 'new' | 'contacted' | 'resolved';
export const machineryRequestStatuses: MachineryRequestStatus[] = ['new', 'contacted', 'resolved'];

export interface MachineryRequest {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  machinery_title: string;
  machinery_category: string | null;
  message: string | null;
  status: MachineryRequestStatus;
  created_at: string;
  updated_at: string;
}


// Community Project Types
export type CommunityProjectStatus = "Planning" | "Funding" | "Ongoing" | "Completed" | "On Hold" | "Canceled" | "Pending Approval" | "Rejected";
export const communityProjectStatuses: CommunityProjectStatus[] = ["Planning", "Funding", "Ongoing", "Completed", "On Hold", "Canceled", "Pending Approval", "Rejected"];

export interface CommunityProject {
  id: string; 
  human_readable_id: string; 
  title: string; 
  category: string; 
  description: string; 
  brochure_link?: string | null; 
  images?: string[] | null; 
  budget_tiers: string[] | null;
  status: CommunityProjectStatus; 
  created_at: string; 
  updated_at: string; 
  managed_by_user_id: string | null; 
  manager?: AuthenticatedUser | null; 
}

// Community Project Interest Types
export type CommunityProjectInterestStatus = 'new' | 'contacted' | 'resolved';
export const communityProjectInterestStatuses: CommunityProjectInterestStatus[] = ['new', 'contacted', 'resolved'];

export interface CommunityProjectInterestMessage {
  id: string;
  interest_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: UserRole;
  content: string;
  timestamp: string;
}

export interface CommunityProjectInterest {
  id: string;
  project_id: string | null; 
  project_title: string | null; 
  user_id: string | null; 
  user_name: string | null;
  user_email: string | null;
  location_type: 'stateCapital' | 'lga';
  state_capital?: string | null;
  lga_name?: string | null;
  selected_budget_tier: string;
  message?: string | null;
  created_at: string;
  updated_at: string;
  status: CommunityProjectInterestStatus;
  conversation?: CommunityProjectInterestMessage[];
}


// Development Project Types
export interface DevelopmentProject {
  id: string; 
  human_readable_id: string; 
  title: string; 
  category: string; 
  description: string;
  location_area_city: string | null;
  state: NigerianState;
  brochure_link?: string | null; 
  images?: string[] | null; 
  price?: number | null; 
  status: CommunityProjectStatus; // Reusing status from community projects
  created_at: string; 
  updated_at: string; 
  managed_by_user_id: string | null; 
  manager?: AuthenticatedUser | null; 
}

// Development Project Interest Types
export type DevelopmentProjectInterestStatus = 'new' | 'contacted' | 'resolved';
export const developmentProjectInterestStatuses: DevelopmentProjectInterestStatus[] = ['new', 'contacted', 'resolved'];

export interface DevelopmentProjectInterestMessage {
  id: string;
  interest_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: UserRole;
  content: string;
  timestamp: string;
}

export interface DevelopmentProjectInterest {
  id: string;
  project_id: string | null; 
  project_title: string | null; 
  user_id: string | null; 
  user_name: string | null;
  user_email: string | null;
  location_type: 'stateCapital' | 'lga' | null;
  state_capital?: string | null;
  lga_name?: string | null;
  selected_budget_tier: string | null;
  message?: string | null;
  created_at: string;
  updated_at: string;
  status: DevelopmentProjectInterestStatus;
  conversation?: DevelopmentProjectInterestMessage[];
}


// CMS Content Types
export interface CmsLink {
  text: string;
  href: string;
}

interface HeroSlide {
  titleLines: string[];
  subtitle?: string;
  cta: CmsLink;
  backgroundImageUrl: string;
  backgroundImageAlt: string;
}

interface HomePageHeroSection {
  slides: HeroSlide[];
}

interface HomePageServiceItem {
  iconName: string;
  title: string;
  description: string;
}

interface HomePageOurServicesSection {
  title: string;
  subtitle: string;
  items: HomePageServiceItem[];
}

interface HomePageFindHomeFeature {
  iconName: string;
  text: string;
  subtext: string;
}

interface HomePageFindHomeSection {
  title: string;
  subtitle: string;
  features: HomePageFindHomeFeature[];
  imageUrl: string;
  imageAlt: string;
  cta: CmsLink;
}

interface HomePageProjectSection {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  cta: CmsLink;
  imagePosition: 'left' | 'right';
}

export interface HomePageContent {
  hero: HomePageHeroSection;
  ourServices: HomePageOurServicesSection;
  findYourHome: HomePageFindHomeSection;
  developmentProjects: HomePageProjectSection;
  communityOutreach: HomePageProjectSection;
}


export interface ServiceCategory {
  title: string;
  description: string;
}

export interface ServiceGridItem {
  iconName: string;
  title: string;
  description: string;
}

export interface ServicesPageContent {
  pageTitle: string;
  headerTitle: string;
  headerSubtitle: string;
  mainCategories: ServiceCategory[];
  propertyVerificationSection: {
    title: string;
    subtitle: string;
    items: ServiceGridItem[];
  };
  detailedVerificationSection: {
    title: string;
    subtitle: string;
    items: ServiceGridItem[];
  };
  cta: CmsLink;
}


export interface AboutPageHeroSection {
  title: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
  badgeText: string;
}

export interface AboutPageServiceItem {
  iconName: string;
  title: string;
  description: string;
}

export interface AboutPageServicesSection {
  title: string;
  subtitle: string;
  items: AboutPageServiceItem[];
}

export interface AboutPageContent {
  pageTitle: string;
  heroSection: AboutPageHeroSection;
  servicesSection: AboutPageServicesSection;
}


export interface OfficeDetails {
  tabName: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface ContactPageContentNew {
  pageTitle: string;
  headerTitle: string;
  headerSubtitle: string;
  formSection: {
    title: string;
    inquiryTypes: string[];
  };
  officesSection: {
    title: string;
    headquarters: OfficeDetails;
    regionalOffice?: OfficeDetails | null; 
  };
  businessHoursSection: {
    title: string;
    hours: Array<{ day: string; time: string }>;
  };
}


export interface FooterLinkColumn {
  title: string;
  links: CmsLink[];
}

export interface FooterContent {
  tagline: string;
  columns: FooterLinkColumn[];
  copyrightText: string;
  builtWithText: string;
}

export const managedSectorKeys = ['realEstate', 'machinery', 'development', 'community'] as const;
export type SectorKey = typeof managedSectorKeys[number];
export type SectorVisibility = Partial<Record<SectorKey, boolean>>;

export interface PlatformSettings {
  promotionsEnabled: boolean;
  promotionTiers: PromotionTierConfig[];
  siteName: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  notificationEmail: string;
  predefinedAmenities: string | null; 
  propertyTypes: string[] | null; 
  sector_visibility?: SectorVisibility | null; 
  configuredCommunityBudgetTiers: string | null;
  machineryCategories: string | null;
  community_project_categories: string | null;
  development_project_categories: string | null;
}
