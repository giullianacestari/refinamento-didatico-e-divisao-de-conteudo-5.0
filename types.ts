export interface Descriptor {
  id: string;
  description: string;
}

export interface Lesson {
  aula: number;
  titulo: string;
  tituloVideo: string;
  objetivos: string[];
  conteudos: string[];
  descritores: Descriptor[];
}

export interface SuggestedSite {
  url: string;
  aula: number;
}

export interface ToolsAndSites {
  ferramentas: string[];
  sitesSugeridos: SuggestedSite[];
}

export interface LessonPlan {
  unidadeConteudo: string;
  habilidades: string[];
  unidadeObjetivos: string[];
  aulas: Lesson[];
  sitesFerramentas: ToolsAndSites;
}