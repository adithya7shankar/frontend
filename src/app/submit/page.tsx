'use client';

import React, { useState, useEffect } from 'react';

interface Topic {
  id: string;
  name: string;
  slug: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

const SubmitCommentaryPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [mainArticleUrl, setMainArticleUrl] = useState<string>('');
  const [mainArticleEmbed, setMainArticleEmbed] = useState<any>(null); // For storing fetched embed data
  const [isFetchingEmbed, setIsFetchingEmbed] = useState<boolean>(false);
  const [commentaryText, setCommentaryText] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  // TODO: Add state for reference URLs and embed data

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch topics for the dropdown
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/topics`);
        if (!response.ok) throw new Error('Failed to fetch topics');
        const data = await response.json();
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopic(data[0].id); // Default to the first topic
        }
      } catch (err: any) {
        console.error("Error fetching topics for form:", err);
        setError('Could not load topics. Please try again later.');
      }
    };
    fetchTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!selectedTopic || !mainArticleUrl || !commentaryText) {
      setError('Please fill in all required fields: Topic, Main Article URL, and your Thoughts.');
      setIsSubmitting(false);
      return;
    }

    // Placeholder for user_id, this will come from auth
    const placeholderUserId = 'user1'; // Changed to a valid seeded user ID

    if (!mainArticleEmbed && mainArticleUrl) { // Check if URL is entered but embed not loaded
      setError('Please wait for the article preview to load, or ensure the URL is correct.');
      setIsSubmitting(false);
      return;
    }
    
    const embedDataToSave = mainArticleEmbed || { // Fallback if embed somehow fails post-check
        title: `Article: ${mainArticleUrl}`,
        description: 'No preview available.',
        image: null,
        source: mainArticleUrl ? new URL(mainArticleUrl).hostname : 'Unknown source'
    };

    const commentaryData = {
      user_id: placeholderUserId,
      topic_id: selectedTopic,
      main_article_url: mainArticleUrl,
      main_article_embed_data: JSON.stringify(embedDataToSave),
      reference_articles: JSON.stringify([]), // Placeholder for references
      content: commentaryText,
      tags: JSON.stringify(tags.split(',').map(tag => tag.trim()).filter(tag => tag)),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/commentaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentaryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.err || `Failed to submit commentary: ${response.statusText}`);
      }

      setSuccessMessage('Commentary submitted successfully!');
      // Reset form
      setMainArticleUrl('');
      setCommentaryText('');
      setTags('');
      // Optionally redirect or update UI
    } catch (err: any) {
      setError(err.message);
      console.error("Error submitting commentary:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchEmbed = async () => {
    console.log('handleFetchEmbed called. URL:', mainArticleUrl); // Debug log
    if (!mainArticleUrl) {
      console.log('mainArticleUrl is empty, returning.');
      return;
    }
    setIsFetchingEmbed(true);
    setError(null);
    setMainArticleEmbed(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/embed?url=${encodeURIComponent(mainArticleUrl)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.err || `Failed to fetch article preview: ${response.statusText}`);
      }
      const embedData = await response.json();
      setMainArticleEmbed(embedData);
    } catch (err: any) {
      setError(`Could not fetch article preview: ${err.message}`);
      console.error("Error fetching embed:", err);
    } finally {
      setIsFetchingEmbed(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-3xl"> {/* Centered and max-width for a more focused writing experience */}
      <h1 className="text-4xl font-bold text-warm-text-primary mb-10 text-center">Share Your Reflection</h1>
      <form onSubmit={handleSubmit} className="bg-warm-surface p-10 rounded-xl shadow-xl border border-warm-border-soft space-y-8"> {/* Softer, more padding */}
        <div>
          <label htmlFor="topic" className="block text-lg font-semibold text-warm-text-primary mb-2">
            Choose a Topic <span className="text-red-500">*</span>
          </label>
          <select
            id="topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full p-4 bg-warm-bg border border-warm-border-medium rounded-lg shadow-sm focus:ring-2 focus:ring-calm-blue-accent focus:border-calm-blue-accent text-warm-text-primary text-md" // Enhanced styling
            required
          >
            <option value="" disabled>Select a topic to reflect on...</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mainArticleUrl" className="block text-lg font-semibold text-warm-text-primary mb-2">
            Link to the Main Article <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="mainArticleUrl"
            value={mainArticleUrl}
            onChange={(e) => {
              setMainArticleUrl(e.target.value);
              setMainArticleEmbed(null); // Clear previous embed on URL change
              setError(null); // Clear error on URL change
            }}
            onBlur={handleFetchEmbed} // Fetch embed on blur
            className="w-full p-4 bg-warm-bg border border-warm-border-medium rounded-lg shadow-sm focus:ring-2 focus:ring-calm-blue-accent focus:border-calm-blue-accent text-warm-text-primary text-md" // Enhanced styling
            placeholder="https://www.example.com/news-article"
            required
          />
          {isFetchingEmbed && <p className="text-sm text-warm-text-secondary mt-2">Fetching article preview...</p>}
          {!isFetchingEmbed && mainArticleEmbed && (
            <div className="mt-6 p-6 border border-warm-border-soft rounded-lg bg-warm-bg"> {/* Embed card styling */}
              <h3 className="text-xl font-semibold text-warm-text-primary">{mainArticleEmbed.title || 'No title available'}</h3>
              {mainArticleEmbed.image && (
                <img src={mainArticleEmbed.image} alt={mainArticleEmbed.title || 'Article image'} className="my-3 rounded-lg max-h-72 w-full object-cover border border-warm-border-soft" />
              )}
              <p className="text-md text-warm-text-secondary font-serif line-clamp-4">{mainArticleEmbed.description || 'No description available'}</p>
              {mainArticleEmbed.publisher && <p className="text-sm text-warm-text-secondary mt-2">Source: {mainArticleEmbed.publisher}</p>}
              {mainArticleEmbed.url && <a href={mainArticleEmbed.url} target="_blank" rel="noopener noreferrer" className="text-sm text-calm-blue-accent hover:underline mt-1 block truncate">Read at source: {mainArticleEmbed.url}</a>}
            </div>
          )}
           {!isFetchingEmbed && !mainArticleEmbed && mainArticleUrl && !error && ( // Message if URL entered but no preview and no error yet
            <p className="text-sm text-yellow-600 mt-2">Could not load preview. Please check the URL or try again.</p>
          )}
        </div>
        
        {/* TODO: Add section for Reference URLs with similar embed fetching and styling */}

        <div>
          <label htmlFor="commentaryText" className="block text-lg font-semibold text-warm-text-primary mb-2">
            Your Reflection <span className="text-red-500">*</span>
          </label>
          <textarea
            id="commentaryText"
            value={commentaryText}
            onChange={(e) => setCommentaryText(e.target.value)}
            rows={12} // Increased rows for more writing space
            className="w-full p-4 bg-warm-bg border border-warm-border-medium rounded-lg shadow-sm focus:ring-2 focus:ring-calm-blue-accent focus:border-calm-blue-accent text-warm-text-primary font-serif text-lg leading-relaxed" // Serif font, larger, more line height
            placeholder="Share your thoughtful insights on the article..."
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-lg font-semibold text-warm-text-primary mb-2">
            Add Tags <span className="text-sm text-warm-text-secondary">(optional, comma-separated)</span>
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-4 bg-warm-bg border border-warm-border-medium rounded-lg shadow-sm focus:ring-2 focus:ring-calm-blue-accent focus:border-calm-blue-accent text-warm-text-primary text-md" // Enhanced styling
            placeholder="e.g., ai, ethics, future of work"
          />
        </div>

        {error && <p className="text-red-600 text-md text-center bg-red-100 p-3 rounded-lg">{error}</p>}
        {successMessage && <p className="text-green-600 text-md text-center bg-green-100 p-3 rounded-lg">{successMessage}</p>}

        <div className="pt-4"> {/* Added padding top for button spacing */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-calm-blue-accent hover:bg-calm-blue-accent-hover text-white font-semibold py-4 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-lg disabled:opacity-60" // Larger button, new colors
          >
            {isSubmitting ? 'Submitting Reflection...' : 'Publish Your Reflection'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitCommentaryPage;
