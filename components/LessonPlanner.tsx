import React, { useState } from 'react';
import mammoth from 'mammoth';
import { generateLessonPlan } from '../services/geminiService';
import { LessonPlan } from '../types';
import { gradeOptions, skillsByGrade, Grade } from '../data/skills';
import Loader from './Loader';
import LessonCard from './LessonCard';
import UnitContentCard from './UnitContentCard';
import UnitObjectivesCard from './UnitObjectivesCard';
import ToolsAndSitesCard from './ToolsAndSitesCard';
import UploadIcon from './icons/UploadIcon';
import FileDocIcon from './icons/FileDocIcon';
import XIcon from './icons/XIcon';
import SkillsCard from './SkillsCard';
import SkillsSelector from './SkillsSelector';

const LessonPlanner: React.FC = () => {
  const [script, setScript] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(gradeOptions[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGrade = e.target.value as Grade;
    setSelectedGrade(newGrade);
    setSelectedSkills([]); // Reset skills when grade changes
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName('');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.docx')) {
        setSelectedFile(file);
        setFileName(file.name);
        setScript(''); // Clear textarea content
        setError(null);
      } else {
        setError('Por favor, selecione um arquivo .docx válido.');
        e.target.value = ''; 
        handleRemoveFile();
      }
    }
  };

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScript(e.target.value);
    if (selectedFile) {
      handleRemoveFile();
    }
  };


  const handleSubmit = async () => {
    if ((!script.trim() && !selectedFile) || selectedSkills.length === 0) {
      setError('Por favor, insira um roteiro ou carregue um arquivo e selecione pelo menos uma habilidade.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLessonPlan(null);

    try {
      let scriptContent = script;

      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        scriptContent = result.value;
      }
      
      const plan = await generateLessonPlan(scriptContent, selectedSkills);
      setLessonPlan(plan);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-emerald-700 tracking-tight sm:text-4xl">Gerador de divisão de conteúdo</h2>
          <p className="mt-4 text-lg text-gray-600">Selecione o ano, a habilidade, e depois um arquivo .docx com o plano de aula / roteiro / transcrição ou cole o conteúdo abaixo.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="grade-select" className="block text-sm font-medium text-gray-700 mb-2">Ano/Série</label>
              <select
                id="grade-select"
                value={selectedGrade}
                onChange={handleGradeChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
               <SkillsSelector
                  availableSkills={skillsByGrade[selectedGrade]}
                  selectedSkills={selectedSkills}
                  onChange={setSelectedSkills}
                />
            </div>
          </div>

          <div>
             <label htmlFor="script-textarea" className="block text-sm font-medium text-gray-700 mb-2">Plano de aula / roteiro / transcrição completa - todas as aulas</label>
            <div className="mt-1 relative">
               <textarea
                id="script-textarea"
                rows={12}
                className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition placeholder-gray-400"
                placeholder="Cole o roteiro aqui..."
                value={script}
                onChange={handleScriptChange}
              />
               <div className="absolute bottom-3 right-3">
                 <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">
                  <UploadIcon className="w-5 h-5 mr-2" />
                  Carregar .docx
                </label>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".docx" />
              </div>
            </div>
            {fileName && (
              <div className="mt-3 flex items-center justify-between bg-gray-100 text-gray-700 text-sm rounded-md px-3 py-2">
                  <div className="flex items-center">
                    <FileDocIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    <span>{fileName}</span>
                  </div>
                  <button onClick={handleRemoveFile} type="button" className="p-1 rounded-full hover:bg-gray-200">
                      <XIcon className="w-4 h-4" />
                  </button>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isLoading || (!script.trim() && !selectedFile) || selectedSkills.length === 0}
              className="inline-flex items-center justify-center w-full md:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? <Loader /> : 'Gerar Divisão de Conteúdo'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-8 text-center bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md animate-fade-in" role="alert">
            <p><strong>Erro:</strong> {error}</p>
          </div>
        )}
      </div>

      {lessonPlan && (
        <div className="max-w-4xl mx-auto mt-12 space-y-8">
           {lessonPlan.sitesFerramentas && <ToolsAndSitesCard data={lessonPlan.sitesFerramentas} />}
           {lessonPlan.unidadeConteudo && <UnitContentCard content={lessonPlan.unidadeConteudo} />}
           {lessonPlan.habilidades && lessonPlan.habilidades.length > 0 && <SkillsCard skills={lessonPlan.habilidades} />}
           {lessonPlan.unidadeObjetivos && lessonPlan.unidadeObjetivos.length > 0 && <UnitObjectivesCard objectives={lessonPlan.unidadeObjetivos} />}
          
          {lessonPlan.aulas.map(lesson => (
            <LessonCard key={lesson.aula} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonPlanner;