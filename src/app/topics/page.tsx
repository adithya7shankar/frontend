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
    return <div className="text-center py-12 text-warm-text-secondary">Loading topics...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-warm-text-primary mb-10 text-center">Explore Perspectives by Topic</h1>
      {topics.length === 0 ? (
        <p className="text-warm-text-secondary text-center text-lg">No topics available at the moment. Be the first to suggest one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Increased gap */}
          {topics.map((topic) => (
            <Link key={topic.id} href={`/topics/${topic.slug}`}
              className="block bg-warm-surface p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-warm-border-soft focus:outline-none focus:ring-2 focus:ring-calm-blue-accent focus:ring-opacity-50"> {/* Styled like home page cards, added focus styles */}
              <h2 className="text-2xl font-semibold text-calm-blue-accent mb-3">{topic.name}</h2>
              <p className="text-warm-text-secondary text-md font-serif"> {/* Serif for description */}
                Discuss news and share reflections on {topic.name.toLowerCase()}.
              </p>
            </Link>
          ))}
        </div>
      )}
      {/* TODO: Add a way for users to suggest or create new topics if permitted, perhaps a subtle CTA at the bottom */}
    </div>
  );
};

export default TopicsPage;
