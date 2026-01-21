import { useState, useEffect } from 'react';
import {
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Button,
  Alert,
} from '@patternfly/react-core';
import githubConfig from '../../config/githubConfig';

const SettingsModal = ({ isOpen, onClose }) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  // Load current value when modal opens
  useEffect(() => {
    if (isOpen) {
      setGithubUrl(githubConfig.getRepoUrl());
      setSavedMessage(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    githubConfig.setRepoUrl(githubUrl);
    setSavedMessage(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    githubConfig.setRepoUrl('');
    setGithubUrl('');
    setSavedMessage(false);
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title="Settings"
      isOpen={isOpen}
      onClose={onClose}
      actions={[
        <Button key="save" variant="primary" onClick={handleSave}>
          Save
        </Button>,
        <Button key="clear" variant="secondary" onClick={handleClear}>
          Clear
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      ]}
    >
      <div style={{ padding: '1rem 2.5rem 1.5rem 2.5rem' }}>
        {savedMessage && (
          <Alert
            variant="success"
            title="Settings saved"
            isInline
            style={{ marginBottom: '1rem' }}
          >
            Your GitHub repository URL has been saved.
          </Alert>
        )}

        <Form>
          <FormGroup
            label="GitHub Repository URL"
            fieldId="github-url"
          >
            <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)', marginBottom: '0.5rem' }}>
              Enter the URL to your GitHub repository (e.g., https://github.com/owner/repo)
            </div>
            <TextInput
              id="github-url"
              type="url"
              value={githubUrl}
              onChange={(_event, value) => setGithubUrl(value)}
              placeholder="https://github.com/owner/repository"
              aria-label="GitHub repository URL"
            />
            <div style={{ fontSize: '0.75rem', color: '#6a6e73', marginTop: '0.5rem' }}>
              File locations in issues will become clickable links to your code in GitHub
            </div>
          </FormGroup>
        </Form>
      </div>
    </Modal>
  );
};

export default SettingsModal;
