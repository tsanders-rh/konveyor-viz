import { useState } from 'react';
import { generateAllSpecKitFiles } from '../../utils/specKitGenerator';
import { createSpecKitZip, downloadZip, generateSpecKitFilename } from '../../utils/downloadUtils';

const SpecKitExportButton = ({ service, businessLogic, decomposition, data }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async (e) => {
    e.stopPropagation(); // Prevent parent click handlers
    setLoading(true);
    setError(null);

    try {
      // Generate all Spec-Kit files
      const files = generateAllSpecKitFiles(service, businessLogic, decomposition, data);

      // Create ZIP blob
      const blob = await createSpecKitZip(service.name, files);

      // Generate filename and trigger download
      const filename = generateSpecKitFilename(service.name);
      downloadZip(blob, filename);

      // Success - no need for notification as browser will show download
    } catch (err) {
      console.error('Spec-Kit export failed:', err);
      setError('Export failed. Please try again.');

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleExport}
        disabled={loading}
        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Download Spec-Kit for this microservice"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>...</span>
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Spec-Kit
          </>
        )}
      </button>
      {error && (
        <div className="text-xs text-red-600 mt-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default SpecKitExportButton;
