import React, { useState } from 'react';
import { Lesson } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface LessonCardProps {
  lesson: Lesson;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const [isObjectivesCopied, setIsObjectivesCopied] = useState(false);
  const [isDescriptorsCopied, setIsDescriptorsCopied] = useState(false);

  const formatItem = (item: string) => {
    const trimmedItem = item.trim();
    return trimmedItem.endsWith('.') ? trimmedItem : `${trimmedItem}.`;
  };

  const handleCopyObjectivesAndContent = () => {
    const objectives = lesson.objetivos.map(formatItem);
    const contents = lesson.conteudos.map(formatItem);
    const textToCopy = [...objectives, ...contents].join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsObjectivesCopied(true);
      setTimeout(() => setIsObjectivesCopied(false), 2000);
    }).catch(err => {
        console.error("Failed to copy objectives and content: ", err);
    });
  };

  const handleCopyDescriptors = () => {
    if (!lesson.descritores || lesson.descritores.length === 0) return;
    
    const descriptors = lesson.descritores.map(desc => `${desc.id}, ${formatItem(desc.description)}`);
    const textToCopy = descriptors.join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsDescriptorsCopied(true);
      setTimeout(() => setIsDescriptorsCopied(false), 2000);
    }).catch(err => {
        console.error("Failed to copy descriptors: ", err);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10 animate-fade-in">
      <div className="p-6 relative">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-2xl font-bold text-emerald-700">Aula {lesson.aula}</h3>
                <p className="text-gray-500 text-sm mt-1">Título: {lesson.titulo}</p>
                <p className="text-gray-500 text-sm">Título do Vídeo: {lesson.tituloVideo}</p>
            </div>
            <button
                onClick={handleCopyObjectivesAndContent}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                aria-label="Copiar objetivos e conteúdos para a área de transferência"
            >
                {isObjectivesCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-3">Objetivos de Aprendizagem</h4>
                <ul className="space-y-2 list-disc list-inside text-gray-600">
                    {lesson.objetivos.map((obj, index) => (
                        <li key={index}>{obj}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-3">Conteúdos Foco</h4>
                <ul className="space-y-2 list-disc list-inside text-gray-600">
                     {lesson.conteudos.map((content, index) => (
                        <li key={index}>{content}</li>
                    ))}
                </ul>
            </div>
        </div>

        {lesson.descritores && lesson.descritores.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-lg text-gray-800">Descritores</h4>
              <button
                onClick={handleCopyDescriptors}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                aria-label="Copiar descritores para a área de transferência"
              >
                {isDescriptorsCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
              </button>
            </div>
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              {lesson.descritores.map((desc, index) => (
                <li key={index}>
                  <span className="font-semibold">{desc.id}</span>: {desc.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonCard;