import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-robo-panel border border-robo-border rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-robo-border flex items-center justify-between bg-gray-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-robo-accent">?</span> How to Use Robo AI
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-gray-300">
          
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-robo-accent/20 text-robo-accent flex items-center justify-center font-bold border border-robo-accent/50">1</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Upload Character References</h3>
              <p className="text-sm leading-relaxed">
                Upload clear images for your characters in the slots provided. 
                Give them names (e.g., "Hero", "Villain") to easily reference them in your prompts. 
                Check the box next to a character to include them in the current generation batch.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-robo-accent/20 text-robo-accent flex items-center justify-center font-bold border border-robo-accent/50">2</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Choose Aspect Ratio</h3>
              <p className="text-sm leading-relaxed">
                Select the dimensions for your output images. 
                Standard options like 16:9 (Landscape) or 1:1 (Square) are available, or enter a custom ratio.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-robo-accent/20 text-robo-accent flex items-center justify-center font-bold border border-robo-accent/50">3</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Write Story Prompts</h3>
              <p className="text-sm leading-relaxed">
                Add multiple prompts to create a sequence. 
                <strong className="text-white"> Tip:</strong> Use the exact character names you set in step 1 (e.g., "Hero running", "Villain laughing") 
                to ensure the AI uses the correct reference image.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-robo-accent/20 text-robo-accent flex items-center justify-center font-bold border border-robo-accent/50">4</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Generate & Download</h3>
              <p className="text-sm leading-relaxed">
                Click <span className="text-red-400 font-medium">Generate All Images</span>. The AI will process all prompts in parallel.
                Once done, click an image to zoom/pan, or use "Download All" to save them with organized filenames.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-robo-border bg-gray-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-robo-panel hover:bg-gray-700 text-white rounded-lg border border-robo-border transition-colors font-medium"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};