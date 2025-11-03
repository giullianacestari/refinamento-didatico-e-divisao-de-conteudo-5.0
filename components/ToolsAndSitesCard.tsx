import React, { useState } from 'react';
import { ToolsAndSites } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface ToolsAndSitesCardProps {
  data: ToolsAndSites;
}

const ToolsAndSitesCard: React.FC<ToolsAndSitesCardProps> = ({ data }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    let textToCopy = "Ferramentas:\n";
    textToCopy += data.ferramentas.join('\n');
    textToCopy += "\n\nSites sugeridos:\n";
    textToCopy += data.sitesSugeridos.map(site => `${site.url} - para a aula ${site.aula}`).join('\n');
    
    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error("Failed to copy tools and sites: ", err);
    });
  };

  const hasContent = data.ferramentas?.length > 0 || data.sitesSugeridos?.length > 0;
  if (!hasContent) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10 animate-fade-in">
      <div className="p-6 relative">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold text-emerald-700">Sites / Ferramentas utilizadas</h3>
          <button
            onClick={handleCopy}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            aria-label="Copiar sites e ferramentas"
          >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {data.ferramentas && data.ferramentas.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg text-gray-800 mb-3">Ferramentas</h4>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                {data.ferramentas.map((tool, index) => (
                  <li key={index}>
                    <a href={tool.startsWith('http') ? tool : `//${tool}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 break-all">
                      {tool}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.sitesSugeridos && data.sitesSugeridos.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg text-gray-800 mb-3">Sites sugeridos (Para Saber Mais)</h4>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                {data.sitesSugeridos.map((site, index) => (
                  <li key={index}>
                    <a href={site.url.startsWith('http') ? site.url : `//${site.url}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600 break-all">
                      {site.url}
                    </a> - para a aula {site.aula}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolsAndSitesCard;