export { URLPattern } from 'urlpattern-polyfill';

declare const canParse: (url: string | URL, base?: string | undefined) => boolean;
declare function parse(input: string, base?: string | URL): ParsedUrl;
declare function safeParse(input: string, base?: string | URL): {
    success: false;
} | {
    success: true;
    url: ParsedUrl;
};
declare class ParsedUrl extends URL {
    get domain(): string;
    set domain(value: string | undefined);
    get domainWithoutSuffix(): string;
    set domainWithoutSuffix(value: string);
    get subdomain(): string;
    set subdomain(value: string | undefined);
    get publicSuffix(): string;
    set publicSuffix(value: string);
    get fragment(): string;
    set fragment(value: string);
    get path(): string[];
    get file(): string;
    get extension(): string;
    get isIp(): boolean;
    get isIcann(): boolean;
    get isPrivate(): boolean;
    get properties(): {
        href: string;
        protocol: string;
        username: string;
        password: string;
        origin: string;
        host: string;
        hostname: string;
        subdomain: string;
        domain: string;
        domainWithoutSuffix: string;
        publicSuffix: string;
        port: string;
        pathname: string;
        path: string[];
        file: string;
        extension: string;
        search: string;
        searchParams: Record<string, string | string[]>;
        hash: string;
        fragment: string;
        isIp: boolean;
        isPrivate: boolean;
        isIcann: boolean;
    };
}

type Normalizer = (url: NormalizedUrl, options?: NormalizerOptions) => NormalizedUrl;
interface NormalizedUrlData {
    href: string;
    raw?: string;
}
interface NormalizerOptions extends Record<string, unknown> {
    /**
     * An optional base URL for parsing partial paths.
     */
    base?: string | URL;
    /**
     * Override the URL Normalizer with a custom function; it should accept, and return, an
     * instance of NormalizedUrl.
     */
    normalizer?: Normalizer;
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
    sortSearchParams?: 'asc' | 'desc' | boolean;
    /**
     * Brute force search and replace in the URL's href string. By default, only the first match
     * will be replaced. If `replace.multi` is set to TRUE and a regular expression is used,
     * the regexp must have its global (`/g`) flag set.
     */
    replace?: {
        pattern: string | RegExp;
        replacement: string;
        multi?: boolean;
    };
}
declare function normalize(input: string | URL, options?: NormalizerOptions): NormalizedUrl;
declare function safeNormalize(input: string | URL, options?: NormalizerOptions): {
    success: false;
} | {
    success: true;
    url: NormalizedUrl;
};
declare class NormalizedUrl extends ParsedUrl {
    static get defaultNormalizer(): Normalizer;
    static defaultOptions: NormalizerOptions;
    static normalizer: Normalizer;
    readonly raw: string | undefined;
    /**
     * Creates an instance of NormalizedUrl.
     *
     * @constructor
     * @param input The URL to convert; it can be a string, an existing instance of the URL class, or
     * any object with { href: string } and { raw: string } properties.
     * @param {?(string | URL | NormalizedUrlOptions)} [options]
     */
    constructor(input: string | URL | NormalizedUrlData, options?: string | URL | NormalizerOptions);
    get properties(): {
        raw: string | undefined;
        href: string;
        protocol: string;
        username: string;
        password: string;
        origin: string;
        host: string;
        hostname: string;
        subdomain: string;
        domain: string;
        domainWithoutSuffix: string;
        publicSuffix: string;
        port: string;
        pathname: string;
        path: string[];
        file: string;
        extension: string;
        search: string;
        searchParams: Record<string, string | string[]>;
        hash: string;
        fragment: string;
        isIp: boolean;
        isPrivate: boolean;
        isIcann: boolean;
    };
}

export { NormalizedUrl, type Normalizer, type NormalizerOptions, ParsedUrl, canParse, normalize, parse, safeNormalize, safeParse };
