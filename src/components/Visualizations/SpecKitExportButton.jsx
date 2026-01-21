import { useState } from 'react';
import { Button, Spinner } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <Button
        variant="secondary"
        onClick={handleExport}
        isDisabled={loading}
        isSmall
        icon={loading ? <Spinner size="sm" /> : <DownloadIcon />}
        title="Download Spec-Kit for this microservice"
      >
        {loading ? 'Exporting...' : 'Spec-Kit'}
      </Button>
      {error && (
        <div style={{
          fontSize: 'var(--pf-v5-global--FontSize--xs)',
          color: 'var(--pf-v5-global--danger-color--100)',
          marginTop: 'var(--pf-v5-global--spacer--xs)'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SpecKitExportButton;
