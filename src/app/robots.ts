import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/seo';

// Generates `/robots.txt`:
//   - Allows crawling of every public route under `(public)`.
//   - Blocks the admin panel (`/admin/*`), the API surface (`/api/*`) and the
//     post-conversion success page (`/contratar/sucesso`) — the latter is a
//     transactional URL that should not surface in search results.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/contratar/sucesso'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
