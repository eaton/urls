import test from 'ava';
import { ParsedUrl } from '../src/index.js';

test('parsing helpers', t => {
	const href = 'https://user:pass@some.subdomain.example.co.uk:80/subdirectory/file.html?param=1#top';

	t.is(ParsedUrl.canParse(href), true);
	t.is(ParsedUrl.canParse("WON'T PARSE"), false);

	const safeFail = ParsedUrl.parse("WON'T PARSE");
	const safeSuccess = ParsedUrl.parse(href);
	t.falsy(safeFail);
	t.truthy(safeSuccess);
	t.is(safeSuccess?.href, href);

	t.throws(() => new ParsedUrl("WON'T PARSE"));
	t.notThrows(() => ParsedUrl.parse("WON'T PARSE"));
	t.deepEqual(ParsedUrl.parse(href)?.properties, {
		href,
		protocol: 'https:',
		user: 'user',
		username: 'user',
		password: 'pass',
		origin: 'https://some.subdomain.example.co.uk:80',
		host: 'some.subdomain.example.co.uk:80',
		hostname: 'some.subdomain.example.co.uk',
		subdomain: 'some.subdomain',
		domain: 'example.co.uk',
		domainWithoutSuffix: 'example',
		publicSuffix: 'co.uk',
		port: '80',
		pathname: '/subdirectory/file.html',
		path: [ 'subdirectory', 'file.html' ],
		file: 'file.html',
		extension: '.html',
		search: '?param=1',
		searchParams: { param: '1' },
		utmParams: {},
		hash: '#top',
		fragment: 'top',
		isIcann: true,
		isIp: false,
		isPrivate: false,
	})
});

test('domain modification', t => {
	const url = new ParsedUrl('https://some.subdomain.example.co.uk');

	url.domainWithoutSuffix = 'test';
	t.is(url.hostname, 'some.subdomain.test.co.uk');

	url.subdomain = 'www';
	t.is(url.hostname, 'www.test.co.uk');

	url.subdomain = '';
	t.is(url.hostname, 'test.co.uk');

	url.publicSuffix = 'com';
	t.is(url.hostname, 'test.com');
});

test.failing('direct comparison', t => {
	const u = new URL('https://example.com');
	const pu = new ParsedUrl('https://example.com');

	t.deepEqual(u, pu);
})