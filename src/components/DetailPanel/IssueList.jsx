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
        color: 'var(--pf-v5-global--Color--200)',
        textAlign: 'center',
        padding: 'var(--pf-v5-global--spacer--xl)'
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pf-v5-global--spacer--sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--pf-v5-global--spacer--sm)' }}>
                      <strong style={{ flex: 1 }}>{issue.title}</strong>
                      <Label color={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Label>
                    </div>
                    <div style={{
                      fontSize: 'var(--pf-v5-global--FontSize--sm)',
                      color: 'var(--pf-v5-global--Color--200)'
                    }}>
                      {issue.description}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--pf-v5-global--spacer--xs)',
                      fontSize: 'var(--pf-v5-global--FontSize--xs)',
                      color: 'var(--pf-v5-global--Color--200)'
                    }}>
                      <FileCodeIcon size="sm" />
                      <code style={{ fontSize: 'var(--pf-v5-global--FontSize--xs)' }}>
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
