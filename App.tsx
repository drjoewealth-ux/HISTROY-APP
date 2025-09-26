import React, { useState, useCallback } from 'react';
import { generateStory, suggestTopic, generateImage } from './services/geminiService';
import type { GroundingChunk } from './types';
import TopicInput from './components/TopicInput';
import StoryDisplay from './components/StoryDisplay';
import SourcesList from './components/SourcesList';
import LoadingSpinner from './components/LoadingSpinner';
import { BookIcon, LightbulbIcon, DownloadIcon } from './components/icons';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestedTopic, setSuggestedTopic] = useState<string>('');


  const handleGenerateStory = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setStory('');
    setSources([]);
    setImageUrl('');
    setSuggestedTopic('');

    try {
      // Generate story and sources first
      const result = await generateStory(topic);
      setStory(result.story);
      setSources(result.sources);

      // Then, generate the image based on the same topic
      try {
        const imageBytes = await generateImage(topic);
        setImageUrl(`data:image/jpeg;base64,${imageBytes}`);
      } catch (imgErr) {
        // If image generation fails, we still have the story.
        // Log the error but don't show it to the user to avoid confusion.
        console.error("Image generation failed, but story was successful:", imgErr);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const handleSuggestTopic = useCallback(async () => {
    setIsSuggesting(true);
    setSuggestedTopic('');
    setError(null);
    try {
      const topicSuggestion = await suggestTopic();
      setSuggestedTopic(topicSuggestion);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while suggesting a topic.');
      }
    } finally {
      setIsSuggesting(false);
    }
  }, []);
  
  const handleDownloadImage = useCallback(() => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    // Sanitize topic for a safe filename
    const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `historical-storyteller-${sanitizedTopic || 'artwork'}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl, topic]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <BookIcon className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-100">
              The Historical Storyteller
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Type in a topic from the past. Our AI historian will find information and write a story for you.
          </p>
        </header>

        <main>
          <TopicInput
            topic={topic}
            setTopic={setTopic}
            onSubmit={handleGenerateStory}
            isLoading={isLoading || isSuggesting}
          />
          
          <div className="mt-3 text-center text-sm">
            <button
              onClick={handleSuggestTopic}
              disabled={isLoading || isSuggesting}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1 text-amber-300 hover:bg-amber-500/10 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              <LightbulbIcon className="w-4 h-4" />
              {isSuggesting ? 'Thinking...' : 'Suggest an idea'}
            </button>
            {suggestedTopic && !isSuggesting && (
              <div className="mt-2 text-slate-400 animate-fade-in">
                <span>How about: </span>
                <button
                  onClick={() => {
                    setTopic(suggestedTopic);
                    setSuggestedTopic(''); // Clear after use
                  }}
                  className="font-semibold text-sky-400 hover:underline focus:outline-none"
                >
                  "{suggestedTopic}"
                </button>
              </div>
            )}
          </div>


          <div className="mt-8 min-h-[300px]">
            {isLoading && <LoadingSpinner />}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                <p className="font-semibold">Something went wrong</p>
                <p>{error}</p>
              </div>
            )}
            {!isLoading && story && (
              <div className="space-y-6 animate-fade-in">
                 {imageUrl && (
                  <div className="relative group bg-slate-800/50 border border-slate-700 rounded-lg p-2 sm:p-4">
                    <img
                      src={imageUrl}
                      alt={`An AI-generated artistic depiction of: ${topic}`}
                      className="rounded-md w-full h-auto object-cover"
                    />
                    <button
                        onClick={handleDownloadImage}
                        aria-label="Download image"
                        className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/50 text-slate-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 hover:bg-slate-900/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                  </div>
                )}
                <StoryDisplay story={story} />
                <SourcesList sources={sources} />
              </div>
            )}
             {!isLoading && !story && !error && (
                <div className="text-center text-slate-500 py-16 px-4 border-2 border-dashed border-slate-700 rounded-lg">
                    <p className="text-lg">Your story about the past will show up here.</p>
                    <p className="text-sm">For example, try "the first computer" or "dinosaurs".</p>
                </div>
             )}
          </div>
        </main>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Made with Google Gemini. The stories are made by AI, so it's a good idea to check the facts.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;