/**
 * Directory Upload Handler
 * Browser-based directory upload and parsing for kantra reports
 */

import { transformKantraReport } from './kantraTransformer.js';

/**
 * Load kantra report from browser-selected directory
 * @param {FileList} files - Files from directory input
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Transformed analysis data
 * @throws {Error} If loading or parsing fails
 */
export async function loadKantraFromDirectory(files, onProgress = null) {
  // Find output.yaml or output.yml
  let outputFile = null;
  let directoryName = '';

  for (const file of files) {
    const fileName = file.name.toLowerCase();
    if (fileName === 'output.yaml' || fileName === 'output.yml') {
      outputFile = file;
      // Extract directory name from file path
      const pathParts = file.webkitRelativePath?.split('/') || [];
      directoryName = pathParts[0] || 'Konveyor Analysis';
      break;
    }
  }

  if (!outputFile) {
    throw new Error(
      'output.yaml not found in selected directory. Please select a valid kantra output directory.'
    );
  }

  // Check file size (limit to 100MB in browser)
  const fileSizeMB = outputFile.size / (1024 * 1024);
  if (fileSizeMB > 100) {
    throw new Error(
      `File too large: ${fileSizeMB.toFixed(1)}MB. Files over 100MB may cause browser performance issues. Consider using the server-side loading option.`
    );
  }

  if (onProgress) {
    onProgress({ stage: 'reading', percent: 0 });
  }

  // Read the file
  const yamlContent = await readFileAsText(outputFile);

  if (onProgress) {
    onProgress({ stage: 'parsing', percent: 50 });
  }

  // Transform to visualization format
  try {
    const transformedData = transformKantraReport(yamlContent, {
      applicationName: `${directoryName} (Konveyor Analysis)`,
      analysisDate: new Date().toISOString().split('T')[0],
    });

    if (onProgress) {
      onProgress({ stage: 'complete', percent: 100 });
    }

    return transformedData;
  } catch (error) {
    throw new Error(`Failed to parse kantra report: ${error.message}`);
  }
}

/**
 * Read a File object as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File contents
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsText(file);
  });
}

/**
 * Create a directory input element for selecting directories
 * @param {Function} onChange - Callback when directory is selected
 * @returns {HTMLInputElement} Input element
 */
export function createDirectoryInput(onChange) {
  const input = document.createElement('input');
  input.type = 'file';
  input.setAttribute('webkitdirectory', '');
  input.setAttribute('directory', '');
  input.setAttribute('multiple', '');
  input.style.display = 'none';

  input.addEventListener('change', (event) => {
    if (event.target.files && event.target.files.length > 0) {
      onChange(event.target.files);
    }
  });

  return input;
}

/**
 * Trigger directory selection dialog
 * @returns {Promise<FileList>} Selected files
 */
export function selectDirectory() {
  return new Promise((resolve, reject) => {
    const input = createDirectoryInput((files) => {
      resolve(files);
      document.body.removeChild(input);
    });

    // Add to DOM (required for click to work)
    document.body.appendChild(input);

    // Trigger click
    input.click();

    // Handle cancel (no files selected)
    const handleCancel = () => {
      setTimeout(() => {
        if (input.parentNode) {
          document.body.removeChild(input);
          reject(new Error('Directory selection cancelled'));
        }
      }, 1000);
    };

    // Clean up on window blur (user might have cancelled)
    window.addEventListener('focus', handleCancel, { once: true });
  });
}

/**
 * Load kantra report with directory picker
 * Combines directory selection and loading in one step
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Transformed analysis data
 */
export async function loadKantraWithPicker(onProgress = null) {
  try {
    const files = await selectDirectory();
    return await loadKantraFromDirectory(files, onProgress);
  } catch (error) {
    if (error.message === 'Directory selection cancelled') {
      throw error;
    }
    throw new Error(`Failed to load kantra report: ${error.message}`);
  }
}
