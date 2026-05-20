'use client';

/**
 * Meta Pixel (`fbevents.js`) loader. Renders nothing when the pixel ID is
 * absent so missing env vars do not break the build or inject placeholder
 * tracking calls.
 *
 * The inline body is the official Meta snippet, with an explicit
 * `fbq('consent', 'revoke')` after `init` so events stay queued until
 * `ConsentProvider` calls `fbq('consent','grant')`.
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
fbq('consent', 'revoke');`;

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
