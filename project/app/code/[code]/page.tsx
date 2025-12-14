'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LinkData {
  code: string;
  url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : '');

  useEffect(() => {
    fetchLink();
  }, [code]);

  const fetchLink = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links/${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Link not found');
        } else {
          throw new Error('Failed to fetch link');
        }
        return;
      }
      const data = await response.json();
      setLink(data);
    } catch (err) {
      setError('Failed to load link details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Link not found'}
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-900">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-900 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Link Statistics</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Short Code
            </label>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono text-blue-600">{link.code}</code>
              <button
                onClick={() => copyToClipboard(`${baseUrl}/${link.code}`)}
                className="text-gray-400 hover:text-gray-600"
                title="Copy short link"
              >
                📋
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Target URL
            </label>
            <div className="flex items-center gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-900 break-all"
              >
                {link.url}
              </a>
              <button
                onClick={() => copyToClipboard(link.url)}
                className="text-gray-400 hover:text-gray-600"
                title="Copy URL"
              >
                📋
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Total Clicks
              </label>
              <div className="text-2xl font-bold text-gray-900">{link.clicks}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Last Clicked
              </label>
              <div className="text-sm text-gray-900">{formatDate(link.last_clicked)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Created At
              </label>
              <div className="text-sm text-gray-900">{formatDate(link.created_at)}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <a
              href={`${baseUrl}/${link.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Test Redirect →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



