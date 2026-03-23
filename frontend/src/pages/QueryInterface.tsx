import { useState } from 'react';
import backendAPI from '../services/api';
import type { QueryResponse } from '../services/api';

export default function QueryInterface() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await backendAPI.queryGraph(query);
      setResult(response.data);
    } catch (err) {
      console.error('Query failed:', err);
      setError('Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await backendAPI.getQuerySuggestions();
      setSuggestions(response.data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Query Knowledge Graph</h1>

      {/* Query Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What files are in my project?"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`flex-1 py-3 px-4 rounded-md font-medium ${
                loading || !query.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Processing...' : 'Submit Query'}
            </button>
            <button
              type="button"
              onClick={loadSuggestions}
              className="flex-1 py-3 px-4 rounded-md font-medium bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Get Suggestions
            </button>
          </div>
        </form>

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Suggested Queries
            </h3>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {/* Query Result */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Answer</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{result.answer}</p>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Sources
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {result.sources.map((source, index) => (
                  <li key={index}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Back Link */}
      <div className="mt-8">
        <a
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
