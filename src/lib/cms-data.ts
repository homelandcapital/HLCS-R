
import type { HomePageContent, ServicesPageContent, AboutPageContent, ContactPageContentNew, FooterContent, OfficeDetails } from './types';

// Changed from const to let to allow modification at runtime for CMS demo
export let homePageContentData: HomePageContent = {
  hero: {
    title: "Welcome to Homeland Capital",
    subtitle: "Discover your next property or list your own with a partner dedicated to innovation, transparency, and your success in the real estate market.",
    cta: { text: "View Our Listings", href: "/properties" },
    imageUrl: "https://placehold.co/1200x600.png",
    imageAlt: "Lagos skyline or beautiful Nigerian homes",
    imageAiHint: "lagos skyline nigerian homes",
  },
  servicesSection: {
    title: "Our Core Services",
    items: [
      {
        iconName: "Search",
        title: "Property Sales & Purchases",
        description: "Navigate the market with ease, whether buying your dream home or selling your current property.",
        link: "/services",
        ctaText: "Learn More"
      },
      {
        iconName: "BarChartHorizontalBig",
        title: "Expert Property Listings",
        description: "Showcase your properties to a wide audience with our advanced listing platform and tools.",
        link: "/services",
        ctaText: "Learn More"
      },
      {
        iconName: "Handshake",
        title: "Market Insights",
        description: "Make informed decisions with our comprehensive market analysis and expert guidance.",
        link: "/services",
        ctaText: "Learn More"
      }
    ]
  },
  whyChooseUsSection: {
    title: "Why Choose Homeland Capital?",
    items: [
      {
        iconName: "Lightbulb",
        title: "Technology Driven",
        description: "Leveraging cutting-edge tech for a seamless real estate experience."
      },
      {
        iconName: "Users",
        title: "Client-Focused Approach",
        description: "Your needs are our priority. We're dedicated to your success."
      },
      {
        iconName: "Award",
        title: "Trusted Expertise",
        description: "Years of experience and deep market knowledge at your service."
      }
    ]
  },
  ctaSection: {
    title: "Ready to Find Your Perfect Property?",
    subtitle: "Start your journey with us today. Browse listings, connect with experts, and make your real estate goals a reality.",
    cta: { text: "Explore Properties Now", href: "/properties" }
  }
};

export let servicesPageContentData: ServicesPageContent = {
  pageTitle: "Our Services - Homeland Capital",
  headerTitle: "Our Services",
  introParagraph: "At Homeland Capital, we offer a comprehensive suite of services to meet all your real estate needs.",
  services: [
    {
      title: "Property Sales & Purchases",
      description: "Whether you're buying your dream home or selling your current property, our expert agents are here to guide you through every step of the process, ensuring a smooth and successful transaction."
    },
    {
      title: "Property Listings",
      description: "We provide a robust platform for agents to list properties, reaching a wide audience of potential buyers. Our tools help showcase your listings in the best possible light."
    },
    {
      title: "Market Analysis",
      description: "Stay informed with our up-to-date market analysis and insights, helping you make educated decisions whether you're buying, selling, or investing."
    },
    {
      title: "Personalized Dashboards",
      description: "Tailored dashboards for users, agents, and administrators to manage properties, inquiries, and platform settings efficiently."
    }
  ],
  conclusionParagraph: "More details about our specific service packages and offerings will be available here soon."
};

export let aboutPageContentData: AboutPageContent = {
  pageTitle: "About Us - Homeland Capital",
  heroSection: {
    title: "Building better futures through quality homes, robust machinery, impactful development, and community-driven projects",
    paragraphs: [
      "At Homeland Capital, our goal is to provide exceptional service across various sectors, including real estate, the machinery marketplace, community projects, and development projects.",
      "We strive to be the top choice for clients seeking expert guidance, offering tailored solutions to meet their unique needs.",
      "Our team of professionals brings extensive expertise to every venture, ensuring successful outcomes whether in buying, selling, or investing in real estate, facilitating machinery transactions, or managing community and development projects. We are committed to transparency, personalized attention, and delivering results that exceed expectations."
    ],
    imageUrl: "https://placehold.co/800x600.png",
    imageAlt: "Modern building architecture",
    imageAiHint: "modern architecture building",
    badgeText: "99%\nTop Sales"
  },
  servicesSection: {
    title: "Our Services",
    subtitle: "Explore all the different types of properties so you can choose the best option for you.",
    items: [
      {
        iconName: "Home",
        title: "Real Estate Listing",
        description: "Discover prime real estate with expert guidance tailored to your needs. Whether buying, selling, or managing, we help maximize your investment in luxurious homes or high-potential commercial properties. Unlock your real estate potential with us."
      },
      {
        iconName: "Wrench",
        title: "Machinery marketplace",
        description: "Welcome to the marketplace for top-quality industrial machinery! Discover new and used equipment, including construction, manufacturing, and agricultural machinery, with competitive prices and warranties. Upgrade your operations today and power your success!"
      },
      {
        iconName: "Building2",
        title: "Development projects",
        description: "At Homeland Capital, we provide expert guidance in real estate, machinery transactions, and development projects. Our tailored solutions ensure successful outcomes across all ventures. Committed to transparency and excellence, we are your top choice for exceptional service."
      },
      {
        iconName: "Users",
        title: "Community projects",
        description: "Our Community Projects enhance well-being through health programs, educational support, and nutrition packages. We also Improve access to essential utilities like clean water and electricity. These initiatives empower individuals and strengthen communities."
      }
    ]
  }
};

// Updated Contact Page Content Structure
export let contactPageContentData: ContactPageContentNew = {
  pageTitle: "Contact Us - Homeland Capital",
  headerTitle: "Contact Us",
  headerSubtitle: "Have questions or want to discuss a potential opportunity? We're here to help. Reach out to our team using any of the methods below.",
  formSection: {
    title: "Send Us a Message",
    inquiryTypes: ["General", "Investment", "Property", "Partnership"],
  },
  officesSection: {
    title: "Our Offices",
    headquarters: {
      tabName: "Headquarters",
      name: "Homeland Capital Solution HQ",
      address: "123 Finance Street, Suite 500\nNew York, NY 10001\nUnited States",
      phone: "+1 (212) 555-7890",
      email: "info@homelandcapitalsolution.com",
      mapCoordinates: { lat: 40.7061, lng: -74.0088 }, // Approx. Financial District
      mapTitle: "Homeland Capital HQ"
    },
    regionalOffice: {
      tabName: "Regional Office",
      name: "Downtown Conference Center", // Using example from image
      address: "157 William St, New York, NY 10038\nUnited States",
      phone: "+1 (212) 555-1234", // Example phone
      email: "regional@homelandcapitalsolution.com", // Example email
      mapCoordinates: { lat: 40.7095, lng: -74.0055 }, // Approx. 157 William St
      mapTitle: "Downtown Conference Center"
    }
  },
  businessHoursSection: {
    title: "Business Hours",
    hours: [
      { day: "Monday - Friday", time: "9:00 AM - 6:00 PM" },
      { day: "Saturday", time: "10:00 AM - 2:00 PM" },
      { day: "Sunday", time: "Closed" }
    ]
  },
  investorRelationsSection: {
    title: "Investor Relations",
    description: "For investor-specific inquiries, please contact our Investor Relations department directly:",
    email: "investors@homelandcapitalsolution.com",
    phone: "+1 (212) 555-8901"
  }
};


export let footerContentData: FooterContent = {
  tagline: "Your partner in finding the perfect property.",
  columns: [
    {
      title: "Company",
      links: [
        { text: "About Us", href: "/about" },
        { text: "Contact Us", href: "/contact" }
      ]
    },
    {
      title: "Resources",
      links: [
        { text: "Guides", href: "#" },
        { text: "FAQ", href: "#" },
        { text: "Support Center", href: "#" },
        { text: "Site Map", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { text: "Privacy Policy", href: "#" },
        { text: "Terms of Service", href: "#" },
        { text: "Cookie Policy", href: "#" }
      ]
    }
  ],
  copyrightText: `© ${new Date().getFullYear()} Homeland Capital. All rights reserved.`,
  builtWithText: "Built with Next.js, Tailwind CSS, and ShadCN UI."
};

    
