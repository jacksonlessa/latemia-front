'use client';

/**
 * Meta Pixel (`fbevents.js`) loader. Renders nothing when the pixel ID is
 * absent so missing env vars do not break the build or inject placeholder
 * tracking calls.
 *
 * The inline body is the official Meta snippet, with `fbq('consent', 'revoke')`
 * after `init`, then an immediate `grant` when `lm_consent_v1` already has
 * marketing granted (return visits). `ConsentProvider` still syncs on accept
 * and on `lm:fbq-ready` when React mounts before/after the stub.
 *
 * Do not wrap `window.fbq` for debugging — replacing the stub breaks
 * `fbevents.js` initialization ("Multiple pixels with conflicting versions").
 *
 * `<noscript>` fallback is intentionally omitted: it requires inlining a 1x1
 * tracking image that fires unconditionally, which conflicts with our LGPD
 * default-denied policy.
 */

import Script from 'next/script';
import { FBQ_READY_EVENT } from '@/lib/analytics/events';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
/** Optional — copy from Events Manager → Test events (format TEST12345). Local/dev only. */
const META_TEST_EVENT_CODE =
  process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE?.trim() ?? '';

/** Must match `CONSENT_STORAGE_KEY` / `CONSENT_VERSION` in `consent-provider.tsx`. */
const CONSENT_STORAGE_KEY = 'lm_consent_v1';
const CONSENT_VERSION = 1;

/** Re-applies grant on return visits before React hydrates (fixes revoke-after-init). */
const FBQ_GRANT_FROM_STORAGE = `(function(){try{var r=localStorage.getItem('${CONSENT_STORAGE_KEY}');if(!r)return;var c=JSON.parse(r);if(c.version!==${CONSENT_VERSION})return;if(c.marketing==='granted')fbq('consent','grant');}catch(e){}})();`;

const FBQ_READY_DISPATCH = `try{window.dispatchEvent(new CustomEvent('${FBQ_READY_EVENT}'));}catch(e){}`;

function buildFbqInitLine(pixelId: string): string {
  if (META_TEST_EVENT_CODE.length === 0) {
    return `fbq('init', '${pixelId}');`;
  }
  const code = META_TEST_EVENT_CODE.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `fbq('init', '${pixelId}', {}, {test_event_code: '${code}'});`;
}

export function MetaPixel(): React.ReactElement | null {
  if (!META_PIXEL_ID) return null;

  const id = META_PIXEL_ID;
  const initLine = buildFbqInitLine(id);
  const body = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
${initLine}
fbq('consent', 'revoke');
${FBQ_GRANT_FROM_STORAGE}
${FBQ_READY_DISPATCH};`;

  const onPixelReady = (): void => {
    if (typeof window === 'undefined') return;
    try {
      window.dispatchEvent(new CustomEvent(FBQ_READY_EVENT));
    } catch {
      // CustomEvent unsupported — consent hydrate may still sync if fbq exists.
    }
  };

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: body }}
      onLoad={onPixelReady}
    />
  );
}

/** Exposed for tests so they can detect whether the component will render. */
export const __META_PIXEL_ID_FOR_TESTS = META_PIXEL_ID;
