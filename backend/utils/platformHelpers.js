import { SUPPORTED_PLATFORMS } from '../constants/platforms.js';

/**
 * Checks if a given URL matches any supported platform.
 * Returns the matching platform object or null if unsupported.
 *
 * @param {string} url
 * @returns {object|null}
 */
export const getPlatformByUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

    for (const platform of SUPPORTED_PLATFORMS) {
      // 1. Check if hostname matches any platform domain
      const isDomainMatch = platform.domains.some((d) => host === d || host.endsWith('.' + d));
      // 2. Or regex match
      const isPatternMatch = platform.pattern ? platform.pattern.test(url) : false;

      if (isDomainMatch || isPatternMatch) {
        return platform;
      }
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Returns a list of supported platform names as an array.
 * 
 * @returns {string[]}
 */
export const getSupportedPlatformNames = () => {
  return SUPPORTED_PLATFORMS.map((p) => p.name);
};
