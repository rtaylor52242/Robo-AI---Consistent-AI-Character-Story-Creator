import React, { useRef } from 'react';
import { Character } from '../types';
import { Button } from './Button';

interface CharacterSlotProps {
  character: Character;
  onUpdate: (id: string, updates: Partial<Character>) => void;
}

export const CharacterSlot: React.FC<CharacterSlotProps> = ({ character, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate(character.id, { file, previewUrl: url, isSelected: true });
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${character.isSelected ? 'border-robo-accent bg-robo-accent/5' : 'border-robo-border bg-robo-panel'} transition-colors`}>
      <div className="flex items-center gap-3 mb-2">
        <input
          type="checkbox"
          checked={character.isSelected}
          onChange={(e) => onUpdate(character.id, { isSelected: e.target.checked })}
          className="w-4 h-4 rounded border-gray-600 text-robo-accent focus:ring-robo-accent bg-gray-800"
        />
        <input
          type="text"
          value={character.name}
          onChange={(e) => onUpdate(character.id, { name: e.target.value })}
          className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-robo-accent focus:outline-none text-sm font-medium text-white w-full px-1"
          placeholder="Character Name"
        />
      </div>

      <div className="flex gap-3 items-start">
        <div className="w-16 h-16 shrink-0 rounded bg-gray-800 overflow-hidden border border-gray-700 flex items-center justify-center">
          {character.previewUrl ? (
            <img src={character.previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-500">No Img</span>
          )}
        </div>
        
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs w-full py-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            {character.file ? 'Change Image' : '+ Upload Image'}
          </Button>
          {character.file && (
             <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[120px]">{character.file.name}</p>
          )}
        </div>
      </div>
    </div>
  );
};