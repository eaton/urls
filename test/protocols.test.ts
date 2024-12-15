import test from 'ava';
import { ParsedUrl } from '../src/index.js';

test('mail domain', t => {
	const mail = 'mailto:bob@example.com';
  t.assert(ParsedUrl.canParse(mail));

  t.is(ParsedUrl.parse('https://bob.example.com')?.domain, 'example.com');
  t.is(ParsedUrl.parse(mail)?.domain, 'example.com'); 
});

test('mailto user', t => {
  t.is(ParsedUrl.parse('mailto:bob@example.com')?.user, 'bob');
})

test('mailto subject', t => {
  const url = new ParsedUrl('mailto:bob@example.com?cc=first@example.com,%20second@example.com&bcc=invisible@example.com&subject=Subject%20line&body=Body%20text')
  t.is(url.domain, 'example.com');
  t.is(url.searchParams.get('cc'), 'first@example.com, second@example.com');
  t.is(url.searchParams.get('bcc'), 'invisible@example.com');
  t.is(url.searchParams.get('subject'), 'Subject line');
  t.is(url.searchParams.get('body'), 'Body text');
})