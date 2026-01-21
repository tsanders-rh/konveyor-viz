/**
 * GitHub configuration for code browsing
 * Reads from localStorage for user-configured settings
 */

const STORAGE_KEY = 'github_repo_url';

export const githubConfig = {
  getRepoUrl: () => {
    return localStorage.getItem(STORAGE_KEY) || '';
  },

  setRepoUrl: (url) => {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  isConfigured: () => {
    return !!localStorage.getItem(STORAGE_KEY);
  },

  /**
   * Construct GitHub URL for file at specific line
   * @param {string} location - e.g., "Order.java:24"
   * @returns {string|null} - GitHub URL or null if not configured
   */
  getFileUrl: (location) => {
    const repoUrl = githubConfig.getRepoUrl();
    if (!repoUrl) return null;

    // Parse location: "filename.ext:123" or just "filename.ext"
    const match = location.match(/^(.+?)(?::(\d+))?$/);
    if (!match) return null;

    const [, filepath, lineNumber] = match;

    // Normalize GitHub repo URL
    // https://github.com/owner/repo → https://github.com/owner/repo/blob/main/
    let baseUrl = repoUrl.replace(/\/+$/, ''); // Remove trailing slashes
    if (!baseUrl.includes('/blob/')) {
      baseUrl += '/blob/main'; // Default branch
    }

    // Construct URL: https://github.com/owner/repo/blob/main/path/file.java#L24
    const fileUrl = `${baseUrl}/${filepath}`;
    return lineNumber ? `${fileUrl}#L${lineNumber}` : fileUrl;
  }
};

export default githubConfig;
