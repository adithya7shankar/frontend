'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Topic {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Define the API base URL. This should ideally come from an environment variable.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';


const TopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/topics`);
        if (!response.ok) {
          throw new Error(`Failed to fetch topics: ${response.statusText}`);
        }
        const data = await response.json();
        setTopics(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching topics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10">Loading topics...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Explore Topics</h1>
      {topics.length === 0 ? (
        <p className="text-gray-600">No topics available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/topics/${topic.slug}`} legacyBehavior>
              <a className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                <h2 className="text-2xl font-semibold text-blue-600 mb-2">{topic.name}</h2>
                <p className="text-gray-500 text-sm">
                  Discuss news and share reflections on {topic.name.toLowerCase()}.
                </p>
              </a>
            </Link>
          ))}
        </div>
      )}
      {/* TODO: Add a way for users to suggest or create new topics if permitted */}
    </div>
  );
};

export default TopicsPage;
