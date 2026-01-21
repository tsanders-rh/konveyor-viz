import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import sampleData from './data/sampleData.json';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header
        applicationName={sampleData.applicationName}
        analysisDate={sampleData.analysisDate}
      />
      <Dashboard data={sampleData} />
    </div>
  );
}

export default App;
