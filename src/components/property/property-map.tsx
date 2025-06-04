
'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  coordinates: { lat: number; lng: number };
  title: string;
}

const PropertyMap = ({ coordinates, title }: PropertyMapProps) => {
  if (GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_PLACEHOLDER") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary" /> Location Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Google Maps API Key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            The map functionality is disabled until a valid API key is provided. You can obtain one from the Google Cloud Console.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
           <MapPin className="w-5 h-5 mr-2 text-primary" /> Location Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }} className="rounded-md overflow-hidden border">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={coordinates}
              defaultZoom={15}
              mapId="homelandcapital-map" // Changed mapId
              gestureHandling={'greedy'}
              disableDefaultUI={true}
            >
              <AdvancedMarker position={coordinates} title={title} />
            </Map>
          </APIProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyMap;

