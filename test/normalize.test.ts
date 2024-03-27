import test from 'ava';
import { canParse, normalize } from '../src/index.js';

test('normalization', t => {
	const fullUrl = 'https://user:pass@some.subdomain.example.co.uk:80/subdirectory/file.html?param=1#top';

	t.is(canParse(fullUrl), true);

	const normalized = normalize(fullUrl);
  console.log(normalized.properties);
});
