import React, { useRef } from 'react';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  accept?: string;
  imagePreview?: string | null;
  onRemove?: () => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  onFileSelect, 
  accept = "image/*", 
  imagePreview, 
  onRemove,
  className = "" 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!imagePreview && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={accept}
        className="hidden"
      />
      
      {imagePreview ? (
        <div className="relative group w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          {onRemove && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all"
              >
                Remove
              </button>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {label}
          </div>
        </div>
      ) : (
        <div 
          onClick={handleClick}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-indigo-50 transition-all group"
        >
          <div className="p-4 bg-indigo-100 rounded-full mb-3 group-hover:bg-indigo-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-medium text-gray-600 group-hover:text-primary transition-colors">{label}</span>
          <span className="text-xs text-gray-400 mt-1">Click to upload</span>
        </div>
      )}
    </div>
  );
};