
import React from 'react';
import type { GroundingChunk } from '../types';
import { LinkIcon } from './icons';

interface SourcesListProps {
  sources: GroundingChunk[];
}

const SourcesList: React.FC<SourcesListProps> = ({ sources }) => {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8">
      <h3 className="font-serif text-2xl font-bold text-amber-400 mb-4">Sources</h3>
      <ul className="space-y-3">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 hover:underline transition-colors duration-200"
            >
              <LinkIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{source.web.title || source.web.uri}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourcesList;
