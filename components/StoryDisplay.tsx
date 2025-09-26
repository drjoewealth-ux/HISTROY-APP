import React, { useState } from 'react';
import { CopyIcon } from './icons';

interface StoryDisplayProps {
  story: string;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Split the story by newline characters to create paragraphs.
  // Filter out any empty strings that might result from multiple newlines.
  const paragraphs = story.split('\n').filter(p => p.trim() !== '');

  const handleCopy = () => {
    if (!story) return;
    navigator.clipboard.writeText(story).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error("Failed to copy story: ", err);
      // Optionally handle the error, e.g., show an error message
    });
  };


  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8">
       <div className="flex justify-between items-start mb-4">
        <h2 className="font-serif text-3xl font-bold text-amber-400">The Story</h2>
        <div className="relative flex items-center gap-3">
          <span className={`text-emerald-400 text-sm font-medium transition-opacity duration-300 ${isCopied ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            Copied!
          </span>
          <button
            onClick={handleCopy}
            disabled={isCopied}
            aria-label="Copy story to clipboard"
            className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
          >
            <CopyIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <article className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </article>
    </div>
  );
};

export default StoryDisplay;