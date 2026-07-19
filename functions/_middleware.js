const CANONICAL_ORIGIN = 'https://marauderscheats.com';
const APEX_HOST = 'marauderscheats.com';
const WWW_HOST = 'www.marauderscheats.com';

const PATH_REDIRECTS = {
	'/sitemap-index.xml': '/sitemap.xml',
	'/sitemap-0.xml': '/sitemap.xml',
	'/sitemap-images.xml': '/sitemap.xml',
};

/**
 * Client protocol as seen by Cloudflare (not the internal Worker URL).
 * Pages often presents request.url as https:// even when the visitor used HTTP,
 * so cf-visitor / x-forwarded-proto are the source of truth.
 */
function getClientProtocol(request) {
	const visitor = request.headers.get('cf-visitor');
	if (visitor) {
		try {
			const scheme = JSON.parse(visitor).scheme;
			if (scheme) return String(scheme).toLowerCase();
		} catch {
			// ignore malformed cf-visitor
		}
	}

	const forwarded = request.headers.get('x-forwarded-proto');
	if (forwarded) {
		return forwarded.split(',')[0].trim().toLowerCase();
	}

	return new URL(request.url).protocol.replace(':', '').toLowerCase();
}

function applySecurityHeaders(headers, { html = false } = {}) {
	headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	headers.set('X-Frame-Options', 'DENY');
	headers.set('Content-Security-Policy', 'upgrade-insecure-requests');

	if (html) {
		const contentType = headers.get('Content-Type') || '';
		if (!/charset=/i.test(contentType)) {
			headers.set('Content-Type', 'text/html; charset=utf-8');
		}
		// Keep HTML out of the zone/edge cache so HTTP→HTTPS runs on every hit.
		// (Zone "Cache Everything" rules can otherwise serve HIT over plain HTTP
		// before this middleware runs.)
		headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
		headers.set('CDN-Cache-Control', 'no-store');
		headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
	}
}

/**
 * Cloudflare Pages middleware (runs for every request).
 * Domain-level redirects are NOT supported in public/_redirects on Pages,
 * so host + HTTPS canonicalization must live here.
 *
 * Also enable in the Cloudflare dashboard (required for reliable edge redirects):
 * SSL/TLS → Edge Certificates → Always Use HTTPS = On
 * Optional: Bulk Redirect www → https://marauderscheats.com + proxied www DNS
 *
 * Note: when Functions middleware is present, public/_headers is not applied
 * to these responses — set security/charset headers here.
 */
export async function onRequest(context) {
	const url = new URL(context.request.url);
	const host = url.hostname.toLowerCase();
	const proto = getClientProtocol(context.request);

	const isProductionHost = host === APEX_HOST || host === WWW_HOST;
	const needsHostRedirect = host === WWW_HOST;
	const needsHttpsRedirect = isProductionHost && proto === 'http';

	if (needsHostRedirect || needsHttpsRedirect) {
		const target = new URL(url.pathname + url.search, CANONICAL_ORIGIN);
		const headers = new Headers({
			Location: target.toString(),
			'Cache-Control': 'no-store',
			'CDN-Cache-Control': 'no-store',
			'Cloudflare-CDN-Cache-Control': 'no-store',
		});
		applySecurityHeaders(headers);
		return new Response(null, { status: 301, headers });
	}

	const pathRedirect = PATH_REDIRECTS[url.pathname];
	if (pathRedirect) {
		const headers = new Headers({
			Location: new URL(pathRedirect, CANONICAL_ORIGIN).toString(),
			'Cache-Control': 'no-store',
		});
		applySecurityHeaders(headers);
		return new Response(null, { status: 301, headers });
	}

	const response = await context.next();
	const headers = new Headers(response.headers);
	const contentType = headers.get('Content-Type') || '';
	const isHtml = contentType.includes('text/html');

	applySecurityHeaders(headers, { html: isHtml });

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
