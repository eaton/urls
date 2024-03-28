export { URLPattern } from 'urlpattern-polyfill';
import * as tld from 'tldts';
import path from 'path';
import pkg from 'micromatch';

const canParse = URL.canParse;
function parse(input, base) {
  return new ParsedUrl(input, base);
}
function safeParse(input, base) {
  if (canParse(input)) {
    return { success: true, url: new ParsedUrl(input, base) };
  } else {
    return { success: false };
  }
}
class ParsedUrl extends URL {
  get domain() {
    return tld.getDomain(this.hostname) ?? "";
  }
  set domain(value) {
    this.hostname = [this.subdomain, value].filter((v) => v && v.trim().length > 0).join(".");
  }
  get domainWithoutSuffix() {
    return tld.getDomainWithoutSuffix(this.href) ?? "";
  }
  set domainWithoutSuffix(value) {
    this.hostname = [this.subdomain, value, this.publicSuffix].filter((v) => v && v.trim().length > 0).join(".");
  }
  get subdomain() {
    return tld.getSubdomain(this.hostname) ?? "";
  }
  set subdomain(value) {
    this.hostname = [value, this.domain].filter((v) => v && v.trim().length > 0).join(".");
  }
  get publicSuffix() {
    return tld.getPublicSuffix(this.hostname) ?? "";
  }
  set publicSuffix(value) {
    this.hostname = [this.subdomain, this.domainWithoutSuffix, value].filter((v) => v && v.trim().length > 0).join(".");
  }
  get fragment() {
    return this.hash.slice(1);
  }
  set fragment(value) {
    if (value.trim().length === 0) {
      this.hash = "";
    } else {
      this.hash = "#" + value;
    }
  }
  get path() {
    if (this.pathname === "/")
      return [];
    return this.pathname.slice(1).split("/");
  }
  get file() {
    return path.parse(this.pathname).base;
  }
  get extension() {
    return path.parse(this.pathname).ext;
  }
  get isIp() {
    return !!tld.parse(this.href).isIp;
  }
  get isIcann() {
    return !!tld.parse(this.href).isIcann;
  }
  get isPrivate() {
    return !!tld.parse(this.href).isPrivate;
  }
  get properties() {
    const searchParameters = {};
    for (const [key, value] of this.searchParams) {
      searchParameters[key] = value;
    }
    return {
      href: this.href,
      protocol: this.protocol,
      username: this.username,
      password: this.password,
      origin: this.origin,
      host: this.host,
      hostname: this.hostname,
      subdomain: this.subdomain,
      domain: this.domain,
      domainWithoutSuffix: this.domainWithoutSuffix,
      publicSuffix: this.publicSuffix,
      port: this.port,
      pathname: this.pathname,
      path: this.path,
      file: this.file,
      extension: this.extension,
      search: this.search,
      searchParams: searchParameters,
      hash: this.hash,
      fragment: this.fragment,
      isIp: this.isIp,
      isPrivate: this.isPrivate,
      isIcann: this.isIcann
    };
  }
}

const { isMatch } = pkg;
function normalize(input, options) {
  return new NormalizedUrl(input, options);
}
function safeNormalize(input, options) {
  if (canParse(input.toString())) {
    return { success: true, url: new NormalizedUrl(input, options) };
  } else {
    return { success: false };
  }
}
class NormalizedUrl extends ParsedUrl {
  static get defaultNormalizer() {
    return (url, options) => {
      if (options?.forceProtocol) {
        url.protocol = options.forceProtocol;
      }
      if (options?.forceLowercase) {
        if (options.forceLowercase === "pathname") {
          url.pathname = url.pathname.toLocaleLowerCase();
        } else if (options.forceLowercase === true) {
          url.href = url.href.toLocaleLowerCase();
        }
      }
      if (options?.discardAuth) {
        url.username = "";
        url.password = "";
      }
      if (options?.discardHash) {
        if (options.discardHash === true || isMatch(url.hash, options.discardHash)) {
          url.hash = "";
        }
      }
      if (options?.discardIndex) {
        if (options.discardIndex === true || isMatch(url.pathname, options.discardIndex)) {
          const segments = url.path;
          segments[segments.length - 1] = "";
          url.pathname = segments.join("/");
        }
      }
      if (options?.discardPort) {
        if (options.discardPort === true || isMatch(url.port.toString(), options.discardPort)) {
          url.port = "";
        }
      }
      if (options?.discardSearchParams) {
        if (options.discardSearchParams === true) {
          url.search = "";
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
        if (url.pathname.endsWith("/")) {
          url.pathname = url.pathname.slice(0, -1);
        }
      }
      if (options?.sortSearchParams)
        url.searchParams.sort();
      if (options?.replace) {
        if (options.replace.multi) {
          url.href = url.href.replaceAll(options.replace.pattern, options.replace.replacement);
        } else {
          url.href = url.href.replace(options.replace.pattern, options.replace.replacement);
        }
      }
      return url;
    };
  }
  static defaultOptions = {
    forceProtocol: "https:",
    discardAuth: true,
    discardHash: true,
    discardIndex: "**/{index,default}.*",
    discardPort: "80",
    discardSearchParams: "utm_*",
    discardTrailingSlash: false
  };
  static normalizer = NormalizedUrl.defaultNormalizer;
  raw;
  /**
   * Creates an instance of NormalizedUrl.
   *
   * @constructor
   * @param input The URL to convert; it can be a string, an existing instance of the URL class, or
   * any object with { href: string } and { raw: string } properties. 
   * @param {?(string | URL | NormalizedUrlOptions)} [options]
   */
  constructor(input, options) {
    let opt = NormalizedUrl.defaultOptions;
    if (typeof options === "string" || options instanceof URL) {
      opt.base = options.toString();
    } else if (options !== void 0) {
      opt = { ...NormalizedUrl.defaultOptions, ...options };
    }
    const normalizer = opt.normalizer ?? NormalizedUrl.normalizer;
    if (typeof input === "string" || input instanceof URL) {
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
      raw: this.raw
    };
  }
}

export { NormalizedUrl, ParsedUrl, canParse, normalize, parse, safeNormalize, safeParse };
