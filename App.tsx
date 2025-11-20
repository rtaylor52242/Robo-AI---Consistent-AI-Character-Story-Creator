import React, { useState } from 'react';
import { Character, GeneratedImage, AspectRatio, MAX_PROMPTS } from './types';
import { CharacterSlot } from './components/CharacterSlot';
import { Button } from './components/Button';
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
      
      {/* --- Left Column: Control Panel --- */}
      <div className="w-full lg:w-[400px] shrink-0 bg-robo-dark border-r border-robo-border flex flex-col h-screen overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-8">
          
          <header>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-robo-accent">⚡</span> Robo AI
            </h1>
            <p className="text-sm text-robo-muted mt-1">Consistent AI Character Story Creator</p>
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
      <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Results Gallery</h2>
            {generatedImages.length > 0 && (
               <Button onClick={handleDownloadAll} disabled={isGenerating || generatedImages.every(i => !i.imageUrl)}>
                 Download All
               </Button>
            )}
          </div>

          {generatedImages.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p>Configure your characters and prompts to start generating.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {generatedImages.map((img) => (
                <div key={img.id} className="bg-robo-panel border border-robo-border rounded-xl overflow-hidden shadow-xl flex flex-col group">
                  <div className="aspect-video bg-black relative overflow-hidden">
                    {img.isLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-robo-accent"></div>
                      </div>
                    ) : img.error ? (
                      <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-red-400 text-sm bg-black/80">
                        {img.error}
                      </div>
                    ) : img.imageUrl ? (
                      <>
                        <img src={img.imageUrl} alt={img.prompt} className="w-full h-full object-contain" />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <button 
                             onClick={() => window.open(img.imageUrl!, '_blank')}
                             className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                             title="View Full Size"
                           >
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                           </button>
                           <button 
                             onClick={() => handleDownloadOne(img)}
                             className="p-2 bg-robo-accent hover:bg-robo-accentHover rounded-full text-white shadow-lg transition-colors"
                             title="Download"
                           >
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                           </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-robo-muted bg-black/30 px-2 py-1 rounded">
                          #{String(img.index).padStart(3, '0')}
                        </span>
                        <span className="text-[10px] text-gray-500">{getFormattedDate()}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2" title={img.prompt}>
                      {img.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;