import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DebtList } from './components/DebtList';
import { AIAdvisor } from './components/AIAdvisor';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'debts'>('dashboard');

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'dashboard' ? (
        <>
          <Dashboard />
          <AIAdvisor />
        </>
      ) : (
        <>
          <DebtList />
        </>
      )}
    </Layout>
  );
}

export default App;
