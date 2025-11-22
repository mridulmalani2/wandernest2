// Structured data for SEO - extracted for better tree-shaking
// Helper function to get base URL from environment variables
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL ||
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://wandernest.vercel.app');
};

export const getWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WanderNest',
  url: getBaseUrl(),
  description: 'Marketplace connecting tourists with local student guides for authentic travel experiences',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${getBaseUrl()}/booking?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})

export const getOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WanderNest',
  url: getBaseUrl(),
  logo: `${getBaseUrl()}/logo.png`,
  description: 'Marketplace platform connecting tourists with verified local student guides',
  sameAs: [],
})
