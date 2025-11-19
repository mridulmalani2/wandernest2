// Structured data for SEO - extracted for better tree-shaking
export const getWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WanderNest',
  url: 'https://wandernest.vercel.app',
  description: 'Marketplace connecting tourists with local student guides for authentic travel experiences',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://wandernest.vercel.app/booking?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
})

export const getOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WanderNest',
  url: 'https://wandernest.vercel.app',
  logo: 'https://wandernest.vercel.app/logo.png',
  description: 'Marketplace platform connecting tourists with verified local student guides',
  sameAs: [],
})
