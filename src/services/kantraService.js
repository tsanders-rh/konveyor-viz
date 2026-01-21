/**
 * Kantra Report Loading Service
 * API client for loading kantra analysis reports
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Load kantra report from a directory path (backend method)
 * @param {string} directoryPath - Absolute path to kantra output directory
 * @returns {Promise<Object>} Transformed analysis data
 * @throws {Error} If loading fails
 */
export async function loadKantraFromPath(directoryPath) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/load-kantra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ directoryPath }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.details || `Server error: ${response.status}`
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.components || !data.summary) {
      throw new Error('Invalid data format received from server');
    }

    return data;
  } catch (error) {
    // Enhance error message for network issues
    if (error.message === 'Failed to fetch') {
      throw new Error(
        'Cannot connect to backend server. Make sure the server is running on port 3001.'
      );
    }
    throw error;
  }
}

/**
 * Check if backend server is available
 * @returns {Promise<boolean>} True if server is reachable
 */
export async function isBackendAvailable() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Validate that a data object matches the expected format
 * @param {Object} data - Data to validate
 * @returns {boolean} True if valid
 */
export function validateAnalysisData(data) {
  if (!data || typeof data !== 'object') return false;

  // Check required fields
  const hasComponents = Array.isArray(data.components);
  const hasSummary = data.summary && typeof data.summary === 'object';
  const hasAppName = typeof data.applicationName === 'string';

  if (!hasComponents || !hasSummary || !hasAppName) {
    return false;
  }

  // Validate summary fields
  const requiredSummaryFields = [
    'totalComponents',
    'totalIssues',
    'critical',
    'warning',
    'info',
  ];
  const hasAllSummaryFields = requiredSummaryFields.every(
    (field) => typeof data.summary[field] === 'number'
  );

  if (!hasAllSummaryFields) {
    return false;
  }

  // Validate components structure
  if (data.components.length > 0) {
    const firstComponent = data.components[0];
    const requiredComponentFields = ['id', 'name', 'type', 'issues'];
    const hasRequiredFields = requiredComponentFields.every(
      (field) => field in firstComponent
    );

    if (!hasRequiredFields) {
      return false;
    }
  }

  return true;
}
