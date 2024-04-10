import test from 'ava';
import { parse, canParse, safeParse } from '../src/index.js';

test('mail domain', t => {
	const mail = 'mailto:bob@example.com';
  t.assert(canParse(mail));

  t.is(parse('https://bob.example.com').domain, 'example.com');
  t.is(parse(mail).domain, 'example.com');
});

test.failing('mail username', t => {
  t.is(parse('mailto:bob@example.com').username, 'bob');
})