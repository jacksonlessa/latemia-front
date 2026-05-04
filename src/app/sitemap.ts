import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/seo';

// Generates `/sitemap.xml` with the four indexable public routes. The route
// `/lgpd` is included even though its dedicated page is delivered in task 9.0
// of the same feature; keeping the sitemap as the single source of truth
// avoids a follow-up deploy just to expose a route that lands in parallel.

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacidade`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/termos`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/lgpd`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
