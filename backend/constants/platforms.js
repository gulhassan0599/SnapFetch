/**
 * Registry of approved and supported platforms for SnapFetch.
 * Each platform defines its unique identifier, display name, domains, and regex patterns.
 */

export const SUPPORTED_PLATFORMS = Object.freeze([
  {
    id: 'youtube',
    name: 'YouTube',
    domains: ['youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com'],
    pattern: /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com\/(watch\?.*v=|shorts\/|live\/|embed\/)|youtu\.be\/)/i
  },
  {
    id: 'instagram',
    name: 'Instagram',
    domains: ['instagram.com', 'instagr.am'],
    pattern: /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\//i
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    domains: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
    pattern: /^(https?:\/\/)?(www\.|vm\.|vt\.)?tiktok\.com\//i
  },
  {
    id: 'facebook',
    name: 'Facebook',
    domains: ['facebook.com', 'fb.watch', 'fb.com'],
    pattern: /^(https?:\/\/)?(www\.|web\.|m\.)?(facebook\.com|fb\.watch|fb\.com)\//i
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    domains: ['twitter.com', 'x.com'],
    pattern: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\//i
  },
  {
    id: 'dailymotion',
    name: 'Dailymotion',
    domains: ['dailymotion.com', 'dai.ly'],
    pattern: /^(https?:\/\/)?(www\.)?(dailymotion\.com\/video\/|dai\.ly\/)/i
  },
  {
    id: 'reddit',
    name: 'Reddit',
    domains: ['reddit.com', 'v.redd.it', 'redd.it'],
    pattern: /^(https?:\/\/)?(www\.|old\.)?(reddit\.com\/r\/|v\.redd\.it\/|redd\.it\/)/i
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    domains: ['pinterest.com', 'pin.it'],
    pattern: /^(https?:\/\/)?(www\.|[a-z]{2}\.)?(pinterest\.com\/pin\/|pin\.it\/)/i
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    domains: ['soundcloud.com', 'm.soundcloud.com'],
    pattern: /^(https?:\/\/)?(www\.|m\.)?soundcloud\.com\//i
  },
  {
    id: 'twitch',
    name: 'Twitch',
    domains: ['twitch.tv', 'clips.twitch.tv'],
    pattern: /^(https?:\/\/)?(www\.|clips\.)?twitch\.tv\//i
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    domains: ['linkedin.com'],
    pattern: /^(https?:\/\/)?(www\.)?linkedin\.com\/(posts|feed\/update|embed)\//i
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    domains: ['vimeo.com'],
    pattern: /^(https?:\/\/)?(www\.|player\.)?vimeo\.com\//i
  }
]);

export default SUPPORTED_PLATFORMS;
