import { useState } from 'react';
import { Page } from '@patternfly/react-core';
import AppMasthead from './components/Layout/AppMasthead';
import AppSidebar from './components/Layout/AppSidebar';
import Dashboard from './components/Dashboard/Dashboard';
import sampleData from './data/sampleData.json';

function App() {
  const [selectedNav, setSelectedNav] = useState('overview');

  return (
    <Page
      header={<AppMasthead data={sampleData} />}
      sidebar={<AppSidebar activeItem={selectedNav} onSelect={setSelectedNav} />}
    >
      <Dashboard data={sampleData} activeView={selectedNav} />
    </Page>
  );
}

export default App;
