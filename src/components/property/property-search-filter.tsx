
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchFilters {
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
}

interface PropertySearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
}

const PropertySearchFilter = ({ onSearch }: PropertySearchFilterProps) => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ location, propertyType, minPrice, maxPrice });
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Search className="w-6 h-6 mr-2 text-primary" />
          Find Your Dream Property
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="location"
                type="text"
                placeholder="City, Neighborhood, Zip Code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-foreground mb-1">Property Type</label>
            <Select
              value={propertyType}
              onValueChange={(selectedValue) => {
                if (selectedValue === "__any__") {
                  setPropertyType("");
                } else {
                  setPropertyType(selectedValue);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <Home className="h-5 w-5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">Any Type</SelectItem>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-foreground mb-1">Min Price</label>
               <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-foreground mb-1">Max Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full lg:w-auto">
            <Search className="w-5 h-5 mr-2" /> Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertySearchFilter;
