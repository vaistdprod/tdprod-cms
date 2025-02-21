import { MedicalSiteConfig, createMedicalTemplate } from '../template';

const pediatricianConfig: MedicalSiteConfig = {
  practiceName: "Sunshine Pediatrics",
  tagline: "Caring for Your Children Like Our Own",
  logo: "/images/pediatrician/logo.png",

  contact: {
    phone: "(555) 123-4567",
    email: "info@sunshinepediatrics.com",
    address: {
      street: "123 Sunshine Boulevard",
      city: "Sunnyville",
      state: "CA",
      zip: "90210",
    },
    socialMedia: {
      facebook: "https://facebook.com/sunshinepediatrics",
      instagram: "https://instagram.com/sunshinepediatrics",
    },
  },

  hours: {
    monday: { open: "08:00", close: "17:00" },
    tuesday: { open: "08:00", close: "17:00" },
    wednesday: { open: "08:00", close: "17:00" },
    thursday: { open: "08:00", close: "17:00" },
    friday: { open: "08:00", close: "16:00" },
    saturday: { open: "09:00", close: "13:00" },
  },

  services: [
    {
      id: "well-child",
      name: "Well-Child Visits",
      description: "Regular check-ups to monitor your child's growth and development",
      duration: 30,
      category: "preventive",
    },
    {
      id: "sick-visits",
      name: "Sick Child Visits",
      description: "Same-day appointments available for ill children",
      duration: 20,
      category: "urgent",
    },
    {
      id: "vaccinations",
      name: "Vaccinations",
      description: "Complete childhood immunization services",
      duration: 15,
      category: "preventive",
    },
    {
      id: "development",
      name: "Developmental Screening",
      description: "Comprehensive developmental assessments",
      duration: 45,
      category: "specialized",
    },
  ],

  team: [
    {
      id: "dr-smith",
      name: "Dr. Sarah Smith",
      title: "Lead Pediatrician",
      specialty: "General Pediatrics",
      image: "/images/pediatrician/dr-smith.jpg",
      bio: "Dr. Smith has been practicing pediatrics for over 15 years...",
      education: [
        "MD from Stanford University",
        "Residency at Children's Hospital Los Angeles",
      ],
      certifications: ["Board Certified in Pediatrics"],
      languages: ["English", "Spanish"],
    },
    {
      id: "dr-patel",
      name: "Dr. Raj Patel",
      title: "Pediatrician",
      specialty: "Pediatric Development",
      image: "/images/pediatrician/dr-patel.jpg",
      bio: "Dr. Patel specializes in child development and behavioral pediatrics...",
      education: [
        "MD from UCLA",
        "Residency at UCSF Benioff Children's Hospital",
      ],
      certifications: [
        "Board Certified in Pediatrics",
        "Developmental-Behavioral Pediatrics Certification",
      ],
      languages: ["English", "Hindi", "Gujarati"],
    },
  ],

  insurance: {
    acceptedProviders: [
      "Blue Cross Blue Shield",
      "Aetna",
      "UnitedHealthcare",
      "Cigna",
      "Kaiser Permanente",
      "Medicaid",
      "CHIP",
    ],
    notes: "Please contact our office to verify your specific insurance plan coverage.",
  },

  appointments: {
    scheduler: {
      title: "Schedule Your Child's Visit",
      description: "Choose from available appointment types and times that work best for you.",
      services: [
        {
          id: "well-child",
          name: "Well-Child Visit",
          duration: 30,
        },
        {
          id: "sick-visit",
          name: "Sick Visit",
          duration: 20,
        },
        {
          id: "vaccination",
          name: "Vaccination",
          duration: 15,
        },
      ],
      doctors: [
        {
          id: "dr-smith",
          name: "Dr. Sarah Smith",
          specialty: "General Pediatrics",
          availability: {
            days: ["mon", "tue", "wed", "thu"],
            hours: [{ start: "08:00", end: "17:00" }],
          },
        },
        {
          id: "dr-patel",
          name: "Dr. Raj Patel",
          specialty: "Pediatric Development",
          availability: {
            days: ["wed", "thu", "fri"],
            hours: [{ start: "08:00", end: "16:00" }],
          },
        },
      ],
    },
    policies: {
      cancellation: "Please provide 24 hours notice for cancellations",
      noShow: "A fee may be charged for missed appointments without notice",
      payment: "Payment is expected at the time of service",
    },
  },

  content: {
    hero: {
      title: "Welcome to Sunshine Pediatrics",
      subtitle: "Expert pediatric care in a warm, friendly environment",
      image: "/images/pediatrician/hero.jpg",
      cta: {
        text: "Schedule an Appointment",
        action: "/appointments",
      },
    },
    about: {
      title: "About Our Practice",
      content: "At Sunshine Pediatrics, we believe in providing comprehensive, compassionate care...",
      image: "/images/pediatrician/about.jpg",
      highlights: [
        {
          title: "Child-Focused Care",
          description: "Everything in our practice is designed with children in mind",
          icon: "child",
        },
        {
          title: "Experienced Team",
          description: "Our pediatricians have over 25 years of combined experience",
          icon: "team",
        },
        {
          title: "Same-Day Appointments",
          description: "Available for sick visits and urgent concerns",
          icon: "calendar",
        },
      ],
    },
    testimonials: [
      {
        id: "1",
        author: "Sarah Johnson",
        content: "Dr. Smith has been amazing with both of my children...",
        rating: 5,
        date: "2024-01-15",
      },
      {
        id: "2",
        author: "Michael Chen",
        content: "The entire staff is wonderful and so patient with kids...",
        rating: 5,
        date: "2024-02-01",
      },
    ],
    faq: [
      {
        question: "What should I bring to my first appointment?",
        answer: "Please bring your insurance card, photo ID, and any previous medical records...",
        category: "new-patients",
      },
      {
        question: "Do you offer after-hours care?",
        answer: "Yes, we have an on-call physician available for urgent concerns...",
        category: "services",
      },
    ],
    blog: {
      enabled: true,
      categories: ["Health Tips", "Child Development", "Nutrition", "Parenting"],
      featuredPosts: ["winter-health", "development-milestones"],
    },
  },

  seo: {
    title: "Sunshine Pediatrics | Child-Focused Medical Care in Sunnyville",
    description: "Expert pediatric care provided by board-certified pediatricians...",
    keywords: ["pediatrician", "children's doctor", "Sunnyville", "well-child visits"],
    structuredData: {
      type: "MedicalClinic",
      specialty: "Pediatrics",
      medicalSpecialty: ["Pediatrics", "Developmental Pediatrics"],
    },
  },

  theme: {
    colors: {
      primary: "#4A90E2",
      secondary: "#FFB74D",
      accent: "#81C784",
    },
    fonts: {
      heading: "Montserrat",
      body: "Source Sans Pro",
    },
    components: {
      buttons: {
        primary: {
          borderRadius: "25px",
          padding: "12px 24px",
        },
      },
      cards: {
        borderRadius: "16px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      },
    },
  },

  features: {
    onlineAppointments: true,
    patientPortal: {
      enabled: true,
      features: ["appointments", "records", "messaging"],
    },
    telemedicine: {
      enabled: true,
      provider: "Doxy.me",
      pricing: {
        amount: 75,
        currency: "USD",
      },
    },
    forms: {
      newPatient: true,
      insuranceVerification: true,
      medicalHistory: true,
    },
  },

  // Page configuration
  pages: {
    home: {
      path: "/",
      sections: [
        {
          type: "hero",
          props: {
            title: "Welcome to Sunshine Pediatrics",
            subtitle: "Expert pediatric care in a warm, friendly environment",
            image: "/images/pediatrician/hero.jpg",
            cta: {
              text: "Schedule an Appointment",
              action: "/appointments",
            },
          },
        },
        {
          type: "services",
          props: {
            services: [
              {
                id: "well-child",
                name: "Well-Child Visits",
                description: "Regular check-ups to monitor your child's growth and development",
                duration: 30,
                category: "preventive",
              },
              // ... other services
            ],
          },
        },
        {
          type: "team",
          props: {
            team: [
              {
                id: "dr-smith",
                name: "Dr. Sarah Smith",
                title: "Lead Pediatrician",
                specialty: "General Pediatrics",
                image: "/images/pediatrician/dr-smith.jpg",
              },
              // ... other team members
            ],
          },
        },
      ],
    },
    about: {
      path: "/about",
      sections: [
        {
          type: "content",
          props: {
            title: "About Our Practice",
            content: "At Sunshine Pediatrics, we believe in providing comprehensive, compassionate care...",
            image: "/images/pediatrician/about.jpg",
          },
        },
      ],
    },
    services: {
      path: "/services",
      sections: [
        {
          type: "services",
          props: {
            services: [
              {
                id: "well-child",
                name: "Well-Child Visits",
                description: "Regular check-ups to monitor your child's growth and development",
                duration: 30,
                category: "preventive",
              },
              // ... other services
            ],
            detailed: true,
          },
        },
      ],
    },
    appointments: {
      path: "/appointments",
      sections: [
        {
          type: "scheduler",
          props: {
            title: "Schedule Your Child's Visit",
            description: "Choose from available appointment types and times that work best for you.",
          },
        },
      ],
    },
    contact: {
      path: "/contact",
      sections: [
        {
          type: "contact",
          props: {
            contact: {
              phone: "(555) 123-4567",
              email: "info@sunshinepediatrics.com",
              address: {
                street: "123 Sunshine Boulevard",
                city: "Sunnyville",
                state: "CA",
                zip: "90210",
              },
            },
            hours: {
              monday: { open: "08:00", close: "17:00" },
              tuesday: { open: "08:00", close: "17:00" },
              wednesday: { open: "08:00", close: "17:00" },
              thursday: { open: "08:00", close: "17:00" },
              friday: { open: "08:00", close: "16:00" },
              saturday: { open: "09:00", close: "13:00" },
            },
          },
        },
      ],
    },
  },
};

export const pediatricianSite = createMedicalTemplate(pediatricianConfig);
