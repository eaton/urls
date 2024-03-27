export type Normalizer<T extends URL = URL> = (url: T, ...options: unknown[])  => T;

export const defaultNormalizer: Normalizer = (url) => {
  return url;
}