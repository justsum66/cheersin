import { useState, useEffect, useRef, KeyboardEvent, ReactElement } from 'react';
import { Search, TrendingUp, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'popular' | 'recent' | 'trending' | 'history';
  icon?: ReactElement;
}

interface SearchSuggestionsProps {
  query: string;
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: SearchSuggestion) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const SearchSuggestions = ({ 
  query, 
  suggestions, 
  onSelect, 
  isVisible, 
  onClose 
}: SearchSuggestionsProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isVisible) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  if (!isVisible || (query.length === 0 && suggestions.length === 0)) {
    return null;
  }

  // Show default suggestions when query is empty
  if (query.length === 0) {
    return (
      <div 
        ref={containerRef}
        className="absolute z-50 w-full mt-1 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-2xl shadow-black/50 max-h-80 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Popular Searches</span>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {suggestions.slice(0, 6).map((suggestion, index) => (
            <button
              key={`${suggestion.id}-${suggestion.type}`}
              type="button"
              onClick={() => onSelect(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 ${
                selectedIndex === index ? 'bg-white/5' : ''
              }`}
            >
              {suggestion.icon || <Search className="w-4 h-4 text-white/40" />}
              <span className="text-white/90">{suggestion.text}</span>
              <span className="ml-auto text-xs text-white/40 capitalize">{suggestion.type}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="absolute z-50 w-full mt-1 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-2xl shadow-black/50 max-h-80 overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Search className="w-4 h-4" />
            <span>Search Results</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-sm"
            aria-label="Close suggestions"
          >
            ESC
          </button>
        </div>
      </div>
      
      {suggestions.length > 0 ? (
        <div className="max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.id}-${suggestion.type}`}
              type="button"
              onClick={() => onSelect(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 ${
                selectedIndex === index ? 'bg-white/5' : ''
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion.icon || <Search className="w-4 h-4 text-white/40" />}
              <span className="text-white/90">
                {suggestion.text}
              </span>
              <span className="ml-auto text-xs text-white/40 capitalize">{suggestion.type}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-white/50 text-sm">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No results found</p>
          <p className="text-xs mt-1">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
};