import { Normalizer, defaultNormalizer } from './default-normalizer.js';
import { ParsedUrl } from '../parsed-url.js';
import { canParse } from '../index.js';

interface NormalizedUrlData {
  href: string,
  raw?: string
}

interface NormalizedUrlOptions {
  base?: string | URL,
  normalizer?: Normalizer
}

export function normalize(input: string | URL, options?: NormalizedUrlOptions) {
  return new NormalizedUrl(input, options);
}

export class NormalizedUrl extends ParsedUrl {
  static normalizer = defaultNormalizer;
  readonly raw: string | undefined;

  constructor(input: string | URL | NormalizedUrlData, options?: string | URL | NormalizedUrlOptions) {
    let normalizer = NormalizedUrl.normalizer;
    let baseUrl: string | undefined;

    if (typeof options === 'string' || options instanceof URL) {
      baseUrl = options.toString();
    } else {
      baseUrl = options?.base?.toString();
      normalizer = options?.normalizer ?? NormalizedUrl.normalizer;
    }

    if (typeof input === 'string' || input instanceof URL) {
      super(input.toString(), baseUrl);
    } else {
      super(input.href, baseUrl);
      this.raw = input.raw;
    }

    if (!this.raw) {
      this.raw = this.href;
      this.href = normalizer(this).href;
    }
  }

  get properties() {
    return {
      ...super.properties,
      raw: this.raw,
    }
  }
}