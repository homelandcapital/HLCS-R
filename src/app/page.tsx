
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Search, Handshake, BarChartHorizontalBig, Lightbulb, Users, ArrowRight } from 'lucide-react';

export default function InformationalHomePage() {
  const services = [
    {
      icon: <Search className="w-10 h-10 text-primary mb-4" />,
      title: "Property Sales & Purchases",
      description: "Navigate the market with ease, whether buying your dream home or selling your current property.",
      link: "/services"
    },
    {
      icon: <BarChartHorizontalBig className="w-10 h-10 text-primary mb-4" />,
      title: "Expert Property Listings",
      description: "Showcase your properties to a wide audience with our advanced listing platform and tools.",
      link: "/services"
    },
    {
      icon: <Handshake className="w-10 h-10 text-primary mb-4" />,
      title: "Market Insights",
      description: "Make informed decisions with our comprehensive market analysis and expert guidance.",
      link: "/services"
    }
  ];

  const whyChooseUs = [
    {
      icon: <Lightbulb className="w-8 h-8 text-accent" />,
      title: "Technology Driven",
      description: "Leveraging cutting-edge tech for a seamless real estate experience."
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Client-Focused Approach",
      description: "Your needs are our priority. We're dedicated to your success."
    },
    {
      icon: <Award className="w-8 h-8 text-accent" />,
      title: "Trusted Expertise",
      description: "Years of experience and deep market knowledge at your service."
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0">
          <Image
            src="https://placehold.co/1200x600.png"
            alt="Modern cityscape or beautiful homes"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
            data-ai-hint="modern architecture cityscape"
            priority
          />
           <div className="absolute inset-0 bg-background/50"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-6">
            Welcome to Homeland Capital
          </h1>
          <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto mb-8">
            Discover your next property or list your own with a partner dedicated to innovation, transparency, and your success in the real estate market.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg">
            <Link href="/properties">
              View Our Listings <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline text-center text-foreground mb-12">Our Core Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto flex items-center justify-center">
                  {service.icon}
                </div>
                <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <Button variant="outline" asChild>
                  <Link href={service.link}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center text-foreground mb-12">Why Choose Homeland Capital?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
                {item.icon}
                <h3 className="text-xl font-semibold text-primary mt-3 mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 text-center py-12">
        <h2 className="text-3xl font-headline text-foreground mb-6">Ready to Find Your Perfect Property?</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Start your journey with us today. Browse listings, connect with experts, and make your real estate goals a reality.
        </p>
        <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg">
          <Link href="/properties">
            Explore Properties Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
