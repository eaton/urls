import test from 'ava';
import { parse, canParse } from '../src/index.js';

test('mail domain', t => {
	const mail = 'mailto:bob@example.com';
  t.assert(canParse(mail));

  t.is(parse('https://bob.example.com').domain, 'example.com');
  t.is(parse(mail).domain, 'example.com'); 
});

test('mailto user', t => {
  t.is(parse('mailto:bob@example.com').user, 'bob');
})

test('mailto subject', t => {
  const url = parse('mailto:bob@example.com?cc=first@example.com,%20second@example.com&bcc=invisible@example.com&subject=Subject%20line&body=Body%20text')
  t.is(url.domain, 'example.com');
  t.is(url.searchParams.get('cc'), 'first@example.com, second@example.com');
  t.is(url.searchParams.get('bcc'), 'invisible@example.com');
  t.is(url.searchParams.get('subject'), 'Subject line');
  t.is(url.searchParams.get('body'), 'Body text');
})