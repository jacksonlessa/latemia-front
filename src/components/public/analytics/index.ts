/**
 * Barrel for analytics primitives mounted in the `(public)` route group.
 *
 * Each component is build-safe when its underlying env var is missing
 * (returns `null`). The `RouteChangeTracker` wraps its `useSearchParams`
 * consumer in a Suspense boundary internally.
 */

export { GA4 } from './ga4';
export { MetaPixel } from './meta-pixel';
export { RouteChangeTracker } from './route-change-tracker';
