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
    const placeholderUserId = 'user_placeholder_id';

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
    if (!mainArticleUrl) return;
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Share Your Commentary</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Select Topic <span className="text-red-500">*</span>
          </label>
          <select
            id="topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>Select a topic</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mainArticleUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Main Article URL <span className="text-red-500">*</span>
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
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://www.example.com/news-article"
            required
          />
          {isFetchingEmbed && <p className="text-sm text-gray-500 mt-1">Fetching article preview...</p>}
          {!isFetchingEmbed && mainArticleEmbed && (
            <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-700">{mainArticleEmbed.title || 'No title available'}</h3>
              {mainArticleEmbed.image && (
                <img src={mainArticleEmbed.image} alt={mainArticleEmbed.title || 'Article image'} className="my-2 rounded-md max-h-60 w-full object-contain" />
              )}
              <p className="text-sm text-gray-600 line-clamp-3">{mainArticleEmbed.description || 'No description available'}</p>
              {mainArticleEmbed.publisher && <p className="text-xs text-gray-500 mt-1">Source: {mainArticleEmbed.publisher}</p>}
              {mainArticleEmbed.url && <a href={mainArticleEmbed.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block truncate">Read at source: {mainArticleEmbed.url}</a>}
            </div>
          )}
           {!isFetchingEmbed && !mainArticleEmbed && mainArticleUrl && !error && (
            <p className="text-sm text-yellow-600 mt-1">Could not load preview. Please check the URL or try again.</p>
          )}
        </div>
        
        {/* TODO: Add section for Reference URLs with similar embed fetching */}

        <div>
          <label htmlFor="commentaryText" className="block text-sm font-medium text-gray-700 mb-1">
            Your Thoughts / Commentary <span className="text-red-500">*</span>
          </label>
          <textarea
            id="commentaryText"
            value={commentaryText}
            onChange={(e) => setCommentaryText(e.target.value)}
            rows={8}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your reflective insights on the article..."
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., ai, ethics, future"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Commentary'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitCommentaryPage;
