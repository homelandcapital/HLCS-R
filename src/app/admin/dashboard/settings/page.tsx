
// src/app/admin/dashboard/settings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Palette, Bell, Shield, Home, ListPlus, KeyRound, CreditCard, Paintbrush, SlidersHorizontal, Star, TrendingUp, Zap, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import type { PromotionTierConfig, PlatformSettings as PlatformSettingsType } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminPromotionTier {
  id: string;
  name: string; 
  icon: React.ReactNode; // Keep icon for UI only, not saved to DB
  fee: string; 
  duration: string; 
  description: string;
}

const initialAdminPromotionTiersUI: AdminPromotionTier[] = [
  { id: 'basic', name: 'Basic Boost', icon: <Star className="h-5 w-5 text-yellow-500" />, fee: '5000', duration: '7', description: 'Standard visibility boost for 7 days.' },
  { id: 'premium', name: 'Premium Spotlight', icon: <TrendingUp className="h-5 w-5 text-orange-500" />, fee: '12000', duration: '14', description: 'Enhanced visibility and higher placement for 14 days.' },
  { id: 'ultimate', name: 'Ultimate Feature', icon: <Gem className="h-5 w-5 text-purple-500" />, fee: '25000', duration: '30', description: 'Maximum visibility, top of search, and prominent highlighting for 30 days.' },
];


export default function PlatformSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // States for settings
  const [siteName, setSiteName] = useState('Homeland Capital');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('NGN');
  const [notificationEmail, setNotificationEmail] = useState('admin@homelandcapital.com');
  
  const [predefinedAmenities, setPredefinedAmenities] = useState("Pool,Garage,Gym"); // Stored as comma-separated string
  const [propertyTypes, setPropertyTypes] = useState("House,Apartment,Land"); // Stored as comma-separated string for Textarea

  const [promotionsEnabled, setPromotionsEnabled] = useState(true);
  const [adminPromotionTiers, setAdminPromotionTiers] = useState<AdminPromotionTier[]>(initialAdminPromotionTiersUI);

  const fetchPlatformSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1) // Assuming there's only one row with id=1
      .single();

    if (error) {
      toast({ title: 'Error Fetching Settings', description: `Could not load platform settings: ${error.message}. Using defaults.`, variant: 'destructive' });
      // Use defaults if fetch fails, already set in useState
    } else if (data) {
      setSiteName(data.site_name || 'Homeland Capital');
      setMaintenanceMode(data.maintenance_mode || false);
      setDefaultCurrency(data.default_currency || 'NGN');
      setNotificationEmail(data.notification_email || 'admin@homelandcapital.com');
      setPredefinedAmenities((data.predefined_amenities as string || "Pool,Garage,Gym"));
      setPropertyTypes((data.property_types as string[] || ['House', 'Apartment', 'Land']).join(','));
      
      setPromotionsEnabled(data.promotions_enabled || true);
      if (data.promotion_tiers) {
        const dbTiers = data.promotion_tiers as PromotionTierConfig[];
        // Map DB tiers to UI tiers, preserving icons
        const uiTiers = initialAdminPromotionTiersUI.map(uiTier => {
          const dbMatch = dbTiers.find(dbT => dbT.id === uiTier.id);
          return dbMatch ? {
            ...uiTier, // Keep icon
            name: dbMatch.name,
            fee: dbMatch.fee.toString(),
            duration: dbMatch.duration.toString(),
            description: dbMatch.description,
          } : uiTier; // Fallback to initial UI tier if no DB match (e.g. new tier added to UI)
        });
        setAdminPromotionTiers(uiTiers);
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPlatformSettings();
  }, [fetchPlatformSettings]);


  const handleTierChange = (tierId: string, field: keyof Omit<AdminPromotionTier, 'id' | 'icon'>, value: string) => {
    setAdminPromotionTiers(currentTiers =>
      currentTiers.map(tier =>
        tier.id === tierId ? { ...tier, [field]: value } : tier
      )
    );
  };

  const handleSaveChanges = async () => {
    const settingsToSave: Omit<PlatformSettingsType, 'promotionTiers'> & { promotion_tiers: PromotionTierConfig[], property_types: string[] } & { id: number } = {
      id: 1, // For upsert
      site_name: siteName,
      maintenance_mode: maintenanceMode,
      default_currency: defaultCurrency,
      notification_email: notificationEmail,
      predefined_amenities: predefinedAmenities, // Save as comma-separated string
      property_types: propertyTypes.split(',').map(pt => pt.trim()).filter(Boolean), // Save as array of strings
      promotions_enabled: promotionsEnabled,
      promotion_tiers: adminPromotionTiers.map(tier => ({ // Convert UI string values to number for DB
        id: tier.id,
        name: tier.name,
        fee: parseFloat(tier.fee) || 0, 
        duration: parseInt(tier.duration, 10) || 0, 
        description: tier.description,
      })),
    };
    
    const { error } = await supabase
      .from('platform_settings')
      .upsert(settingsToSave, { onConflict: 'id' });

    if (error) {
      toast({ title: 'Error Saving Settings', description: `Could not save settings: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Settings Saved', description: 'Platform settings have been successfully updated.' });
      fetchPlatformSettings(); // Re-fetch to confirm and ensure UI consistency
    }
  };

  if (loading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/2 mb-2" />
            <Skeleton className="h-8 w-3/4 mb-6" />
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="shadow-xl mb-6">
                    <CardHeader> <Skeleton className="h-8 w-1/3 mb-2" /> <Skeleton className="h-4 w-2/3" /> </CardHeader>
                    <CardContent className="space-y-6"> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> </CardContent>
                </Card>
            ))}
            <div className="flex justify-end pt-4"> <Skeleton className="h-12 w-32" /> </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline flex items-center">
          <Settings className="mr-3 h-8 w-8 text-primary" /> Platform Settings
        </h1>
        <p className="text-muted-foreground">
          Configure general settings for the Homeland Capital platform.
        </p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Palette className="mr-2 h-5 w-5 text-muted-foreground" /> General Settings
          </CardTitle>
          <CardDescription>Manage basic site information and operational modes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Your Platform Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultCurrency">Default Currency</Label>
            <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
              <SelectTrigger id="defaultCurrency">
                <SelectValue placeholder="Select default currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Default currency for displaying prices.</p>
          </div>

          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div>
                <Label htmlFor="maintenanceMode" className="text-base">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily take the site offline for public users.</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Home className="mr-2 h-5 w-5 text-muted-foreground" /> Property Listing Settings
          </CardTitle>
          <CardDescription>Configure options related to property listings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="predefinedAmenities">Manage Predefined Amenities</Label>
            <Textarea
              id="predefinedAmenities"
              value={predefinedAmenities}
              onChange={(e) => setPredefinedAmenities(e.target.value)}
              placeholder="Enter comma-separated amenities, e.g., Pool,Garage,Gym"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of standard amenities. Agents will be able to select from these or add their own.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyTypes">Manage Property Types</Label>
            <Textarea
              id="propertyTypes"
              value={propertyTypes}
              onChange={(e) => setPropertyTypes(e.target.value)}
              placeholder="Enter comma-separated property types, e.g., House,Apartment,Condo"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of available property types. These will appear in the property type selection dropdown for agents.
            </p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="customFields">Manage Custom Fields for Properties</Label>
             <Button variant="outline" disabled className="w-full justify-start">
              <ListPlus className="mr-2 h-4 w-4" /> Define Custom Fields (Placeholder)
            </Button>
            <p className="text-xs text-muted-foreground">
              (Placeholder) Allow defining additional custom fields for property listings (e.g., Pet Policy: Yes/No).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Zap className="mr-2 h-5 w-5 text-muted-foreground" /> Promotion Tier Settings
          </CardTitle>
          <CardDescription>Configure different property promotion packages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg mb-6">
            <div>
                <Label htmlFor="promotionsEnabled" className="text-base">Enable Property Promotions</Label>
                <p className="text-sm text-muted-foreground">Allow agents to promote their listings using defined tiers.</p>
            </div>
            <Switch
              id="promotionsEnabled"
              checked={promotionsEnabled}
              onCheckedChange={setPromotionsEnabled}
            />
          </div>

          <div className="space-y-8">
            {adminPromotionTiers.map((tier) => (
              <Card key={tier.id} className={!promotionsEnabled ? 'opacity-50 pointer-events-none' : ''}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0">{tier.icon}</span>
                    <div className="flex-grow">
                      <Label htmlFor={`${tier.id}-name`} className="text-xs font-medium text-muted-foreground">Tier Name</Label>
                      <Input
                        id={`${tier.id}-name`}
                        value={tier.name}
                        onChange={(e) => handleTierChange(tier.id, 'name', e.target.value)}
                        placeholder="e.g., Basic Boost"
                        className="text-lg font-headline mt-0.5" 
                        disabled={!promotionsEnabled}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={`${tier.id}-fee`}>Fee (NGN)</Label>
                      <Input
                        id={`${tier.id}-fee`}
                        type="number"
                        value={tier.fee}
                        onChange={(e) => handleTierChange(tier.id, 'fee', e.target.value)}
                        placeholder="e.g., 5000"
                        min="0"
                        disabled={!promotionsEnabled}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${tier.id}-duration`}>Duration (Days)</Label>
                      <Input
                        id={`${tier.id}-duration`}
                        type="number"
                        value={tier.duration}
                        onChange={(e) => handleTierChange(tier.id, 'duration', e.target.value)}
                        placeholder="e.g., 7"
                        min="1"
                        disabled={!promotionsEnabled}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${tier.id}-description`}>Description</Label>
                    <Textarea
                      id={`${tier.id}-description`}
                      value={tier.description}
                      onChange={(e) => handleTierChange(tier.id, 'description', e.target.value)}
                      placeholder="Briefly describe this promotion tier..."
                      rows={2}
                      disabled={!promotionsEnabled}
                    />
                     <p className="text-xs text-muted-foreground">This description might be shown to agents.</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Bell className="mr-2 h-5 w-5 text-muted-foreground" /> Notification Settings
          </CardTitle>
          <CardDescription>Configure how platform notifications are handled.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="notificationEmail">Default Notification Email</Label>
            <Input
              id="notificationEmail"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="notifications@example.com"
            />
            <p className="text-xs text-muted-foreground">Email address for sending system notifications.</p>
          </div>
        </CardContent>
      </Card>

       <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
             <Shield className="mr-2 h-5 w-5 text-muted-foreground" /> Security & Compliance (Placeholders)
          </CardTitle>
          <CardDescription>Manage security policies and compliance features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="twoFactorAuth">Two-Factor Authentication (2FA)</Label>
            <Select defaultValue="admins_only">
              <SelectTrigger id="twoFactorAuth">
                <SelectValue placeholder="Select 2FA policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled for all users</SelectItem>
                <SelectItem value="optional">Optional for all users</SelectItem>
                <SelectItem value="agents_mandatory">Mandatory for Agents & Admins</SelectItem>
                <SelectItem value="admins_only">Mandatory for Admins only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Configure 2FA requirements for user roles.</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="dataRetention">Data Retention Policy</Label>
            <Input
              id="dataRetention"
              placeholder="e.g., Keep user data for 5 years after inactivity"
              disabled 
            />
             <p className="text-xs text-muted-foreground">This setting is a placeholder for a more complex feature.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Advanced Settings & Integrations</CardTitle>
          <CardDescription>Manage integrations and advanced customization options for the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiKeyManagement">API Key Management</Label>
            <Button variant="outline" disabled className="w-full justify-start">
              <KeyRound className="mr-2 h-4 w-4" /> Manage API Keys (Placeholder)
            </Button>
            <p className="text-xs text-muted-foreground">
              (Placeholder) Manage API keys for third-party services like mapping, analytics, etc.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailTemplates">Email Template Customization</Label>
            <Button variant="outline" disabled className="w-full justify-start">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Customize Email Templates (Placeholder)
            </Button>
            <p className="text-xs text-muted-foreground">
              (Placeholder) Customize the content and branding of system-generated emails.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentGateways">Payment Gateway Integration</Label>
            <Button variant="outline" disabled className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" /> Configure Payment Gateways (Placeholder)
            </Button>
            <p className="text-xs text-muted-foreground">
              (Placeholder) Integrate with payment gateways for premium listings or agent subscriptions.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customBranding">Custom Branding Options</Label>
            <Button variant="outline" disabled className="w-full justify-start">
              <Paintbrush className="mr-2 h-4 w-4" /> Manage Custom Branding (Placeholder)
            </Button>
            <p className="text-xs text-muted-foreground">
              (Placeholder) Customize logos, color schemes, and other branding elements.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveChanges} size="lg" disabled={loading}>
          <Save className="mr-2 h-5 w-5" /> {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
