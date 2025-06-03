'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button'; // Import the Button component

interface EmbedData {
  title?: string;
  description?: string;
  image?: string;
  publisher?: string;
  url?: string;
}

interface ReferenceArticle {
  url: string;
  embed_data: EmbedData | null;
}

interface Commentary {
  id: string;
  user_id: string;
  content: string;
  main_article_url: string;
  main_article_embed_data: string | null; // JSON string from DB
  created_at: string;
  parent_commentary_id: string | null;
  topic_id: string;
  reference_articles?: string; // JSON string of ReferenceArticle[] from DB
  tags?: string; // JSON string
}

interface CommentaryWithReplies extends Commentary {
  replies: CommentaryWithReplies[];
  parsed_main_article_embed_data?: EmbedData | null;
  parsed_reference_articles?: ReferenceArticle[];
}

interface TopicDetails {
  id: string;
  name: string;
  slug: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

const TopicPage = () => {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const [topicDetails, setTopicDetails] = useState<TopicDetails | null>(null);
  const [threadedCommentaries, setThreadedCommentaries] = useState<CommentaryWithReplies[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyReferenceUrls, setReplyReferenceUrls] = useState<string[]>(['']);
  const [replyReferenceEmbeds, setReplyReferenceEmbeds] = useState<ReferenceArticle[]>([]);
  const [isFetchingReplyEmbedFor, setIsFetchingReplyEmbedFor] = useState<number | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const parseCommentaryData = (commentary: Commentary): CommentaryWithReplies => {
    let parsedMainEmbed: EmbedData | null = null;
    if (commentary.main_article_embed_data) {
      try {
        parsedMainEmbed = JSON.parse(commentary.main_article_embed_data);
      } catch (e) {
        console.error(`Failed to parse main_article_embed_data for ${commentary.id}`, e);
      }
    }

    let parsedRefs: ReferenceArticle[] = [];
    if (commentary.reference_articles) {
      try {
        const refs = JSON.parse(commentary.reference_articles);
        if(Array.isArray(refs)) {
            parsedRefs = refs;
        }
      } catch (e) {
        console.error(`Failed to parse reference_articles for ${commentary.id}`, e);
      }
    }
    return { 
        ...commentary, 
        replies: [], 
        parsed_main_article_embed_data: parsedMainEmbed,
        parsed_reference_articles: parsedRefs
    };
  };

  const buildCommentaryThreads = (commentaries: Commentary[]): CommentaryWithReplies[] => {
    const commentaryMap: Record<string, CommentaryWithReplies> = {};
    const rootCommentaries: CommentaryWithReplies[] = [];

    commentaries.forEach(commentary => {
      commentaryMap[commentary.id] = parseCommentaryData(commentary);
    });

    commentaries.forEach(commentary => {
      if (commentary.parent_commentary_id && commentaryMap[commentary.parent_commentary_id]) {
        commentaryMap[commentary.parent_commentary_id].replies.push(commentaryMap[commentary.id]);
      } else if (!commentary.parent_commentary_id) {
        rootCommentaries.push(commentaryMap[commentary.id]);
      }
    });
    
    Object.values(commentaryMap).forEach(commentary => {
        commentary.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });
    rootCommentaries.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return rootCommentaries;
  };

  const fetchTopicData = useCallback(async () => {
    if (!slug) {
      setError("Topic slug not found in URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const topicsResponse = await fetch(`${API_BASE_URL}/api/topics`);
      if (!topicsResponse.ok) throw new Error('Failed to fetch topics to find details.');
      const allTopics: TopicDetails[] = await topicsResponse.json();
      const currentTopic = allTopics.find(t => t.slug === slug);

      if (!currentTopic) throw new Error(`Topic with slug "${slug}" not found.`);
      setTopicDetails(currentTopic);

      const commentariesResponse = await fetch(`${API_BASE_URL}/api/commentaries`);
      if (!commentariesResponse.ok) throw new Error('Failed to fetch commentaries.');
      const allCommentaries: Commentary[] = await commentariesResponse.json();
      
      const topicCommentaries = allCommentaries.filter(c => c.topic_id === currentTopic.id);
      setThreadedCommentaries(buildCommentaryThreads(topicCommentaries));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTopicData();
  }, [fetchTopicData]);


  const handleReplyReferenceUrlChange = (index: number, value: string) => {
    const newUrls = [...replyReferenceUrls];
    newUrls[index] = value;
    setReplyReferenceUrls(newUrls);
    const newEmbeds = [...replyReferenceEmbeds];
    if (newEmbeds[index]) newEmbeds[index].embed_data = null; 
    setReplyReferenceEmbeds(newEmbeds);
  };

  const addReplyReferenceField = () => {
    setReplyReferenceUrls([...replyReferenceUrls, '']);
  };

  const handleFetchReplyReferenceEmbed = async (index: number) => {
    const url = replyReferenceUrls[index];
    if (!url || !url.trim()) return;
    setIsFetchingReplyEmbedFor(index);
    try {
      const response = await fetch(`${API_BASE_URL}/api/embed?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.err || `Failed to fetch reference preview: ${response.statusText}`);
      }
      const embedData = await response.json();
      const newEmbeds = [...replyReferenceEmbeds];
      newEmbeds[index] = { url, embed_data: embedData };
      setReplyReferenceEmbeds(newEmbeds);
    } catch (err: any) {
      console.error("Error fetching reply reference embed:", err);
      const newEmbeds = [...replyReferenceEmbeds];
      newEmbeds[index] = { url, embed_data: null }; 
      setReplyReferenceEmbeds(newEmbeds);
    } finally {
      setIsFetchingReplyEmbedFor(null);
    }
  };
  
  const handleReplySubmit = async (parentCommentaryId: string) => {
    if (!replyContent.trim()) {
      alert("Reply content cannot be empty.");
      return;
    }
    setIsSubmittingReply(true);
    try {
      const validReferences = replyReferenceEmbeds.filter(ref => ref && ref.url && ref.embed_data);
      
      const newReplyData = {
        user_id: 'user1', 
        content: replyContent,
        parent_commentary_id: parentCommentaryId,
        reference_articles: validReferences.length > 0 ? JSON.stringify(validReferences) : null,
      };

      const response = await fetch(`${API_BASE_URL}/api/commentaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReplyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.err || 'Failed to submit reply.');
      }
      
      await fetchTopicData(); 
      setReplyingTo(null); 
      setReplyContent('');
      setReplyReferenceUrls(['']);
      setReplyReferenceEmbeds([]);
    } catch (err: any) {
      console.error("Error submitting reply:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (isLoading) return <div className="text-center py-12 text-warm-text-secondary">Loading topic reflections...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  if (!topicDetails) return <div className="text-center py-12 text-warm-text-secondary">Topic not found.</div>;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-warm-text-primary mb-4">
        Reflections on: <span className="text-calm-blue-accent">{topicDetails.name}</span>
      </h1>
      <p className="text-lg text-warm-text-secondary mb-10 font-serif">
        Explore perspectives and share your thoughts on articles related to {topicDetails.name.toLowerCase()}.
      </p>
      {threadedCommentaries.length === 0 ? (
        <div className="text-center bg-warm-surface p-10 rounded-xl shadow-lg border border-warm-border-soft">
          <h2 className="text-2xl font-semibold text-warm-text-primary mb-3">No reflections yet for this topic.</h2>
          <p className="text-warm-text-secondary mb-6 font-serif">
            Be the first to share your perspective on an article related to "{topicDetails.name}".
          </p>
          <Link href="/submit"
            className="bg-calm-blue-accent hover:bg-calm-blue-accent-hover text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-lg">
            Share Your Reflection
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {threadedCommentaries.map((commentary) => (
            <CommentaryCard 
              key={commentary.id} 
              commentary={commentary} 
              level={0}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              replyReferenceUrls={replyReferenceUrls}
              handleReplyReferenceUrlChange={handleReplyReferenceUrlChange}
              addReplyReferenceField={addReplyReferenceField}
              handleFetchReplyReferenceEmbed={handleFetchReplyReferenceEmbed}
              replyReferenceEmbeds={replyReferenceEmbeds}
              setReplyReferenceUrls={setReplyReferenceUrls} 
              setReplyReferenceEmbeds={setReplyReferenceEmbeds} 
              isFetchingReplyEmbedFor={isFetchingReplyEmbedFor}
              handleReplySubmit={handleReplySubmit}
              isSubmittingReply={isSubmittingReply}
              fetchTopicData={fetchTopicData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommentaryCardProps {
  commentary: CommentaryWithReplies;
  level: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  replyReferenceUrls: string[];
  handleReplyReferenceUrlChange: (index: number, value: string) => void;
  addReplyReferenceField: () => void;
  handleFetchReplyReferenceEmbed: (index: number) => Promise<void>;
  replyReferenceEmbeds: ReferenceArticle[];
  setReplyReferenceUrls: React.Dispatch<React.SetStateAction<string[]>>; 
  setReplyReferenceEmbeds: React.Dispatch<React.SetStateAction<ReferenceArticle[]>>; 
  isFetchingReplyEmbedFor: number | null;
  handleReplySubmit: (parentId: string) => Promise<void>;
  isSubmittingReply: boolean;
  fetchTopicData: () => Promise<void>;
}

const CommentaryCard: React.FC<CommentaryCardProps> = ({ 
  commentary, level, 
  replyingTo, setReplyingTo, 
  replyContent, setReplyContent,
  replyReferenceUrls, handleReplyReferenceUrlChange, addReplyReferenceField, handleFetchReplyReferenceEmbed, replyReferenceEmbeds, setReplyReferenceUrls, setReplyReferenceEmbeds, isFetchingReplyEmbedFor,
  handleReplySubmit, isSubmittingReply, fetchTopicData
}) => {
  const mainArticleEmbedData = commentary.parsed_main_article_embed_data;
  const referencesToDisplay = commentary.parsed_reference_articles || [];
  
  const isTopLevel = level === 0;
  const showReplyForm = replyingTo === commentary.id;

  const onOpenReplyForm = () => {
    setReplyingTo(commentary.id);
    setReplyContent('');
    setReplyReferenceUrls(['']); // Use the passed setter
    setReplyReferenceEmbeds([]); // Use the passed setter
  };

  const onCloseReplyForm = () => {
    setReplyingTo(null);
  };

  return (
    <div className={`bg-warm-surface p-6 rounded-xl shadow-lg border border-warm-border-soft ${isTopLevel ? 'md:p-8' : `ml-${4 + level * 2} md:ml-${8 + level * 2} border-l-4 border-calm-blue-accent/30 pl-4 md:pl-6`}`}>
      {isTopLevel && mainArticleEmbedData && (
        <div className="mb-6 p-4 border border-warm-border-medium rounded-lg bg-warm-bg">
          <h3 className="text-xl font-semibold text-warm-text-primary mb-1">
            <a href={commentary.main_article_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {mainArticleEmbedData.title || "Linked Article"}
            </a>
          </h3>
          {mainArticleEmbedData.image && (
             <img src={mainArticleEmbedData.image} alt={mainArticleEmbedData.title || 'Article image'} className="my-3 rounded-lg max-h-60 w-full object-cover border border-warm-border-soft" />
          )}
          <p className="text-sm text-warm-text-secondary font-serif line-clamp-3 mb-1">{mainArticleEmbedData.description || "No description available."}</p>
          {mainArticleEmbedData.publisher && <p className="text-xs text-warm-text-secondary">Source: {mainArticleEmbedData.publisher}</p>}
        </div>
      )}
      <p className="text-warm-text-primary font-serif text-lg leading-relaxed mb-4">
        {commentary.content}
      </p>
      
      {referencesToDisplay.length > 0 && (
        <div className="my-4 pt-3 border-t border-warm-border-soft/50 space-y-3">
          <h5 className="text-md font-semibold text-warm-text-secondary">
            {isTopLevel ? "Supporting References:" : "References in this reply:"}
          </h5>
          {referencesToDisplay.map((ref, index) => (
            <div key={index} className="p-3 border border-warm-border-soft rounded-md bg-warm-bg/50 text-sm">
              <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-calm-blue-accent hover:underline font-semibold block truncate">
                {ref.embed_data?.title || ref.url}
              </a>
              {ref.embed_data?.description && <p className="text-xs text-warm-text-secondary mt-1 line-clamp-2">{ref.embed_data.description}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-warm-text-secondary mt-4">
        <span>
          User {commentary.user_id.substring(0,8)}... on {new Date(commentary.created_at).toLocaleDateString()}
        </span>
        <button 
          onClick={showReplyForm ? onCloseReplyForm : onOpenReplyForm}
          className="text-calm-blue-accent hover:text-calm-blue-accent-hover font-semibold px-3 py-1 rounded hover:bg-calm-blue-accent/10 transition-colors"
        >
          {showReplyForm ? 'Cancel Reply' : 'Contribute to this discussion'}
        </button>
      </div>

      {showReplyForm && (
        <div className="mt-6 pt-6 border-t border-warm-border-soft space-y-6">
          <h4 className="text-xl font-semibold text-warm-text-primary">Your Perspective:</h4>
          <div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={5}
              className="w-full p-3 bg-warm-bg border border-warm-border-medium rounded-lg shadow-sm focus:ring-2 focus:ring-calm-blue-accent focus:border-calm-blue-accent text-warm-text-primary font-serif text-md leading-relaxed"
              placeholder="What perspective or supporting insight would you add?"
            />
          </div>
          
          <div>
            <label className="block text-md font-semibold text-warm-text-primary mb-2">Cite supporting references (optional):</label>
            {replyReferenceUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleReplyReferenceUrlChange(index, e.target.value)}
                  onBlur={() => handleFetchReplyReferenceEmbed(index)}
                  className="flex-grow p-2 bg-warm-bg border border-warm-border-medium rounded-md shadow-sm focus:ring-1 focus:ring-calm-blue-accent text-sm"
                  placeholder="https://www.example.com/reference-article"
                />
                {isFetchingReplyEmbedFor === index && <p className="text-xs text-warm-text-secondary">Fetching...</p>}
                {replyReferenceEmbeds[index]?.embed_data && (
                    <span className="text-xs text-green-600 truncate max-w-xs" title={replyReferenceEmbeds[index].embed_data?.title || url}>
                        ✓ Preview loaded
                    </span>
                )}
                 {replyReferenceEmbeds[index] && !replyReferenceEmbeds[index].embed_data && ! (isFetchingReplyEmbedFor === index) && (
                    <span className="text-xs text-red-500">Preview failed</span>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={addReplyReferenceField}
              className="mt-1" 
            >
              + Add another reference
            </Button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleReplySubmit(commentary.id)}
            disabled={isSubmittingReply || !replyContent.trim()}
            className="mt-2"
          >
            {isSubmittingReply ? 'Submitting...' : 'Add Perspective'}
          </Button>
        </div>
      )}
      
      {commentary.replies && commentary.replies.length > 0 && (
        <div className={`mt-6 space-y-6 ${isTopLevel ? 'pt-6 border-t border-warm-border-soft' : 'pt-4 border-t border-warm-border-soft/50'}`}>
          {isTopLevel && <h4 className="text-lg font-semibold text-warm-text-primary">{commentary.replies.length} {commentary.replies.length === 1 ? 'Response' : 'Responses'} to this reflection:</h4>}
          {commentary.replies.map(reply => (
            <CommentaryCard 
              key={reply.id} 
              commentary={reply} 
              level={level + 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent} 
              setReplyContent={setReplyContent}
              replyReferenceUrls={replyReferenceUrls}
              handleReplyReferenceUrlChange={handleReplyReferenceUrlChange}
              addReplyReferenceField={addReplyReferenceField}
              handleFetchReplyReferenceEmbed={handleFetchReplyReferenceEmbed}
              replyReferenceEmbeds={replyReferenceEmbeds}
              setReplyReferenceUrls={setReplyReferenceUrls} 
              setReplyReferenceEmbeds={setReplyReferenceEmbeds} 
              isFetchingReplyEmbedFor={isFetchingReplyEmbedFor}
              handleReplySubmit={handleReplySubmit}
              isSubmittingReply={isSubmittingReply}
              fetchTopicData={fetchTopicData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicPage;
