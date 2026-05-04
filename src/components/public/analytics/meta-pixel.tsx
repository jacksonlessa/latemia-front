'use client';

/**
 * Meta Pixel (`fbevents.js`) loader. Renders nothing when the pixel ID is
 * absent so missing env vars do not break the build or inject placeholder
 * tracking calls.
 *
 * The inline body is the official Meta snippet, with the addition of an
 * explicit `fbq('consent', 'revoke')` after `init`. This guarantees that —
 * even if the visitor has not yet decided — the pixel queues events behind a
 * revoked consent flag until `ConsentProvider` calls `fbq('consent','grant')`.
 *
 * `<noscript>` fallback is intentionally omitted: it requires inlining a 1x1
 * tracking image that fires unconditionally, which conflicts with our LGPD
 * default-denied policy.
 */

import Script from 'next/script';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MetaPixel(): React.ReactElement | null {
  if (!META_PIXEL_ID) return null;

  const id = META_PIXEL_ID;
  const body = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('consent', 'revoke');`;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

/** Exposed for tests so they can detect whether the component will render. */
export const __META_PIXEL_ID_FOR_TESTS = META_PIXEL_ID;
