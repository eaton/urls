import test from 'ava';
import { canParse, normalize } from '../src/index.js';

test('normalization', t => {
	const fullUrl = 'https://user:pass@SOME.SUBDOMAIN.example.co.uk:80/subdirectory/index.html?param=1&utm_campaign=google#top';

	t.is(canParse(fullUrl), true);

	const normalized = normalize(fullUrl);
  t.is(normalized.fragment, '');
});
