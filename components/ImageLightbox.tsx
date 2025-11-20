import React, { useState, useRef, useEffect } from 'react';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  // Prevent scrolling body when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center overflow-hidden select-none animate-in fade-in duration-200"
      onClick={onClose}
      onWheel={handleWheel}
    >
      {/* Toolbar */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700 shadow-2xl z-50"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={zoomOut}
          className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
        </button>
        
        <span className="text-xs text-gray-400 w-12 text-center font-mono">
          {Math.round(scale * 100)}%
        </span>

        <button 
          onClick={zoomIn}
          className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </button>

        <div className="w-px h-4 bg-gray-600 mx-1"></div>

        <button 
          onClick={reset}
          className="px-3 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          Reset
        </button>
        
        <div className="w-px h-4 bg-gray-600 mx-1"></div>

        <button 
          onClick={onClose}
          className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full text-gray-300 transition-colors"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Zoom view"
          className="max-w-full max-h-full object-contain transition-transform duration-75 ease-linear cursor-move"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
          }}
          draggable={false}
          onClick={e => e.stopPropagation()}
        />
      </div>
      
      <div className="absolute top-4 right-4 text-white/50 text-xs pointer-events-none">
        Scroll to zoom • Drag to pan
      </div>
    </div>
  );
};
