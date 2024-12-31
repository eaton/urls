import { ParsedUrl } from "./parsed-url.js";
import { NormalizedUrl } from "./normalized-url.js";

const url = new ParsedUrl(
  'http://subdomain.example.co.uk/subdir/index.html#anchor'
);

console.log(url.properties);


const norm = new NormalizedUrl(
  'http://WWW.EXAMPLE.co.UK/index.html?b=1&a=2&utm_src=ads',
);

console.log(norm);