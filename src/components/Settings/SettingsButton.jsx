import { Button } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';

const SettingsButton = ({ onClick }) => {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      icon={<CogIcon />}
      title="Settings"
    >
      Settings
    </Button>
  );
};

export default SettingsButton;
