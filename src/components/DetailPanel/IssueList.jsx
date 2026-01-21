import {
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  Label
} from '@patternfly/react-core';
import { FileCodeIcon } from '@patternfly/react-icons';

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'warning':
      return 'orange';
    case 'info':
      return 'blue';
    default:
      return 'grey';
  }
};

const IssueList = ({ issues }) => {
  if (!issues || issues.length === 0) {
    return (
      <div style={{
        color: '#6a6e73',
        textAlign: 'center',
        padding: '24px'
      }}>
        No issues found
      </div>
    );
  }

  return (
    <DataList aria-label="Issues list" isCompact>
      {issues.map((issue) => (
        <DataListItem key={issue.id}>
          <DataListItemRow>
            <DataListItemCells
              dataListCells={[
                <DataListCell key="content" width={5}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <strong style={{ flex: 1 }}>{issue.title}</strong>
                      <Label color={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Label>
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6a6e73'
                    }}>
                      {issue.description}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      color: '#6a6e73'
                    }}>
                      <FileCodeIcon size="sm" />
                      <code style={{ fontSize: '0.75rem' }}>
                        {issue.location}
                      </code>
                    </div>
                    {issue.type && (
                      <div>
                        <Label color="blue" isCompact>
                          {issue.type}
                        </Label>
                      </div>
                    )}
                  </div>
                </DataListCell>
              ]}
            />
          </DataListItemRow>
        </DataListItem>
      ))}
    </DataList>
  );
};

export default IssueList;
