import React, { useState, useRef, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Button from './components/Button';
import { SparklesIcon, SendIcon } from './components/Icons';
import { ImageFile, AnalysisState } from './types';
import { analyzeImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'idle' });
  const resultEndRef = useRef<HTMLDivElement>(null);

  const handleAnalysis = async () => {
    if (!image) return;

    setAnalysis({ status: 'analyzing' });

    try {
      const resultText = await analyzeImageWithGemini(image.file, prompt);
      setAnalysis({ status: 'success', data: resultText });
    } catch (error) {
      setAnalysis({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  };

  // Auto-scroll to result when it appears
  useEffect(() => {
    if (analysis.status === 'success' && resultEndRef.current) {
      resultEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [analysis.status]);

  const resetAnalysis = () => {
      setAnalysis({ status: 'idle' });
  };

  const handleImageSelect = (img: ImageFile | null) => {
      setImage(img);
      if (!img) {
          resetAnalysis();
      } else if (analysis.status !== 'idle') {
          // Keep previous analysis visible until new one starts or user manually clears?
          // Better UX: Reset status if image changes to avoid confusion.
          resetAnalysis();
      }
  };

  // Simple helper to format bold text from Markdown (e.g., **text**)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-3 last:mb-0">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
          part.startsWith('**') && part.endsWith('**') 
            ? <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong> 
            : part
        )}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Project
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Input */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-800">
                Image Input
              </h2>
              <p className="text-slate-500">
                Upload an image to detect objects, read text, or get a detailed description.
              </p>
              
              <div className="bg-white p-1 rounded-3xl shadow-xl shadow-slate-200/60 border border-white">
                <FileUpload 
                    selectedImage={image} 
                    onImageSelect={handleImageSelect}
                    disabled={analysis.status === 'analyzing'}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Custom Prompt (Optional)
              </label>
              <div className="relative">
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Identify all the plants in this image' or 'Extract the text from this sign'"
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-700 placeholder:text-slate-400"
                    rows={3}
                    disabled={analysis.status === 'analyzing'}
                />
              </div>
            </div>

            <Button 
                onClick={handleAnalysis}
                isLoading={analysis.status === 'analyzing'}
                disabled={!image}
                className="w-full"
                icon={<SendIcon className="w-5 h-5" />}
            >
                {analysis.status === 'analyzing' ? 'Analyzing Image...' : 'Analyze Image'}
            </Button>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-6">
             <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                Analysis Result
                {analysis.status === 'success' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                        Completed
                    </span>
                )}
             </h2>

             <div className={`
                min-h-[400px] rounded-3xl p-8 
                transition-all duration-500 ease-in-out
                ${analysis.status === 'idle' ? 'bg-slate-100/50 border-2 border-dashed border-slate-200 flex items-center justify-center' : 'bg-white shadow-xl shadow-slate-200/60 border border-slate-100'}
             `}>
                
                {analysis.status === 'idle' && (
                    <div className="text-center max-w-xs mx-auto opacity-50">
                        <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-500 font-medium">
                            Ready to analyze. Upload an image and click analyze to see the magic.
                        </p>
                    </div>
                )}

                {analysis.status === 'analyzing' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium text-slate-800">Processing Image</h3>
                            <p className="text-slate-500 text-sm animate-pulse">Consulting Gemini AI...</p>
                        </div>
                    </div>
                )}

                {analysis.status === 'error' && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-semibold text-red-600 mb-2">Analysis Failed</h3>
                        <p className="text-slate-600 max-w-sm">
                            {analysis.message}
                        </p>
                    </div>
                )}

                {analysis.status === 'success' && analysis.data && (
                    <div className="prose prose-slate max-w-none">
                        <div className="leading-relaxed text-slate-700 text-lg">
                            {renderFormattedText(analysis.data)}
                        </div>
                        <div ref={resultEndRef} />
                    </div>
                )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;