// Structured data for SEO - extracted for better tree-shaking
// Helper function to get base URL from environment variables
// Only uses NEXT_PUBLIC_ prefixed variables to be safe for client-side usage
const getBaseUrl = () => {
  // In Next.js, only NEXT_PUBLIC_ prefixed env vars are available to client
  // VERCEL_URL is server-only, so we can't use it in client components
  return typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_BASE_URL || 'https://tourwiseco.vercel.app');
};

/**
 * Generates JSON-LD structured data for the website.
 * Used for SEO to help search engines understand the site content.
 * @returns WebSite structured data object
 */
export const getWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TourWiseCo',
  url: getBaseUrl(),
  description: 'Marketplace connecting tourists with local student guides for authentic travel experiences',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${getBaseUrl()}/booking?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})

/**
 * Generates JSON-LD structured data for the organization.
 * Includes logo, URL, and description.
 * @returns Organization structured data object
 */
export const getOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TourWiseCo',
  url: getBaseUrl(),
  logo: `${getBaseUrl()}/logo.png`,
  description: 'Marketplace platform connecting tourists with verified local student guides',
  sameAs: [],
})

/**
 * Generates JSON-LD structured data for the How It Works page.
 * Uses HowTo schema for better search visibility.
 * @returns HowTo structured data object
 */
export const getHowItWorksStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Book a Local Student Guide with TourWiseCo',
  description: 'Learn how to connect with verified local university student guides for authentic, personalized travel experiences.',
  image: '/images/backgrounds/cafe-ambiance.jpg',
  totalTime: 'PT10M',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Share Your Preferences',
      text: 'Tell us about your travel dates, interests, and what kind of experience you\'re looking for. Prefer a guide from your home country? Just let us know.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Get Matched',
      text: 'We match you with verified student guides who fit your preferences and availability. Review their profiles and choose the perfect fit.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Connect & Explore',
      text: 'Connect directly with your guide to finalize details. Then experience the city through their eyes — local cafes, hidden spots, and authentic adventures.',
      position: 3,
    },
  ],
})

/**
 * Generates JSON-LD FAQ structured data for rich snippets.
 * @returns FAQPage structured data object
 */
export const getFAQStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are student guides?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Student guides are verified university students who offer personalized tours and local experiences in their city. Unlike traditional tour guides, student guides share genuine insider knowledge — the coffee shops they study at, the neighborhoods they explore on weekends, and the shortcuts only locals know.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does it cost to book a student guide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TourWiseCo offers personalized experiences at rates significantly lower than traditional tours. Prices vary based on the guide and duration, but you pay less while getting fully personalized experiences with no fixed itineraries.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I become a student guide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sign up with your university email and complete verification. Then create your profile showcasing your personality, interests, and what makes your city special. Set your availability, preferred tour durations, and hourly rates. You\'re in complete control of when and how you guide.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is TourWiseCo available in my city?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TourWiseCo is currently available in Paris and London, with plans to expand to more cities. We connect travelers with local university students in these cities for authentic travel experiences.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are student guides verified?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All student guides must verify their university enrollment through their university email. We ensure every guide is a real, enrolled student to maintain quality and authenticity.',
      },
    },
  ],
})

/**
 * Generates JSON-LD BreadcrumbList structured data.
 * @param items Array of breadcrumb items with name and url
 * @returns BreadcrumbList structured data object
 */
export const getBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})
