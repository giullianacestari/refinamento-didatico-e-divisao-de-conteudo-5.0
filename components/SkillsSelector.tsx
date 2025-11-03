import React, { useState, useRef, useEffect } from 'react';
import XIcon from './icons/XIcon';

interface SkillsSelectorProps {
  availableSkills: string[];
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

const SkillsSelector: React.FC<SkillsSelectorProps> = ({ availableSkills, selectedSkills, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredSkills = availableSkills.filter(skill => 
    skill.toLowerCase().includes(inputValue.toLowerCase()) && !selectedSkills.includes(skill)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  const addSkill = (skill: string) => {
    const newSkill = skill.trim().toUpperCase();
    if (newSkill && !selectedSkills.includes(newSkill)) {
      onChange([...selectedSkills, newSkill]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue) {
        addSkill(inputValue);
      } else if (filteredSkills.length > 0 && showSuggestions) {
        addSkill(filteredSkills[0]);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      removeSkill(selectedSkills[selectedSkills.length - 1]);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor="skill-input" className="block text-sm font-medium text-gray-700 mb-2">Habilidades (BNCC)</label>
      <div className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm p-2 flex flex-wrap items-center gap-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition" onClick={() => document.getElementById('skill-input')?.focus()}>
        {selectedSkills.map(skill => (
          <div key={skill} className="flex items-center bg-emerald-100 text-emerald-800 text-sm font-medium px-2 py-1 rounded-full">
            <span>{skill}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill);
              }}
              className="ml-2 rounded-full hover:bg-emerald-200"
              aria-label={`Remover habilidade ${skill}`}
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        <input
          id="skill-input"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!showSuggestions) setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent outline-none p-1 text-gray-900 placeholder-gray-400 min-w-[150px]"
          placeholder={selectedSkills.length === 0 ? "Digite ou selecione uma habilidade..." : ""}
        />
      </div>
      {showSuggestions && (inputValue || (filteredSkills.length > 0 && selectedSkills.length < availableSkills.length)) && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSkills.length > 0 ? filteredSkills.map(skill => (
            <li
              key={skill}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing before click
              onClick={() => addSkill(skill)}
              className="px-4 py-2 cursor-pointer hover:bg-emerald-50 text-gray-700"
            >
              {skill}
            </li>
          )) : (
            <li className="px-4 py-2 text-gray-500">
                Pressione Enter para adicionar "{inputValue}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SkillsSelector;