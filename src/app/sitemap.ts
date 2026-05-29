import type { MetadataRoute } from 'next';
import { siteAbsoluteUrl } from '@/config/seo';

// Indexable public routes for `/sitemap.xml`. `/contratar/sucesso` stays out
// (transactional; disallowed in `robots.ts`).

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: siteAbsoluteUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: siteAbsoluteUrl('/contratar'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: siteAbsoluteUrl('/beneficios'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: siteAbsoluteUrl('/clube-de-vantagens'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: siteAbsoluteUrl('/emergencia'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: siteAbsoluteUrl('/sobre-a-clinica'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: siteAbsoluteUrl('/privacidade'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: siteAbsoluteUrl('/termos'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: siteAbsoluteUrl('/lgpd'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
