import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import GraphVisualization from './pages/GraphVisualization';
import QueryInterface from './pages/QueryInterface';

type Page = 'dashboard' | 'graph' | 'query';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'graph':
        return <GraphVisualization />;
      case 'query':
        return <QueryInterface />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                Local Knowledge Graph
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    currentPage === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('graph')}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    currentPage === 'graph'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Graph
                </button>
                <button
                  onClick={() => setCurrentPage('query')}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    currentPage === 'query'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Query
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
