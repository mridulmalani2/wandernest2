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
