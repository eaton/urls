import { getDomain, getPublicSuffix, getSubdomain } from 'tldts';
import path from 'path';

export function parse(input: string, base?: string | URL) {
  return new ParsedUrl(input, base);
}

export class ParsedUrl extends URL {
  get domain(): string {
    return getDomain(this.hostname) ?? '';
  }

  set domain(value: string | undefined) {
    this.hostname = [this.subdomain, value].join('.');
  }

  get domainWithoutSuffix(): string {
    return parse(this.href).domainWithoutSuffix ?? '';
  }

  set domainWithoutSuffix(value: string) {
    this.hostname = [this.subdomain, value, this.publicSuffix].join('.');
  }

  get subdomain(): string {
    return getSubdomain(this.hostname) ?? '';
  }

  set subdomain(value: string | undefined) {
    this.hostname = [value, this.domain].filter(v => v && v.trim().length > 0).join('.');
  }

  get publicSuffix(): string {
    return getPublicSuffix(this.hostname) ?? '';
  }

  set publicSuffix(value: string) {
    this.hostname = [this.subdomain, this.domainWithoutSuffix, value].join('.');
  }

  get fragment(): string {
    return this.hash.slice(1);
  }

  set fragment(value: string) {
    this.hash = '#' + value;
  }

  get path(): string[] {
    if (this.pathname === '/') return [];
    return this.pathname.slice(1).split('/');
  }

  get file(): string {
    return path.parse(this.pathname).base;
  }

  get extension(): string {
    return path.parse(this.pathname).ext;
  }

  get properties() {
    const searchParameters: Record<string, string | string[]> = {};
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
    };
  }
}