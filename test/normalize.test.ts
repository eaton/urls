import test from 'ava';
import { normalize, NormalizedUrl, ParsedUrl, safeNormalize, Normalizer } from '../src/index.js';

test('normalization helpers', t => {
	const href = 'http://some.subdomain.example.co.uk/index.html#top';

	const safeFail = safeNormalize("WON'T PARSE");
	const safeSuccess = safeNormalize(href);
	t.is(safeFail.success, false);
	t.is(safeSuccess.success, true);
	if (safeSuccess.success) {
		t.is(safeSuccess.url.href, 'https://some.subdomain.example.co.uk/');
	}
});

test('no-op normalizer', t => {
	const href = 'https://user:pass@some.subdomain.example.co.uk:80/subdirectory/index.html?param=1&utm_campaign=google#top';
	
	// Baseline URL parsing
	t.is(new URL(href).href, href);
	t.is(new ParsedUrl(href).href, href);

	// Running a messy URL with the default normalizer; the results shouldn't match.
	t.not(normalize(href).href, href);

	// Running a messy URL while passing in a no-op normalizer; the first result should match, the second shouldn't.
	t.is(normalize(href, { normalizer: url => url }).href, href);
	t.not(normalize(href).href, href);

	// Changing the global normalizer to a no-op function, normalizing a URL, then changing it back and normalizing
	// it a second time. First should match, second shouldn't.
	NormalizedUrl.normalizer = url => url;
	t.is(normalize(href).href, href);

	
	NormalizedUrl.normalizer = NormalizedUrl.defaultNormalizer;
	t.not(normalize(href).href, href);
});

test('chained normalizer', t => {
	const href = 'https://example.com/index.html';
	t.is(normalize(href).href, 'https://example.com/');

	const normalizer: Normalizer = (url, options) => {
		url = NormalizedUrl.defaultNormalizer(url, options);
		url.protocol = 'ftp:';
		return url;
	}
	t.is(normalize(href, { normalizer }).href, 'ftp://example.com/');
});
