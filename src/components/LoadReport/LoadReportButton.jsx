import { Button } from '@patternfly/react-core';
import { UploadIcon } from '@patternfly/react-icons';

const LoadReportButton = ({ onClick }) => {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      icon={<UploadIcon />}
      title="Load Kantra Report"
    >
      Load Report
    </Button>
  );
};

export default LoadReportButton;
