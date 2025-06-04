
// src/app/admin/dashboard/settings/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Palette, Bell, Shield, Home, ListPlus, KeyRound, CreditCard, Paintbrush, SlidersHorizontal, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

export default function PlatformSettingsPage() {
  const { toast } = useToast();
  // Mock states for settings - in a real app, these would be fetched and updated via API
  const [siteName, setSiteName] = useState('Homeland Capital');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('NGN');
  const [notificationEmail, setNotificationEmail] = useState('admin@homelandcapital.com');
  const [predefinedAmenities, setPredefinedAmenities] = useState("Pool, Garage, Gym, Air Conditioning, Balcony, Hardwood Floors, Borehole, Standby Generator, Security Post");

  // New state for promotion settings
  const [promotionsEnabled, setPromotionsEnabled] = useState(true);
  const [promotionFee, setPromotionFee] = useState('5000'); // Store as string for easier input handling
  const [promotionDuration, setPromotionDuration] = useState('7'); // Duration in days

  const handleSaveChanges = () => {
    // Simulate saving changes
    console.log('Saving settings:', { 
      siteName, 
      maintenanceMode, 
      defaultCurrency, 
      notificationEmail, 
      predefinedAmenities,
      promotionsEnabled,
      promotionFee: parseFloat(promotionFee), // Convert to number on save
      promotionDuration: parseInt(promotionDuration, 10) // Convert to number on save
    });
    toast({
      title: 'Settings Saved',
      description: 'Platform settings have been successfully updated (simulated).',
    });
  };

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
            <Star className="mr-2 h-5 w-5 text-muted-foreground" /> Promotion Settings
          </CardTitle>
          <CardDescription>Configure property promotion features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div>
                <Label htmlFor="promotionsEnabled" className="text-base">Enable Property Promotions</Label>
                <p className="text-sm text-muted-foreground">Allow agents to promote their listings for better visibility.</p>
            </div>
            <Switch
              id="promotionsEnabled"
              checked={promotionsEnabled}
              onCheckedChange={setPromotionsEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promotionFee">Promotion Fee (NGN)</Label>
            <Input
              id="promotionFee"
              type="number"
              value={promotionFee}
              onChange={(e) => setPromotionFee(e.target.value)}
              placeholder="e.g., 5000"
              min="0"
              disabled={!promotionsEnabled}
            />
            <p className="text-xs text-muted-foreground">Cost for an agent to promote a single listing.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="promotionDuration">Promotion Duration (Days)</Label>
            <Input
              id="promotionDuration"
              type="number"
              value={promotionDuration}
              onChange={(e) => setPromotionDuration(e.target.value)}
              placeholder="e.g., 7"
              min="1"
              disabled={!promotionsEnabled}
            />
            <p className="text-xs text-muted-foreground">How long a promotion will last, in days.</p>
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
              placeholder="Enter comma-separated amenities, e.g., Pool, Garage, Gym"
              rows={3}
              disabled // For now, keep it simple. Full implementation would be complex.
            />
            <p className="text-xs text-muted-foreground">
              (Placeholder) Define a list of standard amenities. In a full implementation, these could become selectable options for agents. Currently, this field is for display only.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyTypes">Manage Property Types</Label>
            <Input
              id="propertyTypes"
              placeholder="e.g., House, Apartment, Condo, Commercial, Land"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              (Placeholder) Manage available property types. Current types are: House, Apartment, Condo, Townhouse, Land. This setting is a placeholder for a more complex feature.
            </p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="customFields">Manage Custom Fields for Properties</Label>
             <Button variant="outline" disabled className="w-full justify-start">
              <ListPlus className="mr-2 h-4 w-4" /> Define Custom Fields (Placeholder)
            </Button>
            <p className="text-xs text-muted-foreground">
              (Placeholder) Allow defining additional custom fields for property listings (e.g., Pet Policy: Yes/No). This setting is a placeholder for a more complex feature.
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
        <Button onClick={handleSaveChanges} size="lg">
          <Save className="mr-2 h-5 w-5" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
