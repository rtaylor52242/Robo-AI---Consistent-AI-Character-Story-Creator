import React, { useState } from 'react';
import { Character, GeneratedImage, AspectRatio, MAX_PROMPTS } from './types';
import { CharacterSlot } from './components/CharacterSlot';
import { Button } from './components/Button';
import { ImageLightbox } from './components/ImageLightbox';
import { HelpModal } from './components/HelpModal';
import { generateImageWithGemini } from './services/geminiService';

// Utils for date formatting
const getFormattedDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

const App: React.FC = () => {
  // --- State ---
  const [characters, setCharacters] = useState<Character[]>([
    { id: '1', name: 'Character 1', file: null, previewUrl: null, isSelected: true },
    { id: '2', name: 'Character 2', file: null, previewUrl: null, isSelected: false },
    { id: '3', name: 'Character 3', file: null, previewUrl: null, isSelected: false },
    { id: '4', name: 'Character 4', file: null, previewUrl: null, isSelected: false },
  ]);
  
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.RATIO_16_9);
  const [customAspectRatio, setCustomAspectRatio] = useState<string>("");
  const [prompts, setPrompts] = useState<string[]>([""]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // --- Handlers ---

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addPrompt = () => {
    if (prompts.length < MAX_PROMPTS) {
      setPrompts([...prompts, ""]);
    }
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const removePrompt = (index: number) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((_, i) => i !== index));
    }
  };

  const handleGenerateAll = async () => {
    const validPrompts = prompts.filter(p => p.trim() !== "");
    if (validPrompts.length === 0) {
      alert("Please enter at least one prompt.");
      return;
    }

    const selectedChars = characters.filter(c => c.isSelected && c.file);
    if (selectedChars.length === 0) {
      const confirmNoRef = window.confirm("No character reference images selected. Generate generic images?");
      if (!confirmNoRef) return;
    }

    setIsGenerating(true);

    // Initialize placeholder results
    const newPlaceholders: GeneratedImage[] = validPrompts.map((p, i) => ({
      id: `gen-${Date.now()}-${i}`,
      prompt: p,
      imageUrl: null,
      isLoading: true,
      error: null,
      timestamp: new Date(),
      index: i + 1
    }));

    setGeneratedImages(newPlaceholders);

    const promises = newPlaceholders.map(async (item) => {
      try {
        // Use the default environment key
        const currentKey = process.env.API_KEY || '';
        
        const base64Image = await generateImageWithGemini({
          prompt: item.prompt,
          selectedCharacters: selectedChars,
          aspectRatio: aspectRatio,
          customAspectRatio: customAspectRatio,
          apiKey: currentKey
        });

        setGeneratedImages(prev => prev.map(img => 
          img.id === item.id ? { ...img, imageUrl: base64Image, isLoading: false } : img
        ));
      } catch (err: any) {
        console.error("Generation error for prompt:", item.prompt, err);
        setGeneratedImages(prev => prev.map(img => 
          img.id === item.id ? { ...img, isLoading: false, error: err.message || "Failed" } : img
        ));
      }
    });

    await Promise.all(promises);
    setIsGenerating(false);
  };

  const handleDownloadOne = (image: GeneratedImage) => {
    if (!image.imageUrl) return;
    const link = document.createElement('a');
    link.href = image.imageUrl;
    const dateStr = getFormattedDate();
    const numStr = String(image.index).padStart(3, '0');
    link.download = `${numStr}_${dateStr}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    generatedImages.forEach(img => {
      if (img.imageUrl) {
        handleDownloadOne(img);
      }
    });
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-robo-dark text-robo-text flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* Modals */}
      {viewingImage && (
        <ImageLightbox 
          imageUrl={viewingImage} 
          onClose={() => setViewingImage(null)} 
        />
      )}
      
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}

      {/* --- Left Column: Control Panel --- */}
      <div className="w-full lg:w-[400px] shrink-0 bg-robo-dark border-r border-robo-border flex flex-col h-screen overflow-y-auto custom-scrollbar z-20 shadow-xl">
        <div className="p-6 space-y-8">
          
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-robo-accent">⚡</span> Robo AI
              </h1>
              <p className="text-sm text-robo-muted mt-1">Consistent AI Character Story Creator</p>
            </div>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-robo-muted hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="How to use"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
          </header>

          {/* 1. Character References */}
          <section>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">1. Characters</h2>
            <div className="space-y-3">
              {characters.map(char => (
                <CharacterSlot key={char.id} character={char} onUpdate={updateCharacter} />
              ))}
            </div>
          </section>

          {/* 2. Aspect Ratio */}
          <section>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">2. Aspect Ratio</h2>
            <div className="space-y-3">
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full bg-robo-panel border border-robo-border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-robo-accent focus:outline-none"
              >
                <option value={AspectRatio.RATIO_16_9}>16:9 (Landscape)</option>
                <option value={AspectRatio.RATIO_9_16}>9:16 (Portrait)</option>
                <option value={AspectRatio.RATIO_1_1}>1:1 (Square)</option>
                <option value={AspectRatio.RATIO_4_3}>4:3 (Standard)</option>
                <option value={AspectRatio.CUSTOM}>Custom</option>
              </select>
              
              {aspectRatio === AspectRatio.CUSTOM && (
                <input
                  type="text"
                  value={customAspectRatio}
                  onChange={(e) => setCustomAspectRatio(e.target.value)}
                  placeholder="e.g., 21:9"
                  className="w-full bg-robo-panel border border-robo-border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-robo-accent text-sm"
                />
              )}
            </div>
          </section>

          {/* 3. Prompts */}
          <section className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">3. Story Prompts</h2>
              <span className="text-xs text-robo-muted">{prompts.length}/{MAX_PROMPTS}</span>
            </div>
            
            <div className="space-y-3 mb-4">
              {prompts.map((prompt, idx) => (
                <div key={idx} className="relative group">
                  <textarea
                    value={prompt}
                    onChange={(e) => updatePrompt(idx, e.target.value)}
                    placeholder={`Scene ${idx + 1}: Describe the action...`}
                    rows={2}
                    className="w-full bg-robo-panel border border-robo-border rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-robo-accent focus:outline-none resize-none"
                  />
                  {prompts.length > 1 && (
                    <button 
                      onClick={() => removePrompt(idx)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove prompt"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {prompts.length < MAX_PROMPTS && (
              <Button variant="secondary" onClick={addPrompt} className="text-sm border-dashed">
                + Add Scene Prompt
              </Button>
            )}
          </section>

          {/* 4. Action */}
          <div className="pt-4 pb-8 sticky bottom-0 bg-robo-dark z-10 border-t border-robo-border/50">
             <Button 
               variant="danger" 
               fullWidth 
               className="h-12 text-lg shadow-lg shadow-red-900/20"
               onClick={handleGenerateAll}
               isLoading={isGenerating}
             >
               {isGenerating ? 'Generating...' : 'Generate All Images'}
             </Button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Results --- */}
      <div className="flex-1 bg-[#0f172a] p-4 lg:p-8 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Generated Stories</h2>
              <p className="text-robo-muted text-sm">Your generated storyboards will appear here</p>
            </div>
            {generatedImages.some(img => img.imageUrl) && (
              <Button variant="secondary" onClick={handleDownloadAll} disabled={isGenerating}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Batch
              </Button>
            )}
          </header>

          {/* Empty State */}
          {generatedImages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-robo-muted border-2 border-dashed border-robo-border rounded-2xl bg-robo-panel/30">
               <div className="w-20 h-20 rounded-full bg-robo-panel mb-4 flex items-center justify-center">
                 <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </div>
               <p className="text-lg font-medium text-gray-400">Ready to create your story?</p>
               <p className="text-sm text-gray-600 mt-2 max-w-xs text-center">Setup your characters and prompts on the left, then hit Generate.</p>
             </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {generatedImages.map((image) => (
              <div key={image.id} className="bg-robo-panel rounded-xl overflow-hidden border border-robo-border shadow-lg flex flex-col animate-in fade-in duration-500 fill-mode-backwards" style={{ animationDelay: `${image.index * 100}ms` }}>
                
                {/* Image Container */}
                <div className="relative aspect-video bg-gray-900 group">
                  {image.isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-robo-accent border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-500 animate-pulse">Dreaming up scene {image.index}...</span>
                      </div>
                    </div>
                  ) : image.error ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center bg-red-900/10">
                      <div className="text-red-400">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-xs font-medium">{image.error}</p>
                      </div>
                    </div>
                  ) : image.imageUrl ? (
                    <>
                      <img 
                        src={image.imageUrl} 
                        alt={image.prompt} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <button 
                          onClick={() => setViewingImage(image.imageUrl)}
                          className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-200 transition-colors transform hover:scale-110"
                          title="Zoom View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDownloadOne(image)}
                          className="p-3 bg-robo-accent text-white rounded-full hover:bg-robo-accentHover transition-colors transform hover:scale-110"
                          title="Download"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
                      </div>
                    </>
                  ) : null}
                  
                  {/* Aspect Ratio Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white/80 font-mono border border-white/10">
                    {image.index.toString().padStart(3, '0')}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                      {image.prompt}
                    </p>
                  </div>
                  
                  {image.imageUrl && (
                    <div className="mt-4 pt-3 border-t border-robo-border flex justify-between items-center text-xs text-gray-500 font-mono">
                      <span>{getFormattedDate()}</span>
                      <span>Generative AI</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;
