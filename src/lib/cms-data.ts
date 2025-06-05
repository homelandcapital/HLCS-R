
import type { HomePageContent, ServicesPageContent, AboutPageContent, ContactPageContent, FooterContent } from './types';

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
  pageTitle: "About Homeland Capital",
  headerTitle: "About Homeland Capital",
  introParagraph: "Homeland Capital is dedicated to simplifying the real estate experience through technology and exceptional service.",
  sections: [
    {
      iconName: "Info",
      title: "Our Mission",
      description: "To empower individuals and real estate professionals by providing an intuitive, efficient, and comprehensive platform for all property-related needs. We strive to connect buyers, sellers, and agents seamlessly, fostering a transparent and trustworthy real estate marketplace."
    },
    {
      iconName: "Users",
      title: "Who We Are",
      description: "Homeland Capital was founded by a team of passionate technologists and real estate experts who believe in the power of innovation to transform the property market. We are committed to continuous improvement and delivering value to our users."
    },
    {
      iconName: "Building",
      title: "Our Vision",
      description: "To be the leading online real estate platform, recognized for our cutting-edge technology, user-centric design, and unwavering commitment to integrity and customer satisfaction. We aim to make finding, buying, and selling property an enjoyable and rewarding experience for everyone involved."
    }
  ],
  conclusionParagraph: "More detailed information about our company history, team, and values will be added soon."
};

export let contactPageContentData: ContactPageContent = {
  pageTitle: "Contact Us - Homeland Capital",
  headerTitle: "Get In Touch",
  headerDescription: "We'd love to hear from you! Whether you have a question about our services, need assistance, or just want to chat, please reach out.",
  contactInfo: {
    email: "info@homelandcapital.com",
    phone: "0801 234 5670",
    address: "Plot 25, Admiralty Way,\nLekki Phase 1, Lagos, Nigeria",
    officeHours: {
      weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
      saturday: "Saturday: 10:00 AM - 4:00 PM",
      sunday: "Closed"
    }
  }
};

export let footerContentData: FooterContent = {
  tagline: "Your partner in finding the perfect property.",
  columns: [
    {
      title: "Company",
      links: [
        { text: "About Us", href: "/about" },
        // { text: "Careers", href: "#" }, // Removed
        // { text: "Blog", href: "#" }, // Removed
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

