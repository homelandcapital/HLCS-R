
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
  headerTitle: "Our Comprehensive Services",
  headerSubtitle: "Explore Prime Real Estate, Top Quality Machinery, Expert Development Projects, and Transformative Community Initiatives",
  mainCategories: [
    {
      title: "Real Estate",
      description: "Our Community Projects execute initiatives that improve the well-being and quality of life for residents. These projects typically encompass several key areas: UrbHealth Programs: These programs focus on providing essential health care services, promoting wellness, and preventing diseases within the community. They might include free medical check-ups, vaccination drives, mental health support, and health education workshops. UrbEducation & Skill Training Programs: These programs provide educational opportunities by providing learning resources and materials as well as tools to aid students. This can include donating textbooks, school supplies, and refurbishing classrooms to offer schools the appropriate support to assist in academic achievement. UrbNutrition Support Programs: Addressing food insecurity, these programs provide nutritious food packages to families in need. They often focus on vulnerable populations, ensuring that children, the elderly, and low-income families have access to balanced and wholesome meals. UrbInfrastructure & Development Packages: These initiatives work to improve access to basic utilities such as clean water, electricity, and sanitation. Projects might include the development of infrastructure such as building wells, installing solar panels, or improving waste management systems, to create a more comfortable and healthy living environment. Together, these community projects foster a holistic approach to improving living standards, empowering individuals and building stronger, more resilient communities."
    },
    {
      title: "Machinery Marketplace",
      description: "Access a wide range of industrial and agricultural machinery. We connect buyers and sellers, ensuring fair prices and reliable equipment. From construction tools to farming implements, find what you need to power your operations."
    },
    {
      title: "Development Project",
      description: "We manage and execute development projects from conception to completion. Our expertise covers residential, commercial, and mixed-use developments, focusing on quality, sustainability, and timely delivery."
    },
    {
      title: "Community Project",
      description: "Homeland Capital is committed to social responsibility. Our community projects focus on sustainable development, education, healthcare, and infrastructure improvements, aiming to uplift and empower local communities."
    }
  ],
  propertyVerificationSection: {
    title: "Let us perform a comprehensive property verification for your real estate investments, anywhere in Nigeria.",
    subtitle: "Avoid/Mitigate identifiable risks:",
    items: [
      { iconName: "FileWarning", title: "Avoid Fake Certificates", description: "Secure your Certificates of Occupancy are genuine and legally valid." },
      { iconName: "SearchX", title: "Detect Fake Allocations", description: "Identify and avoid improperly allocated land to prevent loss of investment." },
      { iconName: "ShieldOff", title: "Prevent Encumbrances", description: "Verify property details are free from encumbrances, claim ownership and titles." },
      { iconName: "HardHat", title: "Avoid Defective Structures", description: "Check buildings for structural integrity and avoid defective constructions." },
      { iconName: "Waves", title: "Ascertain Flooding Issues", description: "Assess property for susceptibility to flooding and soil concentrations." },
      { iconName: "KeyRound", title: "Authenticate Ownership", description: "Verify and authenticate property ownership to ensure legitimate transactions." }
    ]
  },
  detailedVerificationSection: {
    title: "Any Potential Scams of Your Investments",
    subtitle: "Our Property Verification Service Includes:",
    items: [
      { iconName: "ClipboardList", title: "Comprehensive Inspections", description: "Perform detailed land inspections and field records." },
      { iconName: "FileCheck2", title: "Document Corroboration", description: "Corroborate document details with actual site location." },
      { iconName: "LocateFixed", title: "Survey Coordination", description: "Coordinate probing or the Surveyor General's office." },
      { iconName: "FileText", title: "Document Examination", description: "Examine documents comprehensively for legal compliance." },
      { iconName: "Landmark", title: "Compliance Checks", description: "Check compliance with government policies to requirements." },
      { iconName: "ScanSearch", title: "Title Verification", description: "Verify completeness of title, discover root and encumbrances." },
      { iconName: "ShieldCheck", title: "Ownership Authentication", description: "Authenticate property titles and ownership details." },
      { iconName: "Coins", title: "Tax Checks", description: "Check levies and collateral issues." },
      { iconName: "Users2", title: "Dispute Detection", description: "Detect inherent disputes of ownership, conflicts." },
      { iconName: "ClipboardCheck", title: "Structural Assessment", description: "Assess impacts and likely structural conditions." },
      { iconName: "CloudRain", title: "Flood Risk Evaluation", description: "Evaluate susceptibility to flooding." },
      { iconName: "FileArchive", title: "Document Confirmation", description: "Confirm documents and correlate with structure." },
      { iconName: "MapPinned", title: "Land Use Rectification", description: "Verify alignment with land use and master plans." },
      { iconName: "Building", title: "Plan Conformity", description: "Check building plans for conformity." },
      { iconName: "Ruler", title: "Space Measurement", description: "Measure site and space dimensions." },
      { iconName: "Scale", title: "Value Assessment", description: "Assess property value for negotiation." },
      { iconName: "Leaf", title: "Environmental Assessment", description: "Perform environmental risk assessment." },
      { iconName: "LandPlot", title: "Encumbrance Checks", description: "Check for overlooked liens and any land use." },
      { iconName: "Handshake", title: "Negotiation Management", description: "Manage project negotiations." },
      { iconName: "UserCheck", title: "Citizen Authentication", description: "Authenticate known Citizen's documents." },
      { iconName: "FileSignature", title: "Contract Preparation", description: "Prepare and review relevant documents." },
      { iconName: "Library", title: "Title Perfection", description: "Perfect title documents post-transaction." }
    ]
  },
  cta: { text: "Get in Touch", href: "/contact" }
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

    

    
