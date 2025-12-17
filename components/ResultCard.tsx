import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ResultCardProps {
  title: string;
  imageSrc: string;
  content: string;
  isOriginal?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, imageSrc, content, isOriginal = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row h-full">
      <div className="md:w-1/3 h-64 md:h-auto relative bg-gray-100">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>
      <div className="md:w-2/3 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          {isOriginal ? (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Original</span>
          ) : (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Edition</span>
          )}
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        
        <div className="prose prose-sm prose-indigo text-gray-600 flex-grow overflow-y-auto max-h-[300px]">
           {isOriginal ? (
             <p className="italic">{content}</p>
           ) : (
             <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">AI Editing Instructions</h4>
                <ReactMarkdown>{content}</ReactMarkdown>
             </div>
           )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
           <button 
             onClick={() => navigator.clipboard.writeText(content)}
             className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
             </svg>
             Copy Text
           </button>
        </div>
      </div>
    </div>
  );
};