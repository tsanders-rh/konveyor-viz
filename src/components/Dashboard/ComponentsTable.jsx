import { useState, useMemo } from 'react';
import {
  Card,
  CardBody,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Label,
  Badge,
  Button,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td
} from '@patternfly/react-table';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const ComponentsTable = ({ data, onComponentClick }) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeSortIndex, setActiveSortIndex] = useState(0);
  const [activeSortDirection, setActiveSortDirection] = useState('asc');

  // Prepare table data
  const tableData = useMemo(() => {
    return data.components.map(component => ({
      name: component.name,
      type: component.type,
      linesOfCode: component.linesOfCode || 0,
      totalIssues: component.issues.length,
      critical: component.issues.filter(i => i.severity === 'critical').length,
      warning: component.issues.filter(i => i.severity === 'warning').length,
      info: component.issues.filter(i => i.severity === 'info').length,
      language: component.technology?.language || 'Unknown',
      framework: component.technology?.framework || 'Unknown',
      frameworkStatus: component.technology?.frameworkStatus || 'current',
      dependencies: component.dependencies?.length || 0,
      component: component // Store full component for click handler
    }));
  }, [data.components]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchValue) return tableData;
    const search = searchValue.toLowerCase();
    return tableData.filter(row =>
      row.name.toLowerCase().includes(search) ||
      row.type.toLowerCase().includes(search) ||
      row.language.toLowerCase().includes(search) ||
      row.framework.toLowerCase().includes(search)
    );
  }, [tableData, searchValue]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    const columnKey = columnNames[activeSortIndex];

    sorted.sort((a, b) => {
      let aValue = a[columnKey];
      let bValue = b[columnKey];

      // Handle string vs number comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return activeSortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return activeSortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredData, activeSortIndex, activeSortDirection]);

  const columnNames = ['name', 'type', 'linesOfCode', 'totalIssues', 'critical', 'warning', 'info', 'language', 'framework', 'dependencies'];

  const getSortParams = (columnIndex) => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'frontend': return 'blue';
      case 'backend': return 'green';
      case 'middleware': return 'purple';
      case 'data': return 'cyan';
      case 'infrastructure': return 'orange';
      default: return 'grey';
    }
  };

  const getFrameworkStatusColor = (status) => {
    switch (status) {
      case 'current': return 'green';
      case 'outdated': return 'orange';
      case 'eol': return 'red';
      default: return 'grey';
    }
  };

  return (
    <Card>
      <CardBody>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem variant="search-filter">
              <SearchInput
                placeholder="Search components..."
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem variant="separator" />
            <ToolbarItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                  Showing {sortedData.length} of {tableData.length} components
                </span>
              </div>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <Table aria-label="Components table" variant="compact">
          <Thead>
            <Tr>
              <Th sort={getSortParams(0)}>Component</Th>
              <Th sort={getSortParams(1)}>Type</Th>
              <Th sort={getSortParams(2)}>Lines of Code</Th>
              <Th sort={getSortParams(3)}>Total Issues</Th>
              <Th sort={getSortParams(4)}>Critical</Th>
              <Th sort={getSortParams(5)}>Warning</Th>
              <Th sort={getSortParams(6)}>Info</Th>
              <Th sort={getSortParams(7)}>Language</Th>
              <Th sort={getSortParams(8)}>Framework</Th>
              <Th sort={getSortParams(9)}>Dependencies</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.length === 0 ? (
              <Tr>
                <Td colSpan={11}>
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6a6e73' }}>
                    {searchValue ? `No components found matching "${searchValue}"` : 'No components available'}
                  </div>
                </Td>
              </Tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <Tr key={rowIndex}>
                  <Td dataLabel="Component">
                    <div style={{ fontWeight: '600' }}>{row.name}</div>
                  </Td>
                  <Td dataLabel="Type">
                    <Label color={getTypeColor(row.type)} isCompact>
                      {row.type}
                    </Label>
                  </Td>
                  <Td dataLabel="Lines of Code">
                    {row.linesOfCode.toLocaleString()}
                  </Td>
                  <Td dataLabel="Total Issues">
                    <Badge isRead={row.totalIssues === 0}>
                      {row.totalIssues}
                    </Badge>
                  </Td>
                  <Td dataLabel="Critical">
                    {row.critical > 0 ? (
                      <Badge style={{ backgroundColor: 'var(--pf-v5-global--danger-color--100)' }}>
                        {row.critical}
                      </Badge>
                    ) : (
                      <span style={{ color: '#6a6e73' }}>0</span>
                    )}
                  </Td>
                  <Td dataLabel="Warning">
                    {row.warning > 0 ? (
                      <Badge style={{ backgroundColor: 'var(--pf-v5-global--warning-color--100)' }}>
                        {row.warning}
                      </Badge>
                    ) : (
                      <span style={{ color: '#6a6e73' }}>0</span>
                    )}
                  </Td>
                  <Td dataLabel="Info">
                    {row.info > 0 ? (
                      <Badge style={{ backgroundColor: 'var(--pf-v5-global--info-color--100)' }}>
                        {row.info}
                      </Badge>
                    ) : (
                      <span style={{ color: '#6a6e73' }}>0</span>
                    )}
                  </Td>
                  <Td dataLabel="Language">
                    {row.language}
                  </Td>
                  <Td dataLabel="Framework">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{row.framework}</span>
                      {row.frameworkStatus !== 'current' && (
                        <Label color={getFrameworkStatusColor(row.frameworkStatus)} isCompact>
                          {row.frameworkStatus}
                        </Label>
                      )}
                    </div>
                  </Td>
                  <Td dataLabel="Dependencies">
                    {row.dependencies}
                  </Td>
                  <Td dataLabel="Actions">
                    <Button
                      variant="link"
                      icon={<ExternalLinkAltIcon />}
                      onClick={() => onComponentClick(row.component)}
                      style={{ padding: 0 }}
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default ComponentsTable;
