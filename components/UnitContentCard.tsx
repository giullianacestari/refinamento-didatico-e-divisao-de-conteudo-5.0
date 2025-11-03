import React, { useState } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface UnitContentCardProps {
  content: string;
}

const UnitContentCard: React.FC<UnitContentCardProps> = ({ content }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
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
          <h3 className="text-2xl font-bold text-emerald-700">CONTEÚDO DA UNIDADE (abordagem comercial)</h3>
          <button
            onClick={handleCopy}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            aria-label="Copiar conteúdo da unidade"
          >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-gray-600 whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default UnitContentCard;