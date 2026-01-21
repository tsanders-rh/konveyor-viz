import { useState, useEffect } from 'react';
import {
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Button,
  Alert,
  Spinner,
  Divider,
} from '@patternfly/react-core';
import { FolderOpenIcon, UploadIcon } from '@patternfly/react-icons';
import { loadKantraFromPath, isBackendAvailable } from '../../services/kantraService';
import { loadKantraWithPicker } from '../../utils/directoryUploadHandler';

const LoadReportModal = ({ isOpen, onClose, onLoadSuccess, onLoadError }) => {
  const [directoryPath, setDirectoryPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMethod, setLoadingMethod] = useState(''); // 'path' or 'upload'
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Check backend availability when modal opens
  useEffect(() => {
    if (isOpen) {
      checkBackend();
    }
  }, [isOpen]);

  const checkBackend = async () => {
    const available = await isBackendAvailable();
    setBackendAvailable(available);
  };

  const handleLoadFromPath = async () => {
    if (!directoryPath.trim()) {
      setError('Please enter a directory path');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingMethod('path');

    try {
      const data = await loadKantraFromPath(directoryPath);
      onLoadSuccess(data);
      handleClose();
    } catch (err) {
      setError(err.message);
      if (onLoadError) {
        onLoadError(err);
      }
    } finally {
      setLoading(false);
      setLoadingMethod('');
    }
  };

  const handleLoadFromUpload = async () => {
    console.log('handleLoadFromUpload called');
    setLoading(true);
    setError(null);
    setLoadingMethod('upload');

    try {
      console.log('Calling loadKantraWithPicker...');
      const data = await loadKantraWithPicker();
      console.log('Data loaded:', data);
      onLoadSuccess(data);
      handleClose();
    } catch (err) {
      console.error('Error in handleLoadFromUpload:', err);
      if (err.message !== 'Directory selection cancelled') {
        setError(err.message);
        if (onLoadError) {
          onLoadError(err);
        }
      }
    } finally {
      setLoading(false);
      setLoadingMethod('');
    }
  };

  const handleClose = () => {
    setDirectoryPath('');
    setError(null);
    setLoading(false);
    setLoadingMethod('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && directoryPath.trim()) {
      handleLoadFromPath();
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title="Load Kantra Report"
      isOpen={isOpen}
      onClose={handleClose}
      actions={[
        <Button key="cancel" variant="link" onClick={handleClose} isDisabled={loading}>
          Cancel
        </Button>
      ]}
    >
      <div style={{ padding: '1rem 2.5rem 1.5rem 2.5rem' }}>
        {error && (
          <Alert
            variant="danger"
            title="Error loading report"
            isInline
            style={{ marginBottom: '1rem' }}
          >
            {error}
          </Alert>
        )}

        {!backendAvailable && (
          <Alert
            variant="warning"
            title="Backend server not available"
            isInline
            style={{ marginBottom: '1rem' }}
          >
            Path-based loading requires the backend server. Please start the server or use the
            directory upload option instead.
          </Alert>
        )}

        <Form>
          {/* Option 1: Load from Path */}
          <FormGroup
            label="Load from Directory Path"
            fieldId="directory-path"
          >
            <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)', marginBottom: '0.5rem' }}>
              Enter the absolute path to your kantra output directory
            </div>
            <TextInput
              id="directory-path"
              type="text"
              value={directoryPath}
              onChange={(_event, value) => setDirectoryPath(value)}
              onKeyDown={handleKeyDown}
              placeholder="/path/to/kantra/output"
              isDisabled={loading || !backendAvailable}
              aria-label="Directory path"
            />
            <Button
              variant="primary"
              onClick={handleLoadFromPath}
              isDisabled={loading || !directoryPath.trim() || !backendAvailable}
              icon={loadingMethod === 'path' ? <Spinner size="sm" /> : <FolderOpenIcon />}
              style={{ marginTop: '1rem' }}
            >
              {loadingMethod === 'path' ? 'Loading...' : 'Load from Path'}
            </Button>
          </FormGroup>

          <Divider style={{ margin: '1.5rem 0' }} />

          {/* Option 2: Upload Directory */}
          <FormGroup
            label="Upload Directory"
            fieldId="directory-upload"
          >
            <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)', marginBottom: '0.5rem' }}>
              Select your kantra output directory using the file browser
            </div>
            <Button
              variant="secondary"
              onClick={handleLoadFromUpload}
              isDisabled={loading}
              icon={loadingMethod === 'upload' ? <Spinner size="sm" /> : <UploadIcon />}
              isBlock
            >
              {loadingMethod === 'upload' ? 'Loading...' : 'Browse Directory'}
            </Button>
          </FormGroup>
        </Form>

        <Divider style={{ margin: '1.5rem 0' }} />

        <div style={{ marginTop: '1rem' }}>
          <h6 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            Expected Directory Structure:
          </h6>
          <pre style={{ fontSize: '0.8rem', color: 'var(--pf-v6-global--Color--200)', margin: 0 }}>
{`kantra-output/
├── output.yaml       (required)
├── analysis.log      (optional)
└── static-report/    (optional)`}
          </pre>
        </div>
      </div>
    </Modal>
  );
};

export default LoadReportModal;
