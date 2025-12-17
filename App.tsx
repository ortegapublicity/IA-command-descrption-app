import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultCard } from './components/ResultCard';
import { analyzeOriginalImage, generateEditionInstructions } from './services/geminiService';
import { UploadedFile, AnalysisStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<UploadedFile | null>(null);
  const [editionFiles, setEditionFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  
  const [originalDescription, setOriginalDescription] = useState<string>('');
  const [editionInstructions, setEditionInstructions] = useState<Record<string, string>>({});

  const handleOriginalUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setOriginalFile({ id: 'original', file, previewUrl });
    // Reset results if original changes
    setOriginalDescription('');
    setEditionInstructions({});
    setStatus(AnalysisStatus.IDLE);
  };

  const handleEditionUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const newFile: UploadedFile = { id: uuidv4(), file, previewUrl };
    setEditionFiles((prev) => [...prev, newFile]);
  };

  const removeEdition = (id: string) => {
    setEditionFiles((prev) => prev.filter(f => f.id !== id));
    // Also remove instructions if they exist
    const newInstructions = { ...editionInstructions };
    delete newInstructions[id];
    setEditionInstructions(newInstructions);
  };

  const handleAnalyze = async () => {
    if (!originalFile) return;
    
    setStatus(AnalysisStatus.ANALYZING);
    setOriginalDescription('');
    setEditionInstructions({});

    try {
      // Step 1: Analyze Original
      const desc = await analyzeOriginalImage(originalFile.file);
      setOriginalDescription(desc);

      // Step 2: Analyze Editions in Parallel
      const promises = editionFiles.map(async (edition, index) => {
        const instructions = await generateEditionInstructions(originalFile.file, edition.file, index + 1);
        return { id: edition.id, instructions };
      });

      const results = await Promise.all(promises);
      
      const instructionsMap: Record<string, string> = {};
      results.forEach(res => {
        instructionsMap[res.id] = res.instructions;
      });
      
      setEditionInstructions(instructionsMap);
      setStatus(AnalysisStatus.COMPLETE);

    } catch (error) {
      console.error("Analysis failed:", error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const resetAll = () => {
    setOriginalFile(null);
    setEditionFiles([]);
    setOriginalDescription('');
    setEditionInstructions({});
    setStatus(AnalysisStatus.IDLE);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               </svg>
             </div>
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">InstructionGen <span className="text-indigo-600 font-light">AI</span></h1>
          </div>
          <div>
            <button 
              onClick={resetAll}
              className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate AI Editing Instructions</h2>
          <p className="text-gray-600">
            Upload an original photo and its edited versions. We'll generate the detailed description for the original and precise imperative commands for the edits.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Original Upload Column */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
              Original Photo
            </h3>
            <FileUpload 
              label="Upload Original" 
              onFileSelect={handleOriginalUpload} 
              imagePreview={originalFile?.previewUrl}
              onRemove={originalFile ? () => setOriginalFile(null) : undefined}
              className="shadow-sm"
            />
          </div>

          {/* Editions Upload Column */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
              Edited Versions
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {editionFiles.map((file, idx) => (
                <FileUpload
                  key={file.id}
                  label={`Edition ${idx + 1}`}
                  onFileSelect={() => {}} // Already selected
                  imagePreview={file.previewUrl}
                  onRemove={() => removeEdition(file.id)}
                />
              ))}
              
              {/* Add New Button */}
              {originalFile && (
                <FileUpload 
                  label="Add Edition" 
                  onFileSelect={handleEditionUpload}
                  className="border-dashed"
                />
              )}
            </div>
            {!originalFile && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-yellow-700 text-sm">
                Please upload the original photo first to enable edition uploads.
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-center mb-16 sticky top-20 z-20 pointer-events-none">
          <div className="pointer-events-auto shadow-2xl rounded-full">
            <button
              onClick={handleAnalyze}
              disabled={!originalFile || editionFiles.length === 0 || status === AnalysisStatus.ANALYZING}
              className={`
                px-8 py-3 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105
                flex items-center gap-3
                ${!originalFile || editionFiles.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 ring-4 ring-indigo-50'}
              `}
            >
              {status === AnalysisStatus.ANALYZING ? (
                <>
                  <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Images...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Generate Instructions
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {status === AnalysisStatus.COMPLETE && originalFile && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">Generated Instructions</h3>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Original Result */}
              <ResultCard 
                title="✅ Original Photo – Description"
                imageSrc={originalFile.previewUrl}
                content={originalDescription}
                isOriginal={true}
              />

              {/* Editions Results */}
              {editionFiles.map((edition, idx) => (
                <ResultCard
                  key={edition.id}
                  title={`✅ Edition ${idx + 1}`}
                  imageSrc={edition.previewUrl}
                  content={editionInstructions[edition.id] || "Pending..."}
                />
              ))}
            </div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
            <p className="font-bold">An error occurred during analysis.</p>
            <p>Please check your API key and try again.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;