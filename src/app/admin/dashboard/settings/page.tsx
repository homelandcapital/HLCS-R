
// src/app/admin/dashboard/settings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Palette, Bell, Shield, Home, ListPlus, KeyRound, CreditCard, Paintbrush, SlidersHorizontal, Star, TrendingUp, Zap, Gem, Eye, Package, Users, Users2 as CommunityIcon, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import type { PromotionTierConfig, PlatformSettings as PlatformSettingsType, SectorKey, SectorVisibility } from '@/lib/types';
import { managedSectorKeys } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { useAuth } from '@/contexts/auth-context';

interface AdminPromotionTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  fee: string;
  duration: string;
  description: string;
}

const initialAdminPromotionTiersUI: AdminPromotionTier[] = [
  { id: 'basic', name: 'Basic Boost', icon: <Star className="h-5 w-5 text-yellow-500" />, fee: '5000', duration: '7', description: 'Standard visibility boost for 7 days.' },
  { id: 'premium', name: 'Premium Spotlight', icon: <TrendingUp className="h-5 w-5 text-orange-500" />, fee: '12000', duration: '14', description: 'Enhanced visibility and higher placement for 14 days.' },
  { id: 'ultimate', name: 'Ultimate Feature', icon: <Gem className="h-5 w-5 text-purple-500" />, fee: '25000', duration: '30', description: 'Maximum visibility, top of search, and prominent highlighting for 30 days.' },
];

const sectorConfigurations: Array<{ key: SectorKey, label: string, defaultEnabled: boolean, icon: React.ReactNode }> = [
  { key: 'realEstate', label: 'Real Estate Sector (Properties Link)', defaultEnabled: true, icon: <Home className="h-5 w-5"/> },
  { key: 'machinery', label: 'Machinery Marketplace Sector', defaultEnabled: false, icon: <Package className="h-5 w-5"/> },
  { key: 'development', label: 'Development Projects Sector', defaultEnabled: false, icon: <Zap className="h-5 w-5"/> },
  { key: 'community', label: 'Community Projects Sector', defaultEnabled: false, icon: <CommunityIcon className="h-5 w-5"/> },
];


export default function PlatformSettingsPage() {
  const { toast } = useToast();
  const { refreshPlatformSettings } = useAuth();
  const [loading, setLoading] = useState(true);

  const [siteName, setSiteName] = useState('Homeland Capital');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('NGN');
  const [notificationEmail, setNotificationEmail] = useState('admin@homelandcapital.com');

  const [predefinedAmenities, setPredefinedAmenities] = useState("Pool,Garage,Gym");
  const [propertyTypes, setPropertyTypes] = useState("House,Apartment,Land");
  const [machineryCategories, setMachineryCategories] = useState('Construction,Agriculture,Manufacturing,Lifting & Material Handling,Power Generation,Other');
  const [communityProjectCategories, setCommunityProjectCategories] = useState('Water Supply,Education Support,Health Program,Nutrition Support,Other');
  const [developmentProjectCategories, setDevelopmentProjectCategories] = useState('Manufacturing,Energy,Agriculture,Real Estate');

  const [promotionsEnabled, setPromotionsEnabled] = useState(true);
  const [adminPromotionTiers, setAdminPromotionTiers] = useState<AdminPromotionTier[]>(initialAdminPromotionTiersUI);

  const [configuredCommunityTiersString, setConfiguredCommunityTiersString] = useState('Small Scale Projects,Mid-Range Initiatives,Large Impact Efforts');

  const [sectorVisibility, setSectorVisibility] = useState<SectorVisibility>({});

  const fetchLocalPageSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') { 
      toast({ title: 'Error Fetching Settings', description: `Could not load platform settings: ${error.message}. Using defaults.`, variant: 'destructive' });
    }
    
    const settingsData = data || {};

    setSiteName(settingsData.site_name || 'Homeland Capital');
    setMaintenanceMode(settingsData.maintenance_mode || false);
    setDefaultCurrency(settingsData.default_currency || 'NGN');
    setNotificationEmail(settingsData.notification_email || 'admin@homelandcapital.com');
    setPredefinedAmenities((settingsData.predefined_amenities as string || "Pool,Garage,Gym"));
    setPropertyTypes((settingsData.property_types as string[] || ['House', 'Apartment', 'Land']).join(','));
    setMachineryCategories(settingsData.machinery_categories || 'Construction,Agriculture,Manufacturing,Lifting & Material Handling,Power Generation,Other');
    setCommunityProjectCategories(settingsData.community_project_categories || 'Water Supply,Education Support,Health Program,Nutrition Support,Other');
    setDevelopmentProjectCategories(settingsData.development_project_categories || 'Manufacturing,Energy,Agriculture,Real Estate');
    setPromotionsEnabled(settingsData.promotions_enabled ?? true);

    let finalUiPromotionTiers = initialAdminPromotionTiersUI.map(initialTier => ({ ...initialTier }));
    if (settingsData.promotion_tiers) {
        const dbPromotionTiers = settingsData.promotion_tiers as PromotionTierConfig[];
        finalUiPromotionTiers = initialAdminPromotionTiersUI.map(uiTierTemplate => {
            const dbMatch = dbPromotionTiers.find(dbTier => dbTier.id === uiTierTemplate.id);
            return dbMatch ? {
                ...uiTierTemplate,
                name: dbMatch.name,
                fee: dbMatch.fee.toString(),
                duration: dbMatch.duration.toString(),
                description: dbMatch.description,
            } : { ...uiTierTemplate };
        });
    }
    setAdminPromotionTiers(finalUiPromotionTiers);

    setConfiguredCommunityTiersString(settingsData.configured_community_budget_tiers || 'Small Scale Projects,Mid-Range Initiatives,Large Impact Efforts');

    const dbSectorVisibility = settingsData.sector_visibility as SectorVisibility | null;
    const initialVisibilityState: SectorVisibility = {};
    sectorConfigurations.forEach(sector => {
      initialVisibilityState[sector.key] = dbSectorVisibility?.[sector.key] ?? sector.defaultEnabled;
    });
    setSectorVisibility(initialVisibilityState);

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchLocalPageSettings();
  }, [fetchLocalPageSettings]);


  const handlePromotionTierChange = (tierId: string, field: keyof Omit<AdminPromotionTier, 'id' | 'icon'>, value: string) => {
    setAdminPromotionTiers(currentTiers =>
      currentTiers.map(tier =>
        tier.id === tierId ? { ...tier, [field]: value } : tier
      )
    );
  };

  const handleSectorVisibilityChange = (sectorKey: SectorKey, checked: boolean) => {
    setSectorVisibility(prev => ({ ...prev, [sectorKey]: checked }));
  };

  const handleSaveChanges = async () => {
    const settingsToSave: Omit<PlatformSettingsType, 'promotionTiers' | 'sector_visibility' | 'configuredCommunityBudgetTiers' | 'machineryCategories' | 'communityProjectCategories' | 'developmentProjectCategories'> & { promotion_tiers: PromotionTierConfig[], configured_community_budget_tiers: string | null, property_types: string[], machinery_categories: string | null, community_project_categories: string | null, development_project_categories: string | null, sector_visibility: SectorVisibility } & { id: number } = {
      id: 1,
      site_name: siteName,
      maintenance_mode: maintenanceMode,
      default_currency: defaultCurrency,
      notification_email: notificationEmail,
      predefined_amenities: predefinedAmenities,
      property_types: propertyTypes.split(',').map(pt => pt.trim()).filter(Boolean),
      machinery_categories: machineryCategories,
      community_project_categories: communityProjectCategories,
      development_project_categories: developmentProjectCategories,
      promotions_enabled: promotionsEnabled,
      promotion_tiers: adminPromotionTiers.map(tier => ({
        id: tier.id,
        name: tier.name,
        fee: parseFloat(tier.fee) || 0,
        duration: parseInt(tier.duration, 10) || 0,
        description: tier.description,
      })),
      configured_community_budget_tiers: configuredCommunityTiersString,
      sector_visibility: sectorVisibility,
    };

    const { error } = await supabase
      .from('platform_settings')
      .upsert(settingsToSave, { onConflict: 'id' });

    if (error) {
      toast({ title: 'Error Saving Settings', description: `Could not save settings: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Settings Saved', description: 'Platform settings have been successfully updated.' });
      await refreshPlatformSettings();
      fetchLocalPageSettings();
    }
  };

  if (loading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/2 mb-2" />
            <Skeleton className="h-8 w-3/4 mb-6" />
            {[...Array(5)].map((_, i) => (
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
            <Eye className="mr-2 h-5 w-5 text-muted-foreground" /> Navbar Sector Visibility
          </CardTitle>
          <CardDescription>Control which business sectors are visible in the main navigation bar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sectorConfigurations.map((sector) => (
            <div key={sector.key} className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
              <div className="flex items-center">
                {sector.icon && React.cloneElement(sector.icon as React.ReactElement, { className: "mr-2 h-5 w-5 text-muted-foreground"})}
                <Label htmlFor={`sector-${sector.key}`} className="text-base">
                  {sector.label}
                </Label>
              </div>
              <Switch
                id={`sector-${sector.key}`}
                checked={sectorVisibility[sector.key] || false}
                onCheckedChange={(checked) => handleSectorVisibilityChange(sector.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Home className="mr-2 h-5 w-5 text-muted-foreground" /> Real Estate Settings
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
        </CardContent>
      </Card>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Zap className="mr-2 h-5 w-5 text-muted-foreground" /> Property Promotion Tier Settings
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
                        onChange={(e) => handlePromotionTierChange(tier.id, 'name', e.target.value)}
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
                        onChange={(e) => handlePromotionTierChange(tier.id, 'fee', e.target.value)}
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
                        onChange={(e) => handlePromotionTierChange(tier.id, 'duration', e.target.value)}
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
                      onChange={(e) => handlePromotionTierChange(tier.id, 'description', e.target.value)}
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
            <Wrench className="mr-2 h-5 w-5 text-muted-foreground" /> Machinery Settings
          </CardTitle>
          <CardDescription>Configure options related to machinery listings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="machineryCategories">Manage Machinery Categories</Label>
            <Textarea
              id="machineryCategories"
              value={machineryCategories}
              onChange={(e) => setMachineryCategories(e.target.value)}
              placeholder="Enter comma-separated categories, e.g., Construction,Agriculture"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of available machinery categories. These will appear in the machinery category selection dropdown for agents.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <CommunityIcon className="mr-2 h-5 w-5 text-muted-foreground" /> Community Project Settings
          </CardTitle>
          <CardDescription>Define the budget tiers and categories for community projects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="communityProjectCategories">Manage Community Project Categories</Label>
            <Textarea
              id="communityProjectCategories"
              value={communityProjectCategories}
              onChange={(e) => setCommunityProjectCategories(e.target.value)}
              placeholder="Enter comma-separated categories, e.g., Water Supply,Health Program"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of available community project categories.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="communityBudgetTiersText">Manage Budget Tier Names</Label>
            <Textarea
              id="communityBudgetTiersText"
              value={configuredCommunityTiersString}
              onChange={(e) => setConfiguredCommunityTiersString(e.target.value)}
              placeholder="e.g., Small Scale, Mid-Range, Large Impact"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of names for community project budget tiers.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Zap className="mr-2 h-5 w-5 text-muted-foreground" /> Development Project Settings
          </CardTitle>
          <CardDescription>Define the categories for development projects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="developmentProjectCategories">Manage Development Project Categories</Label>
            <Textarea
              id="developmentProjectCategories"
              value={developmentProjectCategories}
              onChange={(e) => setDevelopmentProjectCategories(e.target.value)}
              placeholder="Enter comma-separated categories, e.g., Manufacturing,Energy,Agriculture,Real Estate"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of available development project categories.
            </p>
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

      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveChanges} size="lg" disabled={loading}>
          <Save className="mr-2 h-5 w-5" /> {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

    