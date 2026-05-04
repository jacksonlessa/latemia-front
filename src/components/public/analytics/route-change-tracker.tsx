'use client';

/**
 * Listens to App Router navigations within the public route group and emits a
 * single `page_view` event per pathname/search combination via the unified
 * `track()` helper.
 *
 * Why manual page tracking?
 *   - GA4's automatic page_view is disabled in `ga4.tsx` (`send_page_view:
 *     false`). Letting it auto-fire on the SPA shell would either miss App
 *     Router transitions or double-count them.
 *   - The Meta Pixel's `PageView` standard event is mirrored by the same
 *     `track()` call (helper sends to both gtag and fbq).
 *
 * Suspense boundary:
 *   `useSearchParams` triggers the App Router's CSR bailout for static
 *   segments. We wrap the consumer node here so the public layout doesn't
 *   need to know about it — mirroring the pattern used by `TouchpointProvider`.
 *
 * Landing page event:
 *   When the visitor lands on `/`, we ALSO emit `pageview_landing` once per
 *   visit (PRD §5.3) so marketing can trigger landing-specific audiences in
 *   GA4/Meta without scraping the page_path of every event.
 */

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Events, track } from '@/lib/analytics/events';

export function RouteChangeTracker(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <RouteChangeTrackerInner />
    </Suspense>
  );
}

function RouteChangeTrackerInner(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSignatureRef = useRef<string | null>(null);
  const landingEmittedRef = useRef<boolean>(false);

  useEffect(() => {
    if (pathname === null) return;
    const search = searchParams !== null ? searchParams.toString() : '';
    const signature = `${pathname}?${search}`;
    if (lastSignatureRef.current === signature) return;
    lastSignatureRef.current = signature;

    const pagePath = search.length > 0 ? `${pathname}?${search}` : pathname;
    track(Events.PageView, { page_path: pagePath });

    if (pathname === '/' && !landingEmittedRef.current) {
      landingEmittedRef.current = true;
      track(Events.PageviewLanding, { page_path: pagePath });
    }
  }, [pathname, searchParams]);

  return null;
}
