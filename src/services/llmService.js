import { getActiveProvider, LLM_PROVIDERS } from '../config/llmConfig';

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
   * Generate microservices decomposition strategy
   */
  async generateMicroservicesDecomposition(analysisData) {
    const provider = getActiveProvider();

    if (provider === LLM_PROVIDERS.NONE) {
      return null;
    }

    try {
      console.log('Calling backend API for microservices decomposition');

      const response = await fetch(`${API_BASE_URL}/api/decomposition`, {
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
