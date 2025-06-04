
// src/app/admin/dashboard/settings/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Palette, Bell, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PlatformSettingsPage() {
  const { toast } = useToast();
  // Mock states for settings - in a real app, these would be fetched and updated via API
  const [siteName, setSiteName] = useState('Homeland Capital');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [notificationEmail, setNotificationEmail] = useState('admin@homelandcapital.com');

  const handleSaveChanges = () => {
    // Simulate saving changes
    console.log('Saving settings:', { siteName, maintenanceMode, defaultCurrency, notificationEmail });
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


      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveChanges} size="lg">
          <Save className="mr-2 h-5 w-5" /> Save Changes
        </Button>
      </div>

      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More advanced settings and integrations are planned for future updates. This may include:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
            <li>API key management for third-party services</li>
            <li>Email template customization</li>
            <li>Payment gateway integration</li>
            <li>Custom branding options</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
