// src/app/admin/dashboard/machinery-setup/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Database, ArrowRight, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

const sqlScript = `-- Create an enum type for machinery condition
CREATE TYPE public.machinery_condition_enum AS ENUM ('New', 'Used', 'Refurbished');

-- Create the machinery table
CREATE TABLE public.machinery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    human_readable_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    "year" INTEGER,
    condition public.machinery_condition_enum NOT NULL,
    price BIGINT NOT NULL,
    location_city TEXT NOT NULL,
    state public.nigerian_state_enum NOT NULL,
    images JSONB,
    specifications JSONB,
    agent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status public.property_status_enum NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments for clarity
COMMENT ON COLUMN public.machinery.specifications IS 'Store key-value pairs for machinery specs, e.g., {"Horsepower": "200", "Operating Weight": "5000kg"}';

-- Enable Row Level Security
ALTER TABLE public.machinery ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- Allow public read access to approved machinery
CREATE POLICY "Allow public read access to approved machinery"
ON public.machinery
FOR SELECT
USING (status = 'approved');

-- Allow agents to insert their own machinery
CREATE POLICY "Allow agents to insert their own machinery"
ON public.machinery
FOR INSERT
WITH CHECK (auth.uid() = agent_id AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'agent');

-- Allow agents to view their own machinery
CREATE POLICY "Allow agents to view their own machinery"
ON public.machinery
FOR SELECT
USING (auth.uid() = agent_id);

-- Allow agents to update their own machinery if it is not approved
CREATE POLICY "Allow agents to update their own machinery"
ON public.machinery
FOR UPDATE
USING (auth.uid() = agent_id AND status <> 'approved')
WITH CHECK (auth.uid() = agent_id);

-- Allow agents to delete their rejected machinery
CREATE POLICY "Allow agents to delete their rejected machinery"
ON public.machinery
FOR DELETE
USING (auth.uid() = agent_id AND status = 'rejected');

-- Allow platform admins full access
CREATE POLICY "Allow platform admins full access"
ON public.machinery
FOR ALL
USING (is_platform_admin())
WITH CHECK (is_platform_admin());`;

const typeGenCommand = 'npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts';

export default function MachinerySetupPage() {
    const { toast } = useToast();

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: 'Copied to Clipboard!',
                description: `${type} has been copied.`,
            });
        }).catch(err => {
            toast({
                title: 'Copy Failed',
                description: `Could not copy ${type}. Please copy it manually.`,
                variant: 'destructive',
            });
            console.error('Failed to copy text: ', err);
        });
    };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center"><Wrench className="mr-3 h-8 w-8 text-primary"/>Machinery Marketplace Setup</CardTitle>
          <CardDescription>
            Follow these two steps to set up the database for the new Machinery Marketplace feature.
          </CardDescription>
        </CardHeader>
      </Card>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>Step 1: Create the Machinery Table</AlertTitle>
        <AlertDescription>
          Copy the SQL script below and run it in the <strong>SQL Editor</strong> in your Supabase dashboard. This will create the new 'machinery' table and set up the necessary security policies.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Machinery Table SQL Script</CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(sqlScript, 'SQL Script')}>
                    <Copy className="h-4 w-4 mr-2" /> Copy SQL
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
            <code>{sqlScript}</code>
          </pre>
        </CardContent>
      </Card>

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Step 2: Update Application Types</AlertTitle>
        <AlertDescription>
          After the SQL script runs successfully, you must update your application's type definitions. Run the command below in your project's terminal.
          <br/>
          <strong>Remember to replace `YOUR_PROJECT_ID` with your actual Supabase project ID.</strong>
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Type Generation Command</CardTitle>
                 <Button variant="outline" size="sm" onClick={() => copyToClipboard(typeGenCommand, 'Command')}>
                    <Copy className="h-4 w-4 mr-2" /> Copy Command
                </Button>
            </div>
        </CardHeader>
        <CardContent>
             <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
                <code>{typeGenCommand}</code>
            </pre>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            Next Steps <ArrowRight className="ml-2 h-6 w-6"/>
          </CardTitle>
          <CardDescription>
            Once you have completed both steps above, let me know, and I will proceed to build the user interface for adding and viewing machinery.
          </CardDescription>
        </CardHeader>
      </Card>

    </div>
  );
}
