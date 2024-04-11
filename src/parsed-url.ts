import * as tld from 'tldts';
import path from 'path';

export const canParse = URL.canParse;

export function parse(input: string, base?: string | URL) {
  return new ParsedUrl(input, base);
}

export function safeParse(input: string, base?: string | URL): { success: false } | { success: true, url: ParsedUrl } {
  if (canParse(input)) {
    return { success: true, url: new ParsedUrl(input, base) };
  } else {
    return { success: false };
  }
}

export class ParsedUrl extends URL {

  
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

  get domain(): string {
    return tld.getDomain(this.href) ?? '';
  }

  set domain(value: string | undefined) {
    this.hostname = [this.subdomain, value].filter(v => v && v.trim().length > 0).join('.');
  }

  get domainWithoutSuffix(): string {
    return tld.getDomainWithoutSuffix(this.href) ?? '';
  }

  set domainWithoutSuffix(value: string) {
    this.hostname = [this.subdomain, value, this.publicSuffix].filter(v => v && v.trim().length > 0).join('.');
  }

  get subdomain(): string {
    return tld.getSubdomain(this.hostname) ?? '';
  }

  set subdomain(value: string | undefined) {
    this.hostname = [value, this.domain].filter(v => v && v.trim().length > 0).join('.');
  }

  get publicSuffix(): string {
    return tld.getPublicSuffix(this.hostname) ?? '';
  }

  set publicSuffix(value: string) {
    this.hostname = [this.subdomain, this.domainWithoutSuffix, value].filter(v => v && v.trim().length > 0).join('.');
  }

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

  get path(): string[] {
    if (this.pathname === '/') return [];
    if (this.pathname.indexOf('/') === -1) return [];
    return this.pathname.slice(1).split('/');
  }

  get file(): string {
    return path.parse(this.pathname).base;
  }

  get extension(): string {
    return path.parse(this.pathname).ext;
  }

  get isIp(): boolean {
    return !!tld.parse(this.href).isIp;
  }

  get isIcann(): boolean {
    return !!tld.parse(this.href).isIcann;
  }

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
      hash: this.hash,
      fragment: this.fragment,
      isIp: this.isIp,
      isPrivate: this.isPrivate,
      isIcann: this.isIcann
    };
  }
}
