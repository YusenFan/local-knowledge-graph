import { useState, useEffect } from 'react';
import backendAPI from '../services/api';
import type { GraphData } from '../services/api';

declare const cytoscape: any;

export default function GraphVisualization() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraph();
  }, []);

  useEffect(() => {
    if (graphData && document.getElementById('cy')) {
      cytoscape({
        container: document.getElementById('cy'),
        elements: [
          ...graphData.nodes.map((node) => ({
            data: node,
            position: { x: Math.random() * 100, y: Math.random() * 100 },
          })),
          ...graphData.edges.map((edge) => ({ data: edge })),
        ],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              label: 'data(label)',
              width: 20,
              height: 20,
            },
          },
          {
            selector: 'node[type="file"]',
            style: {
              'background-color': '#4287f5',
            },
          },
          {
            selector: 'node[type="directory"]',
            style: {
              'background-color': '#ff6b6b',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#ccc',
            },
          },
        ],
        layout: {
          name: 'circle',
        },
      });
      setLoading(false);
    }
  }, [graphData]);

  const fetchGraph = async () => {
    try {
      const response = await backendAPI.getGraph(100);
      setGraphData(response.data);
    } catch (err) {
      console.error('Failed to fetch graph:', err);
      setError('Failed to load graph data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading graph...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Graph Container */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Graph Visualization</h1>
        <div id="cy" className="w-full h-full bg-white rounded-lg shadow" />
      </div>
    </div>
  );
}
