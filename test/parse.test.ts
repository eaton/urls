import test from 'ava';
import { parse, canParse } from '../src/index.js';

test('canParse and parse', t => {
	const href = 'https://user:pass@some.subdomain.example.co.uk:80/subdirectory/file.html?param=1#top';

	t.is(canParse(href), true);
	t.is(canParse("WON'T PARSE"), false);

	const parsed = parse(href);
	t.deepEqual(parsed.properties, {
		href,
		protocol: 'https:',
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
		hash: '#top',
		fragment: 'top',
		isIcann: true,
		isIp: false,
		isPrivate: false,
	})
});

test('domain element modification', t => {
	const url = parse('https://some.subdomain.example.co.uk');

	url.domainWithoutSuffix = 'test';
	t.is(url.hostname, 'some.subdomain.test.co.uk');

	url.subdomain = 'www';
	t.is(url.hostname, 'www.test.co.uk');

	url.subdomain = '';
	t.is(url.hostname, 'test.co.uk');

	url.publicSuffix = 'com';
	t.is(url.hostname, 'test.com');
});
