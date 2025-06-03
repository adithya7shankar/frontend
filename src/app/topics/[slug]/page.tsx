'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Correct hook for App Router

interface Commentary {
  id: string;
  user_id: string; // Will be replaced with user details
  content: string;
  main_article_url: string;
  main_article_embed_data: string; // JSON string
  created_at: string;
  // Add other fields like tags, references as needed
}

interface TopicDetails {
  id: string;
  name: string;
  slug: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

const TopicPage = () => {
  const params = useParams();
  const slug = params?.slug as string | undefined; // Type assertion

  const [topicDetails, setTopicDetails] = useState<TopicDetails | null>(null);
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      // This case should ideally be handled by Next.js routing if slug is missing
      // or redirect to a 404 page. For now, set an error.
      setError("Topic slug not found in URL.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch topic details (assuming an endpoint like /api/topics/slug/:slug exists or can be made)
        // For now, we'll just use the slug and try to find the topic from the general list
        // This is not efficient and should be replaced with a direct topic fetch by slug.
        const topicsResponse = await fetch(`${API_BASE_URL}/api/topics`);
        if (!topicsResponse.ok) throw new Error('Failed to fetch topics to find details.');
        const allTopics: TopicDetails[] = await topicsResponse.json();
        const currentTopic = allTopics.find(t => t.slug === slug);

        if (!currentTopic) {
          throw new Error(`Topic with slug "${slug}" not found.`);
        }
        setTopicDetails(currentTopic);

        // Fetch commentaries for this topic
        // Assuming commentaries can be filtered by topic_id.
        // The current /api/commentaries endpoint doesn't support this filtering yet.
        // This will need an API update: GET /api/commentaries?topic_id=:topic_id
        // For now, we'll fetch all and filter client-side (highly inefficient, for placeholder only)
        const commentariesResponse = await fetch(`${API_BASE_URL}/api/commentaries`);
        if (!commentariesResponse.ok) throw new Error('Failed to fetch commentaries.');
        const allCommentaries: any[] = await commentariesResponse.json(); // Use 'any' temporarily
        
        // Filter commentaries that belong to the currentTopic.id
        // This assumes Commentary objects have a topic_id field.
        const topicCommentaries = allCommentaries.filter(c => c.topic_id === currentTopic.id);
        setCommentaries(topicCommentaries);

      } catch (err: any) {
        setError(err.message);
        console.error(`Error fetching data for topic ${slug}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (isLoading) {
    return <div className="text-center py-12 text-warm-text-secondary">Loading topic reflections...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }
  
  if (!topicDetails) {
    return <div className="text-center py-12 text-warm-text-secondary">Topic not found.</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-warm-text-primary mb-4">
        Reflections on: <span className="text-calm-blue-accent">{topicDetails.name}</span>
      </h1>
      <p className="text-lg text-warm-text-secondary mb-10 font-serif">
        Explore perspectives and share your thoughts on articles related to {topicDetails.name.toLowerCase()}.
      </p>

      {commentaries.length === 0 ? (
        <div className="text-center bg-warm-surface p-10 rounded-xl shadow-lg border border-warm-border-soft">
          <h2 className="text-2xl font-semibold text-warm-text-primary mb-3">No reflections yet for this topic.</h2>
          <p className="text-warm-text-secondary mb-6 font-serif">
            Be the first to share your perspective on an article related to "{topicDetails.name}".
          </p>
          <a
            href="/submit" // Link to the submission page
            className="bg-calm-blue-accent hover:bg-calm-blue-accent-hover text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-lg"
          >
            Share Your Reflection
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {commentaries.map((commentary) => {
            let embedData = null;
            try {
              embedData = commentary.main_article_embed_data ? JSON.parse(commentary.main_article_embed_data) : null;
            } catch (e) {
              console.error("Failed to parse embed data for commentary:", commentary.id, e);
            }

            return (
              <div key={commentary.id} className="bg-warm-surface p-8 rounded-xl shadow-lg border border-warm-border-soft">
                {embedData && (
                  <div className="mb-6 p-4 border border-warm-border-medium rounded-lg bg-warm-bg">
                    <h3 className="text-xl font-semibold text-warm-text-primary mb-1">
                      <a href={commentary.main_article_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {embedData.title || "Linked Article"}
                      </a>
                    </h3>
                    {embedData.image && (
                       <img src={embedData.image} alt={embedData.title || 'Article image'} className="my-3 rounded-lg max-h-60 w-full object-cover border border-warm-border-soft" />
                    )}
                    <p className="text-sm text-warm-text-secondary font-serif line-clamp-3 mb-1">{embedData.description || "No description available."}</p>
                    {embedData.publisher && <p className="text-xs text-warm-text-secondary">Source: {embedData.publisher}</p>}
                  </div>
                )}
                <p className="text-warm-text-primary font-serif text-lg leading-relaxed mb-4">
                  {commentary.content}
                </p>
                <p className="text-sm text-warm-text-secondary">
                  Reflected by User {commentary.user_id.substring(0,8)}... on {new Date(commentary.created_at).toLocaleDateString()}
                </p>
                {/* TODO: Add interaction buttons here */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicPage;
