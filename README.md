# Eaton's URL Tools

A light wrapper around assorted URL parsing, matching, and manipulation tools.

- A `ParsedURL` class that uses the `tstld` project to parse out and expose more granular domain elements like the TLD, true subdomain, etc. It also exposes explicit properties representing the filename and file extension of a given URL if they're present, and the implied username of `mailto:` URL.
- A `NormalizedURL` class that applies configurable normalization rules in addition to basic parsing when an instance is created.

## Installation

`npm install @eatonfyi/urls`

## Usage

### URL Parsing

```js
import { ParsedURL } from '@eatonfyi/urls';

// Like the underlying URL class, ParsedUrl.parse(someUrl) returns null
// rather than throwing if the input URL is unparsable.
const url = new ParsedUrl(
  'http://subdomain.example.co.uk/subdir/index.html#anchor'
);

console.log(url.properties);

// {
//   href: 'http://subdomain.example.co.uk:80/subdir/index.html#anchor',
//   protocol: 'http:',
//   username: '',
//   password: '',
//   origin: 'http://subdomain.example.co.uk',
//   host: 'subdomain.example.co.uk',
//   hostname: 'subdomain.example.co.uk',
//   subdomain: 'subdomain',
//   domain: 'example.co.uk',
//   domainWithoutSuffix: 'example',
//   publicSuffix: 'co.uk',
//   port: '80',
//   pathname: '/subdir/index.html',
//   path: [ 'subdir', 'index.html' ],
//   file: 'index.html',
//   extension: '.html',
//   search: '',
//   searchParams: {},
//   utmParams: {},
//   hash: '#anchor',
//   fragment: 'anchor',
//   isIp: false,
//   isPrivate: false,
//   isIcann: true
// }
```

### URL Normalization

```js
import { NormalizedUrl } from '@eatonfyi/urls';

const normalized = new NormalizedUrl(
  'http://WW2.EXAMPLE.co.UK/index.html?b=1&a=2&utm_src=ads'
);

console.log(normalized.href); // https://www.example.co.uk/?b=1&a=2
```
