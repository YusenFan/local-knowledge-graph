import { useState, useEffect } from 'react';
import backendAPI from '../services/api';
import type { ScanResult } from '../services/api';

export default function Dashboard() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanPath, setScanPath] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await backendAPI.getHealth();
      setHealth(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!scanPath.trim()) return;

    setScanning(true);
    try {
      const response = await backendAPI.scanDirectory(scanPath, {
        maxDepth: 2,
        includeHidden: false,
      });
      setScanResult(response.data);
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Scan failed. Please check the console for details.');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Local Knowledge Graph</h1>

      {/* Health Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        {health ? (
          <div className="space-y-2">
            <p>✅ Server: <span className="text-green-600">Running</span></p>
            <p>Version: <span className="text-gray-600">{health.version}</span></p>
            <p>Timestamp: <span className="text-gray-600">{health.timestamp}</span></p>
          </div>
        ) : (
          <p className="text-red-600">Failed to connect to backend</p>
        )}
      </div>

      {/* Scan Interface */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Scan Directory</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Directory Path
            </label>
            <input
              type="text"
              value={scanPath}
              onChange={(e) => setScanPath(e.target.value)}
              placeholder="/home/ubuntu/projects"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleScan}
            disabled={scanning || !scanPath.trim()}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              scanning || !scanPath.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {scanning ? 'Scanning...' : 'Scan Directory'}
          </button>

            {scanResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Scan Results</h3>
              <div className="space-y-1 text-sm">
                <p>Files: {scanResult.result?.stats.totalFiles || 0}</p>
                <p>Directories: {scanResult.result?.stats.totalDirectories || 0}</p>
                <p>Scan Time: {scanResult.result?.stats.scanTime || 0}ms</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <a
            href="/graph"
            className="text-center py-4 px-6 bg-blue-50 hover:bg-blue-100 rounded-md transition"
          >
            View Graph
          </a>
          <a
            href="/query"
            className="text-center py-4 px-6 bg-green-50 hover:bg-green-100 rounded-md transition"
          >
            Query Knowledge Graph
          </a>
        </div>
      </div>
    </div>
  );
}
