import pkg from 'micromatch'
const { isMatch } = pkg;

import { ParsedUrl, canParse } from './parsed-url.js';

export type Normalizer = (url: NormalizedUrl, options?: NormalizerOptions) => NormalizedUrl;

interface NormalizedUrlData {
  href: string,
  raw?: string
}

export interface NormalizerOptions extends Record<string, unknown> {
  /**
   * An optional base URL for parsing partial paths.
   */
  base?: string | URL,

  /**
   * Coerce the URL's protocol; primarily useful for changing http: to https:
   */
  normalizer?: Normalizer

  /**
   * Coerce the URL's protocol; primarily useful for changing http: to https:
   */
  forceProtocol?: 'https:' | 'http:' | false;

  /**
   * Force the hostname (or the entire URL) to lowercase.
   */
  forceLowercase?: 'pathname' | boolean;

  /**
   * Remove the URL anchor/hashtag/fragment if it exists.
   */
  discardHash?: string | string[] | boolean;

  /**
   * Remove the URL authentication fields (username and password) if they exist.
   */
  discardAuth?: boolean;

  /**
   * Remove the port number if it matches a glob pattern.
   */
  discardPort?: string | string[] | boolean;

  /**
   * If the pathname matches the supplied pattern, remove its final segment.
   *
   * Useful for stripping `/index.html` and `/Default.aspx` style filenames that
   * fall back to `/` on most servers.
   */
  discardIndex?: string | string[] | boolean;

  /**
   * Discard any search/querystring parameters whose names match the supplied pattern.
   */
  discardSearchParams?: string | string[] | boolean;

  /**
   * Remove the trailing slash from the URL path if it exists. This is risky depending on
   * the server configuration.
   */
  discardTrailingSlash?: boolean;

  /**
   * Alphabetize any search/querystring parameters, so links that supply params in different
   * orders are not incorrectly flagged as different URLs.
   */
  sortSearchParams?: 'asc' | 'desc' | boolean;

  /**
   * Brute force search and replace in the URL's href string. By default, only the first match
   * will be replaced. If `replace.multi` is set to TRUE and a regular expression is used,
   * the regexp must have its global (`/g`) flag set.
   */
  replace?: {
    pattern: string | RegExp,
    replacement: string,
    multi?: boolean,
  }
}

export function normalize(input: string | URL, options?: NormalizerOptions) {
  return new NormalizedUrl(input, options);
}

export function safeNormalize(input: string | URL, options?: NormalizerOptions): { success: false } | { success: true, url: NormalizedUrl } {
  if (canParse(input.toString())) {
    return { success: true, url: new NormalizedUrl(input, options) };
  } else {
    return { success: false };
  }
}

export class NormalizedUrl extends ParsedUrl {
  static get defaultNormalizer(): Normalizer {
    return (url: NormalizedUrl, options?: NormalizerOptions) => {
      if (options?.forceProtocol) {
        url.protocol = options.forceProtocol;
      }
    
      if (options?.forceLowercase) {
        if (options.forceLowercase === 'pathname') {
          url.pathname = url.pathname.toLocaleLowerCase();
        } else if (options.forceLowercase === true) {
          url.href = url.href.toLocaleLowerCase();
        }
      }
    
      if (options?.discardAuth) {
        url.username = '';
        url.password = '';
      }
    
      if (options?.discardHash) {
        if (options.discardHash === true || isMatch(url.hash, options.discardHash)) {
          url.hash = '';
        }
      }
    
      if (options?.discardIndex) {
        if (options.discardIndex === true || isMatch(url.pathname, options.discardIndex)) {
          const trailing = url.pathname.endsWith('/');
          url.pathname = url.pathname.split('/').slice(0, -1).join('/') + (trailing ? '/' : '');
        }
      }
    
      if (options?.discardPort) {
        if (options.discardPort === true || isMatch(url.port.toString(), options.discardPort)) {
          url.port = '';
        }
      }
    
      if (options?.discardSearchParams) {
        if (options.discardSearchParams === true) {
          url.search = '';
        } else {
          const keys = [...url.searchParams.keys()];
          for (const key of keys) {
            if (isMatch(key, options.discardSearchParams)) {
              url.searchParams.delete(key);
              continue;
            }
          }  
        }
      }
    
      if (options?.discardTrailingSlash) {
        if (url.pathname.endsWith('/')) {
          url.pathname = url.pathname.slice(0, -1);
        }
      };
    
      if (options?.sortSearchParams) url.searchParams.sort();
    
      if (options?.replace) {
        if (options.replace.multi) {
          url.href = url.href.replaceAll(options.replace.pattern, options.replace.replacement);
        } else {
          url.href = url.href.replace(options.replace.pattern, options.replace.replacement);
        }
      }
    
      return url;
    }
  }

  static defaultOptions: NormalizerOptions = {
    forceProtocol: 'https:',
    discardAuth: true,
    discardHash: true,
    discardIndex: '**/{index,default}.*',
    discardPort: '80',
    discardSearchParams: 'utm_*',
    discardTrailingSlash: false,
  }
  
  static normalizer = NormalizedUrl.defaultNormalizer;

  readonly raw: string | undefined;

  /**
   * Creates an instance of NormalizedUrl.
   *
   * @constructor
   * @param input The URL to convert; it can be a string, an existing instance of the URL class, or
   * any object with { href: string } and { raw: string } properties. 
   * @param {?(string | URL | NormalizedUrlOptions)} [options]
   */
  constructor(input: string | URL | NormalizedUrlData, options?: string | URL | NormalizerOptions) {
    let opt = NormalizedUrl.defaultOptions;

    if (typeof options === 'string' || options instanceof URL) {
      opt.base = options.toString();
    } else if (options !== undefined) {
      opt = { ...NormalizedUrl.defaultOptions, ...options };
    }

    const normalizer = opt.normalizer ?? NormalizedUrl.normalizer;

    if (typeof input === 'string' || input instanceof URL) {
      super(input.toString(), opt.base);
    } else {
      super(input.href, opt.base);
      this.raw = input.raw;
    }

    if (!this.raw) {
      this.raw = this.href;
      this.href = normalizer(this, opt).href;
    }
  }

  get properties() {
    return {
      ...super.properties,
      raw: this.raw,
    }
  }
}
