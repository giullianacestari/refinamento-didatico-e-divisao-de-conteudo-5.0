import { GoogleGenAI, Type } from "@google/genai";
import { Lesson, LessonPlan, Descriptor, ToolsAndSites, SuggestedSite } from '../types';
import { descriptorsBySkill } from '../data/descriptors';
import { skillsWithDescriptions } from "../data/skillsWithDescriptions";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const descriptorSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "O ID do descritor. Exemplo: D88" },
        description: { type: Type.STRING, description: "A descrição completa do descritor." }
    }
};

const lessonSchema = {
    type: Type.OBJECT,
    properties: {
        aula: { type: Type.INTEGER, description: "O número da aula. Exemplo: 1" },
        titulo: { type: Type.STRING, description: "Título conciso e informativo para a aula." },
        tituloVideo: { type: Type.STRING, description: "Título para o vídeo, diferente do título da aula." },
        objetivos: {
            type: Type.ARRAY,
            description: "Uma lista com exatamente 3 objetivos de aprendizagem da aula, cada um começando com um verbo.",
            items: { type: Type.STRING }
        },
        conteudos: {
            type: Type.ARRAY,
            description: "Uma lista com exatamente 3 conceitos técnicos principais abordados na aula.",
            items: { type: Type.STRING }
        },
        descritores: {
            type: Type.ARRAY,
            description: "Uma lista dos descritores mais relevantes para esta aula, selecionados da lista fornecida ou inferidos a partir do conteúdo.",
            items: descriptorSchema
        }
    }
};

const suggestedSiteSchema = {
    type: Type.OBJECT,
    properties: {
        url: { type: Type.STRING, description: "O URL completo do site sugerido." },
        aula: { type: Type.INTEGER, description: "O número da aula à qual este site se refere." }
    }
};

const toolsAndSitesSchema = {
    type: Type.OBJECT,
    properties: {
        ferramentas: {
            type: Type.ARRAY,
            description: "Uma lista de URLs das ferramentas principais utilizadas nas aulas (ex: IDEs, simuladores).",
            items: { type: Type.STRING }
        },
        sitesSugeridos: {
            type: Type.ARRAY,
            description: "Uma lista de URLs para conteúdo adicional ('Para Saber Mais'), com a referência da aula correspondente.",
            items: suggestedSiteSchema
        }
    }
};


const fullSchema = {
    type: Type.OBJECT,
    properties: {
        sitesFerramentas: { 
            ...toolsAndSitesSchema, 
            description: "Uma seção contendo as ferramentas utilizadas e sites sugeridos para a unidade."
        },
        unidadeConteudo: {
            type: Type.STRING,
            description: "Um texto breve e comercial sobre a unidade, destinado a docentes, com alta coerência textual."
        },
        unidadeObjetivos: {
            type: Type.ARRAY,
            description: "Uma lista de até 5 objetivos de aprendizagem gerais para a unidade, baseados nos objetivos das aulas.",
            items: { type: Type.STRING }
        },
        aulas: {
            type: Type.ARRAY,
            description: "Uma lista de todas as aulas encontradas no roteiro.",
            items: lessonSchema
        }
    }
};

const formatTitle = (title: string): string => {
    if (!title || typeof title !== 'string') return '';
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
};

export const generateLessonPlan = async (script: string, selectedSkills: string[]): Promise<LessonPlan> => {
    try {
        const relevantDescriptors: Descriptor[] = selectedSkills.flatMap(skillCode => descriptorsBySkill[skillCode] || []);
        const descriptorsText = relevantDescriptors.length > 0 
            ? relevantDescriptors.map(d => `${d.id}: ${d.description}`).join('\n')
            : 'Nenhum descritor fornecido.';

        const prompt = `
        Você é um especialista em extração e estruturação de conteúdo pedagógico. Sua tarefa principal e mais importante é analisar o roteiro de gravação fornecido e extrair as informações solicitadas.

        PRIORIDADE MÁXIMA: Extrair o array 'aulas'. Se o roteiro contém 'Aula 1', 'Aula 2', etc., o array 'aulas' NUNCA deve estar vazio. Se você tiver dificuldade com a complexidade do texto, simplifique os outros campos, mas GARANTA que a lista de aulas seja extraída.

        Analise o roteiro abaixo e gere as seguintes informações:

        1.  **Sites e Ferramentas (NOVA SEÇÃO)**: Acima de todas as outras saídas, analise o roteiro para identificar e listar:
            - **Ferramentas utilizadas**: Identifique as principais plataformas, softwares ou sites que são essenciais para a execução das aulas. Forneça apenas os URLs base (ex: "www.tinkercad.com", "https://ide.mblock.cc/").
            - **Sites sugeridos ("Para Saber Mais")**: Sugira uma lista de no **máximo 5 (cinco)** links no total para toda a unidade. Estes links devem ser de **fontes extremamente confiáveis e ativas** (ex: documentações oficiais, artigos de universidades, sites .org, .gov, ou de desenvolvedores renomados como developer.mozilla.org). Priorize a **qualidade e relevância** sobre a quantidade. Não precisa sugerir um site para cada aula. Para cada link, associe o número da aula mais relevante.

        2.  **Lista de Aulas (CRÍTICO)**: Para CADA aula encontrada (ex: 'Aula 1', 'Encontro 2'), extraia:
            - **Título da aula**: conciso e informativo.
            - **Título do vídeo**: diferente do título da aula.
            - **Objetivos de aprendizagem**: Uma lista de **exatamente 3** objetivos, cada um começando com um verbo. Se o texto original tiver mais de 3, sintetize os mais importantes. Se tiver menos, elabore objetivos adicionais que sejam coerentes com o conteúdo da aula.
            - **Conteúdos foco**: Uma lista de **exatamente 3** conceitos técnicos. Se o texto original tiver mais de 3, agrupe-os ou selecione os principais. Se tiver menos, detalhe ou adicione conceitos relacionados para atingir o total de 3.
            - **Descritores**: A sua regra para os descritores é a seguinte:
              - **Se o roteiro mencionar explicitamente códigos de descritores (ex: D01, D88)**: extraia os descritores mencionados para a aula correspondente, usando a descrição exata da lista que forneci abaixo.
              - **Se o roteiro NÃO mencionar descritores**: para cada aula, analise seu conteúdo e objetivos e selecione **exatamente 1 (um)** descritor da lista de 'Descritores associados a estas habilidades' que forneci. É CRUCIAL que você escolha um descritor **EXISTENTE** da lista. **NÃO INVENTE descritores, códigos ou descrições.** Sua escolha deve se limitar estritamente à lista fornecida. Você pode repetir o mesmo descritor para aulas diferentes se for a escolha mais pertinente.

        3.  **CONTEÚDO DA UNIDADE**: Crie um texto breve e comercial sobre a unidade, com alta coerência, destinado a docentes.
            Exemplo: "Nesta unidade, o estudante aplica a lógica computacional para desenvolver um quiz interativo sobre reciclagem no StartLab. Durante as aulas, ele explorará a identificação de problemas, a organização de dados com listas e a implementação de lógica condicional..."

        4.  **OBJETIVOS DE APRENDIZAGEM DA UNIDADE**: Crie uma lista de até 5 objetivos gerais para a unidade. Estes objetivos devem ser uma **síntese do conteúdo prático e das metas das aulas individuais**, e não apenas uma repetição das habilidades BNCC abstratas.
            **FOCO**: No que o estudante vai aprender a FAZER. Pense em verbos que descrevam ações concretas dentro do contexto das aulas.
            **Exemplo de objetivo bom e contextualizado**: "Implementar circuitos eletrônicos, compreendendo a relação entre o caminho da energia e polaridades dos componentes."
            **Exemplo de objetivo a ser evitado (muito genérico)**: "Elaborar algoritmos que envolvam instruções sequenciais."

        Se você não conseguir extrair um campo de uma aula específica, deixe-o como um array vazio ou string vazia, mas inclua a aula na lista.

        Habilidades BNCC selecionadas: ${selectedSkills.join(', ')}

        Descritores associados a estas habilidades:
        ---
        ${descriptorsText}
        ---

        Roteiro de Gravação:
        ---
        ${script}
        ---

        Formate a saída estritamente como o JSON schema definido. A prioridade é preencher o array 'aulas'.
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: fullSchema,
                temperature: 0.2,
            }
        });

        const jsonResponse = JSON.parse(response.text);

        const habilidadesCompletas = selectedSkills.map(skillCode => {
            const description = skillsWithDescriptions[skillCode] || 'Descrição não encontrada.';
            return `(${skillCode}) ${description}`;
        });
        
        const validatedPlan: LessonPlan = {
            sitesFerramentas: jsonResponse.sitesFerramentas || { ferramentas: [], sitesSugeridos: [] },
            unidadeConteudo: jsonResponse.unidadeConteudo || '',
            habilidades: habilidadesCompletas,
            unidadeObjetivos: jsonResponse.unidadeObjetivos || [],
            aulas: (jsonResponse.aulas || []).map((aula: any) => ({
                ...aula,
                titulo: formatTitle(aula.titulo),
                tituloVideo: formatTitle(aula.tituloVideo),
                descritores: aula.descritores || [],
            })),
        };
        
        return validatedPlan;

    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Falha ao gerar o plano de aula: ${error.message}`);
        }
        throw new Error("Ocorreu um erro desconhecido ao se comunicar com a API.");
    }
};