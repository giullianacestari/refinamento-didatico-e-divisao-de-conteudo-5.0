import React, { useState } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface UnitObjectivesCardProps {
  objectives: string[];
}

const UnitObjectivesCard: React.FC<UnitObjectivesCardProps> = ({ objectives }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = objectives.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10">
      <div className="p-6 relative">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold text-emerald-700">OBJETIVOS DE APRENDIZAGEM</h3>
          <button
            onClick={handleCopy}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            aria-label="Copiar objetivos de aprendizagem"
          >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-4">
          <ul className="space-y-2 list-disc list-inside text-gray-600">
            {objectives.map((obj, index) => (
              <li key={index}>{obj}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnitObjectivesCard;