
import type { HomePageContent, ServicesPageContent, AboutPageContent, ContactPageContentNew, FooterContent, OfficeDetails } from './types';

export let homePageContentData: HomePageContent = {
  hero: {
    slides: [
      {
        titleLines: [
          "Your one-stop business platform for Nigerians and Diaspora:",
          "Enabling business Solutions in Real Estate,",
          "Machinery marketplace, manufacturing and",
          "Community Projects."
        ],
        cta: { text: "Explore Real Estate", href: "/properties" },
        backgroundImageUrl: "https://placehold.co/1920x1080.png",
        backgroundImageAlt: "Modern cityscape with green spaces",
      },
      {
        titleLines: ["Power Your Projects"],
        subtitle: "Discover a vast marketplace for quality new and used industrial & agricultural machinery.",
        cta: { text: "Explore Machinery", href: "/services#machinery" },
        backgroundImageUrl: "https://placehold.co/1920x1081.png",
        backgroundImageAlt: "Heavy construction machinery at a site",
      },
      {
        titleLines: ["Building the Future, Together"],
        subtitle: "Partner with us for innovative and sustainable development projects across various sectors.",
        cta: { text: "View Developments", href: "/services#development" },
        backgroundImageUrl: "https://placehold.co/1920x1082.png",
        backgroundImageAlt: "Architectural model of a new development",
      },
      {
        titleLines: ["Investing in Our Communities"],
        subtitle: "Join our community-centric initiatives focused on health, education, and infrastructure.",
        cta: { text: "Learn About Community", href: "/services#community" },
        backgroundImageUrl: "https://placehold.co/1920x1083.png",
        backgroundImageAlt: "Community members working together on a project",
      }
    ]
  },
  ourServices: {
    title: "Our Services",
    subtitle: "Explore vast collection of properties, machinery, development, and community project opportunities to find the perfect fit for your specific needs and goals.",
    items: [
      {
        iconName: "Home",
        title: "Real Estate Listing",
        description: "Discover prime real estate with expert guidance tailored to your needs. Whether buying, selling, or managing, we help maximize your investment in luxurious homes or high-potential commercial properties. Unlock your real estate potential with us.",
      },
      {
        iconName: "Wrench",
        title: "Machinery marketplace",
        description: "Welcome to the marketplace for top-quality industrial machinery! Discover new and used equipment, including construction, manufacturing, and agricultural machinery, with competitive prices and warranties. Upgrade your operations today and power your success!",
      },
      {
        iconName: "ClipboardList",
        title: "Development projects",
        description: "At Homeland Capital, we provide expert guidance in real estate, machinery transactions, and development projects. Our tailored solutions ensure successful outcomes across all ventures. Committed to transparency and excellence, we are your top choice for exceptional service.",
      },
      {
        iconName: "Users",
        title: "Community projects",
        description: "Our Community Projects enhance well-being through health programs, educational support, and nutrition packages. We also Improve access to essential utilities like clean water and electricity. These initiatives empower individuals and strengthen communities.",
      }
    ]
  },
  findYourHome: {
    title: "Find your new home with us",
    subtitle: "With accelerated growth of sales targets, we register new clients to the one of the industry faster within 3 years.",
    features: [
      { iconName: "Home", text: "Sell your home", subtext: "Free service" },
      { iconName: "Search", text: "Buy a home", subtext: "Free service" },
      { iconName: "KeyRound", text: "Ownership", subtext: "Free service" }
    ],
    imageUrl: "https://placehold.co/600x450.png",
    imageAlt: "Construction worker on site with concrete slabs",
    cta: { text: "Search Properties", href: "/properties" }
  },
  developmentProjects: {
    title: "Discover our development Projects",
    subtitle: "Get ready for seamless solutions.",
    description: "We expertly manage development projects for various sectors, agriculture, and manufacturing, ensuring proficient planning, timely execution, and adherence to quality and budget standards.",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Architectural blueprints and plans",
    cta: { text: "Explore Projects", href: "/services#development" },
    imagePosition: 'right',
  },
  communityOutreach: {
    title: "Discover our Community project Outreach",
    subtitle: "Get ready for seamless solutions.",
    description: "At Homeland Capital, we are dedicated to community development that drives meaningful long-term growth and impacts the lives of the communities we serve.",
    imageUrl: "https://placehold.co/600x400.png",
    imageAlt: "Row of yellow construction tractors",
    cta: { text: "Explore Projects", href: "/services#community" },
    imagePosition: 'left',
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
    },
    regionalOffice: {
      tabName: "Regional Office",
      name: "Downtown Conference Center",
      address: "157 William St, New York, NY 10038\nUnited States",
      phone: "+1 (212) 555-1234",
      email: "regional@homelandcapitalsolution.com",
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
  builtWithText: ""
};
