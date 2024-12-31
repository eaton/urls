import pkg from 'micromatch'
const { isMatch } = pkg;
import { ParsedUrl } from './parsed-url.js';

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
   * Override the URL Normalizer with a custom function; it should accept, and return, an
   * instance of NormalizedUrl.
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
  discardHash?: string | boolean;

  /**
   * Remove the URL authentication fields (username and password) if they exist.
   */
  discardAuth?: boolean;

  /**
   * Remove the port number if it matches a glob pattern.
   */
  discardPort?: string | boolean;

  /**
   * If the pathname matches the supplied pattern, remove its final segment.
   * Useful for stripping `/index.html` and `/Default.aspx` style filenames that
   * fall back to `/` on most servers.
   * 
   * NOTE: This will preserve the trailing slash after the index filename is removed;
   * when combined with the discardTrailingSlash option, you may encounter issues on
   * servers where `example.com/dir` is treated as a filename rather than a directory
   * index.
   */
  discardIndex?: string | boolean;

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
  sortSearchParams?: boolean;

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

export class NormalizedUrl extends ParsedUrl {
  /**
   * A non-throwing version of the NormalizedUrl constructor; if the input
   * can't be parsed as a URL, it returns `null`.
   */
  static normalize(input: string | URL, options?: string | NormalizerOptions) {
    const opt = (typeof options === 'string') ? { base: options } : options;
    try {
      return new NormalizedUrl(input, opt);
    } catch {
      return null;
    }
  }
  
  static get defaultNormalizer(): Normalizer {
    return (url: NormalizedUrl, options: Partial<NormalizerOptions> = {}) => {
      const opt = { ...NormalizedUrl.defaultOptions, ...options }

      if (opt?.forceProtocol) {
        url.protocol = opt.forceProtocol;
      }
    
      if (opt?.forceLowercase) {
        if (opt.forceLowercase === 'pathname') {
          url.pathname = url.pathname.toLocaleLowerCase();
        } else if (opt.forceLowercase === true) {
          url.href = url.href.toLocaleLowerCase();
        }
      }
    
      if (opt?.discardAuth) {
        url.username = '';
        url.password = '';
      }
    
      if (opt?.discardHash) {
        if (opt.discardHash === true || isMatch(url.hash, opt.discardHash)) {
          url.hash = '';
        }
      }
    
      if (opt?.discardIndex) {
        if (opt.discardIndex === true || isMatch(url.pathname, opt.discardIndex)) {
          const segments = url.path;
          segments[segments.length-1] = '';
          url.pathname = segments.join('/');
        }
      }
    
      if (opt?.discardPort) {
        if (opt.discardPort === true || isMatch(url.port.toString(), opt.discardPort)) {
          url.port = '';
        }
      }
    
      if (opt?.discardSearchParams) {
        if (opt.discardSearchParams === true) {
          url.search = '';
        } else {
          const keys = [...url.searchParams.keys()];
          for (const key of keys) {
            if (isMatch(key, opt.discardSearchParams)) {
              url.searchParams.delete(key);
              continue;
            }
          }  
        }
      }
    
      if (opt?.discardTrailingSlash) {
        if (url.pathname.endsWith('/')) {
          url.pathname = url.pathname.slice(0, -1);
        }
      };
    
      if (opt?.sortSearchParams) url.searchParams.sort();
    
      if (opt?.replace) {
        if (opt.replace.multi) {
          url.href = url.href.replaceAll(opt.replace.pattern, opt.replace.replacement);
        } else {
          url.href = url.href.replace(opt.replace.pattern, opt.replace.replacement);
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
    sortSearchParams: true,
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
