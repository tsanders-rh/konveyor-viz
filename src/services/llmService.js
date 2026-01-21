import { getActiveProvider, LLM_PROVIDERS } from '../config/llmConfig';
import githubConfig from '../config/githubConfig.js';
import githubSourceFetcher from '../utils/githubSourceFetcher.js';

/**
 * LLM Service - Calls backend proxy to generate AI insights
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class LLMService {
  /**
   * Generate AI insights for Konveyor analysis via backend proxy
   */
  async generateInsights(analysisData) {
    const provider = getActiveProvider();

    if (provider === LLM_PROVIDERS.NONE) {
      return null; // Fall back to rule-based insights
    }

    try {
      console.log('Calling backend API at:', `${API_BASE_URL}/api/insights`);

      const response = await fetch(`${API_BASE_URL}/api/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analysisData })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Backend API response:', result);
      return result;
    } catch (error) {
      console.error('LLM Service Error:', error);
      return null; // Gracefully fall back to rule-based
    }
  }

  /**
   * Enhance analysis data with GitHub source code (Tier 3)
   * @param {Object} analysisData - Konveyor analysis data
   * @returns {Promise<Object>} Enhanced data with full source code
   */
  async enhanceWithGitHubSource(analysisData) {
    // Check if GitHub is configured
    if (!githubConfig.isConfigured()) {
      console.log('[LLM Service] GitHub not configured, using Tier 2 (snippets only)');
      return analysisData;
    }

    try {
      console.log('[LLM Service] GitHub configured, fetching source files for Tier 3 analysis...');

      // Extract all unique file paths
      const filePaths = githubSourceFetcher.extractFilePaths(analysisData);
      console.log(`[LLM Service] Found ${filePaths.length} unique files to fetch`);

      // Fetch source files (with caching and concurrency control)
      const sourceMap = await githubSourceFetcher.fetchSourceFiles(filePaths, {
        concurrency: 3, // Conservative to avoid rate limits
        timeout: 10000
      });

      console.log(`[LLM Service] Successfully fetched ${sourceMap.size}/${filePaths.length} files`);

      // Enhance components with full source
      const enhancedData = { ...analysisData };
      enhancedData.components = analysisData.components.map(component =>
        githubSourceFetcher.enhanceComponentWithSource(component, sourceMap)
      );

      // Add metadata
      enhancedData._enhancementStats = {
        tier: 'Tier 3: Full Source',
        filesRequested: filePaths.length,
        filesFetched: sourceMap.size,
        ...githubSourceFetcher.getStats()
      };

      return enhancedData;

    } catch (error) {
      console.warn('[LLM Service] GitHub source fetch failed, falling back to Tier 2:', error);
      return analysisData; // Graceful fallback
    }
  }

  /**
   * Generate microservices decomposition strategy
   */
  async generateMicroservicesDecomposition(analysisData) {
    const provider = getActiveProvider();

    if (provider === LLM_PROVIDERS.NONE) {
      return null;
    }

    try {
      // Enhance with GitHub source if configured (Tier 3)
      const enhancedData = await this.enhanceWithGitHubSource(analysisData);

      console.log('Calling backend API for microservices decomposition');
      if (enhancedData._enhancementStats) {
        console.log(`Analysis Tier: ${enhancedData._enhancementStats.tier}`);
        console.log(`Files fetched: ${enhancedData._enhancementStats.filesFetched}/${enhancedData._enhancementStats.filesRequested}`);
      }

      const response = await fetch(`${API_BASE_URL}/api/decomposition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analysisData: enhancedData })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Decomposition result:', result);
      return result;
    } catch (error) {
      console.error('Microservices Decomposition Error:', error);
      throw error;
    }
  }

  /**
   * Check backend health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return null;
    }
  }
}

export default new LLMService();
