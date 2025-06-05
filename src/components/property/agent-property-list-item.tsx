
'use client';

import type { Property, PlatformSettings } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, BedDouble, Bath, Building2, Maximize, Eye, Edit3, Trash2, Star, AlertTriangle, CheckCircle, XCircle, MessageSquare, Hash, ListChecks, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AgentPropertyListItemProps {
  property: Property;
  onOpenDeleteDialog: (property: Property) => void;
  onOpenPromoteDialog: (property: Property) => void;
  platformSettings: PlatformSettings | null; // Pass platform settings for promotion button logic
}

const AgentPropertyListItem = ({ property, onOpenDeleteDialog, onOpenPromoteDialog, platformSettings }: AgentPropertyListItemProps) => {
  const defaultImage = 'https://placehold.co/600x400.png?text=No+Image';
  const displayImage = property.images && property.images.length > 0 ? property.images[0] : defaultImage;

  const getStatusBadgeVariant = (status: Property['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: Property['status']) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'approved': return <CheckCircle className="h-3 w-3 mr-1 text-green-600" />;
      case 'rejected': return <XCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full group">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative w-full sm:w-48 h-48 sm:h-36 rounded-md overflow-hidden shrink-0">
          <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
            <Image
              src={displayImage}
              alt={property.title}
              layout="fill"
              objectFit="cover"
              className="hover:scale-105 transition-transform"
              data-ai-hint="house exterior building"
            />
          </Link>
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant={getStatusBadgeVariant(property.status)} className="capitalize flex items-center text-xs px-2 py-0.5 w-fit">
              {getStatusIcon(property.status)} {property.status}
            </Badge>
            {property.is_promoted && property.promotion_tier_name && (
              <Badge variant="default" className="bg-yellow-500 text-black hover:bg-yellow-600 capitalize flex items-center text-xs px-2 py-0.5 w-fit">
                <Star className="h-3 w-3 mr-1" /> {property.promotion_tier_name}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
            <h2 className="text-xl font-headline mb-1 hover:text-primary transition-colors line-clamp-2">
              {property.title}
            </h2>
          </Link>
          <div className="flex items-center text-xs text-muted-foreground mb-0.5">
            <Hash className="w-3 h-3 mr-1" /> {property.human_readable_id || property.id.substring(0,8) + '...'}
          </div>
          <div className="flex items-center text-muted-foreground text-sm mb-1">
            <MapPin className="w-4 h-4 mr-1 shrink-0" />
            {property.location_area_city}, {property.state}
          </div>
          <div className="flex items-center text-muted-foreground text-sm mb-2">
            <Building2 className="w-4 h-4 mr-1 shrink-0" />
            {property.property_type} - <span className="font-semibold text-accent ml-1">₦{property.price.toLocaleString()}</span>
          </div>
          {property.status === 'rejected' && property.rejection_reason && (
            <p className="text-xs text-destructive mt-0 mb-2 flex items-start" title={property.rejection_reason}>
              <MessageSquare className="h-3 w-3 mr-1 mt-0.5 shrink-0"/>
              <span className="truncate">Rejection: {property.rejection_reason}</span>
            </p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground mb-2">
            <div className="flex items-center"><BedDouble className="w-3 h-3 mr-1 text-accent shrink-0" /> {property.bedrooms} Beds</div>
            <div className="flex items-center"><Bath className="w-3 h-3 mr-1 text-accent shrink-0" /> {property.bathrooms} Baths</div>
            {property.area_sq_ft && (
              <div className="flex items-center"><Maximize className="w-3 h-3 mr-1 text-accent shrink-0" /> {property.area_sq_ft} sq ft</div>
            )}
             <div className="flex items-center text-muted-foreground"><span className="mr-1">Created:</span>{format(new Date(property.created_at), "dd MMM yy")}</div>
             <div className="flex items-center text-muted-foreground"><span className="mr-1">Updated:</span>{format(new Date(property.updated_at), "dd MMM yy")}</div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild title="View Public Listing (if approved)" disabled={property.status !== 'approved'}>
              <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" title="Edit Listing (Not Implemented)" disabled>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onOpenDeleteDialog(property)}
              title="Delete Listing"
              disabled={property.status === 'pending' || property.status === 'approved'}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
             {!property.is_promoted && (
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                onClick={() => onOpenPromoteDialog(property)}
                disabled={property.status !== 'approved' || !platformSettings?.promotionsEnabled}
                title={!platformSettings?.promotionsEnabled ? "Promotions are currently disabled" : "Promote this listing"}
              >
                <Star className="h-4 w-4 mr-1.5" /> Promote
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPropertyListItem;
