import * as tld from 'tldts';
import path from 'path';

export class ParsedUrl extends URL {
  /**
   * A non-throwing version of the ParsedURL constructor; if the input
   * can't be parsed as a URL, it returns `null`.
   */
  static parse(input: string, base?: string | URL) {
    try {
      return new ParsedUrl(input, base);
    } catch {
      return null;
    }
  }
  
  /**
   * A mailto: aware version of the URL class's 'username' property.
   * For web URLs, `user` is the same as `username`, but for mailto: URLs,
   * it contains the 'user/account' portion of the email address.
   */
  get user(): string {
    return (this.protocol === 'mailto:') ? this.pathname.split('@')[0] : this.username;
  }

  set user(input: string) {
    if (this.protocol === 'mailto:') {
      const segments = this.pathname.split('@');
      segments[0] = input;
      this.pathname = segments.join('@');
    } else {
      this.username = input;
    }
  }

  /**
   * The root of a URL's hostname, including its TLD; e.g. `example.com` for `www.example.com`.
   */
  get domain(): string {
    return tld.getDomain(this.href, { allowPrivateDomains: true }) ?? '';
  }

  set domain(value: string | undefined) {
    this.hostname = [this.subdomain, value].filter(v => v && v.trim().length > 0).join('.');
  }

  /**
   * The root of a URL's hostname, excluding its TLD; e.g. `example` for `www.example.com`.
   */
  get domainWithoutSuffix(): string {
    return tld.getDomainWithoutSuffix(this.href, { allowPrivateDomains: true }) ?? '';
  }

  set domainWithoutSuffix(value: string) {
    this.hostname = [this.subdomain, value, this.publicSuffix].filter(v => v && v.trim().length > 0).join('.');
  }

  /**
   * The non-root portion of the URL's hostname; e.g. `www` for `www.example.com`.
   */
  get subdomain(): string {
    return tld.getSubdomain(this.hostname, { allowPrivateDomains: true }) ?? '';
  }

  set subdomain(value: string | undefined) {
    this.hostname = [value, this.domain].filter(v => v && v.trim().length > 0).join('.');
  }

  /**
   * A read-only key/value list of all UTM tracking parameters present in the
   * URL's searchParams.
   */
  get utmParams() {
    const output: Record<string, string> = {};
    for (const key of this.searchParams.keys()) {
      if (key.toLocaleLowerCase().startsWith('utm_')) {
        output[key.slice(4)] = this.searchParams.get(key) ?? '';
      }
    }
    return output;
  }

  /**
   * The public portion of a hostname, sometimes referred to as its TLD or
   * Top Level Domain. May include multiple segments; `.com`, `.co.uk`, and
   * `pvt.k12.ma.us` are all Public Suffixes.
   * 
   * The distinction (`.com` vs. `s3.us-east-2.amazonaws.com`, for example) is
   * particularly important for cookie security rules in a world full of SaaS
   * hosted subdomains. In the above example, 'same-domain' security would
   * include any S3 buckets hosted in the us-east-2 region, rather than a
   * particular company's bucket.
   * 
   * @see https://publicsuffix.org
   */
  get publicSuffix(): string {
    return tld.getPublicSuffix(this.hostname, { allowPrivateDomains: true }) ?? '';
  }

  set publicSuffix(value: string) {
    this.hostname = [this.subdomain, this.domainWithoutSuffix, value].filter(v => v && v.trim().length > 0).join('.');
  }

  /**
   * A version of the URL's `hash` property that excludes the hashtag.
   */
  get fragment(): string {
    return this.hash.slice(1);
  }

  set fragment(value: string) {
    if (value.trim().length === 0) {
      this.hash = '';
    } else {
      this.hash = '#' + value;
    }
  }

  /**
   * A read-only array of segments that make up the URL's `pathname`.
   * 
   * This can be used for quickly checking known segments of a URL, e.g.:
   * `if (url.path[4] === slug)`.
   */
  get path(): string[] {
    if (this.pathname === '/') return [];
    if (this.pathname.indexOf('/') === -1) return [];
    return this.pathname.slice(1).split('/');
  }

  /**
   * The final segment of the URL's pathname, if it exists.
   * 
   * For example, `http://foo.com/dir/index.html`'s file is `index.html`.
   */
  get file(): string {
    return path.parse(this.pathname).base;
  }

  /**
   * The filetype extension of the URL's filename, if it exists.
   * 
   * For example, `http://foo.com/dir/index.html`'s file is `.html`.
   */
  get extension(): string {
    return path.parse(this.pathname).ext;
  }

  /**
   * Boolean indicating whether or not the URL is a valid IP address.
   */
  get isIp(): boolean {
    return !!tld.parse(this.href).isIp;
  }

  /**
   * Boolean indicating whether or not the URL is a valid IP address.
   */
  get isIcann(): boolean {
    return !!tld.parse(this.href).isIcann;
  }

  /**
   * Boolean indicating whether or not the URL is a valid IP address.
   */
  get isPrivate(): boolean {
    return !!tld.parse(this.href).isPrivate;
  }

  get properties() {
    const searchParameters: Record<string, string | string[]> = {};
    for (const [key, value] of this.searchParams) {
      searchParameters[key] = value;
    }

    return {
      href: this.href,
      protocol: this.protocol,
      user: this.user,
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
      utmParams: this.utmParams,
      hash: this.hash,
      fragment: this.fragment,
      isIp: this.isIp,
      isPrivate: this.isPrivate,
      isIcann: this.isIcann
    };
  }
}
