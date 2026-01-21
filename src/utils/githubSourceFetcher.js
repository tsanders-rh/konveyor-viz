/**
 * GitHub Source Fetcher - Tier 3 Business Logic Enhancement
 * Fetches complete source files from GitHub for in-depth business logic analysis
 */

import githubConfig from '../config/githubConfig.js';

/**
 * In-memory cache for fetched source files
 * Prevents redundant API calls and rate limiting
 */
const sourceCache = new Map();

/**
 * Statistics for tracking fetch performance
 */
const stats = {
  hits: 0,
  misses: 0,
  errors: 0,
  bytesDownloaded: 0
};

/**
 * Convert GitHub blob URL to raw content URL
 * @param {string} blobUrl - GitHub blob URL (e.g., https://github.com/owner/repo/blob/main/file.java)
 * @returns {string} Raw content URL
 */
function convertToRawUrl(blobUrl) {
  // https://github.com/owner/repo/blob/main/path/file.java
  // → https://raw.githubusercontent.com/owner/repo/main/path/file.java
  return blobUrl
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/');
}

/**
 * Fetch source file from GitHub
 * @param {string} filePath - File path from Kantra issue (e.g., "Order.java" or "src/model/Order.java")
 * @param {Object} options - Fetch options
 * @returns {Promise<string|null>} Source code or null if failed
 */
export async function fetchSourceFile(filePath, options = {}) {
  const { useCache = true, timeout = 5000 } = options;

  // Check if GitHub is configured
  const repoUrl = githubConfig.getRepoUrl();
  if (!repoUrl) {
    return null; // Gracefully return null if no GitHub URL
  }

  // Check cache first
  const cacheKey = `${repoUrl}:${filePath}`;
  if (useCache && sourceCache.has(cacheKey)) {
    stats.hits++;
    return sourceCache.get(cacheKey);
  }

  stats.misses++;

  try {
    // Construct GitHub blob URL using existing config
    const blobUrl = githubConfig.getFileUrl(filePath);
    if (!blobUrl) {
      console.warn(`[GitHub Fetcher] Could not construct URL for: ${filePath}`);
      return null;
    }

    // Convert to raw URL for fetching
    const rawUrl = convertToRawUrl(blobUrl);

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(rawUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/plain'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[GitHub Fetcher] File not found: ${filePath}`);
      } else if (response.status === 403) {
        console.warn(`[GitHub Fetcher] Rate limited or forbidden: ${filePath}`);
      } else {
        console.warn(`[GitHub Fetcher] HTTP ${response.status} for: ${filePath}`);
      }
      stats.errors++;
      return null;
    }

    const sourceCode = await response.text();
    stats.bytesDownloaded += sourceCode.length;

    // Cache the result
    if (useCache) {
      sourceCache.set(cacheKey, sourceCode);
    }

    return sourceCode;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`[GitHub Fetcher] Timeout fetching: ${filePath}`);
    } else {
      console.warn(`[GitHub Fetcher] Error fetching ${filePath}:`, error.message);
    }
    stats.errors++;
    return null;
  }
}

/**
 * Batch fetch multiple source files
 * @param {Array<string>} filePaths - Array of file paths
 * @param {Object} options - Fetch options
 * @returns {Promise<Map<string, string>>} Map of filePath → source code
 */
export async function fetchSourceFiles(filePaths, options = {}) {
  const { concurrency = 5 } = options;

  const results = new Map();
  const uniquePaths = [...new Set(filePaths)]; // Remove duplicates

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < uniquePaths.length; i += concurrency) {
    const batch = uniquePaths.slice(i, i + concurrency);
    const promises = batch.map(async (filePath) => {
      const source = await fetchSourceFile(filePath, options);
      if (source) {
        results.set(filePath, source);
      }
    });

    await Promise.all(promises);
  }

  return results;
}

/**
 * Extract unique file paths from analysis data
 * @param {Object} analysisData - Konveyor analysis data
 * @returns {Array<string>} Unique file paths
 */
export function extractFilePaths(analysisData) {
  const filePaths = new Set();

  if (analysisData.components) {
    analysisData.components.forEach(component => {
      if (component.codeContext && component.codeContext.files) {
        component.codeContext.files.forEach(file => filePaths.add(file));
      }
      // Also extract from issues if codeContext not available
      if (component.issues) {
        component.issues.forEach(issue => {
          const location = issue.location;
          if (location) {
            // Remove line numbers (e.g., "Order.java:42" → "Order.java")
            const filePath = location.split(':')[0];
            filePaths.add(filePath);
          }
        });
      }
    });
  }

  return Array.from(filePaths);
}

/**
 * Enhance component data with full source code
 * @param {Object} component - Component object
 * @param {Map<string, string>} sourceMap - Map of filePath → source code
 * @returns {Object} Enhanced component with full source
 */
export function enhanceComponentWithSource(component, sourceMap) {
  const enhanced = { ...component };

  // Initialize or enhance code context
  if (!enhanced.codeContext) {
    enhanced.codeContext = {
      snippets: [],
      allImports: [],
      allClassNames: [],
      files: [],
      stats: { totalSnippets: 0, totalImports: 0, totalClasses: 0, totalFiles: 0 }
    };
  }

  // Add full source files
  enhanced.codeContext.fullSource = [];

  if (component.codeContext && component.codeContext.files) {
    component.codeContext.files.forEach(file => {
      if (sourceMap.has(file)) {
        enhanced.codeContext.fullSource.push({
          file: file,
          source: sourceMap.get(file),
          lines: sourceMap.get(file).split('\n').length
        });
      }
    });
  }

  // Update stats
  enhanced.codeContext.stats.totalSourceFiles = enhanced.codeContext.fullSource.length;
  enhanced.codeContext.stats.totalSourceLines = enhanced.codeContext.fullSource.reduce(
    (sum, s) => sum + s.lines, 0
  );

  return enhanced;
}

/**
 * Get fetcher statistics
 * @returns {Object} Statistics object
 */
export function getStats() {
  return {
    ...stats,
    cacheSize: sourceCache.size,
    hitRate: stats.hits / (stats.hits + stats.misses) || 0
  };
}

/**
 * Clear the source cache
 */
export function clearCache() {
  sourceCache.clear();
  stats.hits = 0;
  stats.misses = 0;
  stats.errors = 0;
  stats.bytesDownloaded = 0;
}

export default {
  fetchSourceFile,
  fetchSourceFiles,
  extractFilePaths,
  enhanceComponentWithSource,
  getStats,
  clearCache
};
