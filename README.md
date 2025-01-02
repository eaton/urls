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
  'http://WW2.EXAMPLE.co.UK/index.html?b=1&a=2&utm_src=ads#content'
);
console.log(normalized.href); // https://www.example.co.uk/?b=1&a=2

const custom = new NormalizedUrl(
  'http://WW2.EXAMPLE.co.UK/index.html?b=1&a=2&utm_src=ads#content',
  {
    discardHash: false,
    discardIndex: false,
    discardSearchParams: true
  }
);
console.log(normalized.href); // https://www.example.co.uk/index.html#content
```

### Normalizer Options

| option | description | default |
|---|---|---|
| base | A base hostname for relative URLs | _undefined_ |
| forceProtocol | Force URLs to use a specific protocol | `https:` |
| forceLowercase | Lowercase hostnames; specifying `pathname` will lowercase the _entire_ URL, but confuses case-sensitive servers | `true` |
| discardAuth | Remove the URL's user and password segments | `true` |
| discardHash | Remove the URL's trailing hash/fragment/anchor | `true` |
| discardIndex | Remove explicit index files in favor or directory paths; glob strings can be used to control index filename matches | `**/{index,default}.*` |
| discardPort | Remove the URL's port number; glob strings can be used to match one or more ports | `80` |
| discardSearchParams | Remove URL search params; `true` strips all params, a glob string removes params whose keys are matched | `utm_*` |
| discardTrailingSlash | Sometimes useful, but confuses many servers | `false` |
| sortSearchParams | | `true` |
| **Uncommon options** | | |
| replace | Pass in an object with `pattern`, `replacement`, and `multi` keys to perform arbitrary string replacements on the URL | _undefined_ |
| normalizer | A custom normalizer function; other options will be ignored | _undefined_ |
