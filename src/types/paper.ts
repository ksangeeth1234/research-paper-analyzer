export interface SectorSummary {
  researchProblem: string;
  researchObjective: string;
  researchQuestions: string;
  methodology: string;
  datasetParticipants: string;
  findings: string;
  limitations: string;
  futureWorks: string;
}

export interface SectorDefinition {
  key: keyof SectorSummary;
  label: string;
  description: string;
  placeholder: string;
}

export const SECTOR_DEFINITIONS: SectorDefinition[] = [
  {
    key: 'researchProblem',
    label: 'Research Problem',
    description: 'A clear summary of the main problem, knowledge gap, or practical challenge addressed.',
    placeholder: 'Summarize the primary knowledge gap or research problem addressed by the paper...'
  },
  {
    key: 'researchObjective',
    label: 'Research Objective',
    description: 'A summary of the main aim and objectives of the research.',
    placeholder: 'State what the researchers intended to achieve, evaluate, or demonstrate...'
  },
  {
    key: 'researchQuestions',
    label: 'Research Questions',
    description: 'The research questions explicitly stated or clearly identifiable (labeled as [Inferred] if not explicit).',
    placeholder: 'Explicit or inferred research questions investigated in the study...'
  },
  {
    key: 'methodology',
    label: 'Methodology',
    description: 'A summary of the research design, methods, techniques, models, or approaches used.',
    placeholder: 'Describe the research design, models, algorithms, frameworks, or procedures...'
  },
  {
    key: 'datasetParticipants',
    label: 'Dataset / Participants',
    description: 'Information about datasets, data sources, sample sizes, participants, or study locations.',
    placeholder: 'Detail the datasets, sample sizes, demographic details, or collection sources...'
  },
  {
    key: 'findings',
    label: 'Findings',
    description: 'The main results, outcomes, discoveries, and conclusions reported by the researchers.',
    placeholder: 'Detail the primary findings, key statistical/numerical results, and discoveries...'
  },
  {
    key: 'limitations',
    label: 'Limitations',
    description: 'The limitations, weaknesses, constraints, or challenges acknowledged by the authors.',
    placeholder: 'Author-acknowledged constraints, assumptions, and scope limitations...'
  },
  {
    key: 'futureWorks',
    label: 'Future Works',
    description: 'Future research directions, recommendations, and improvements suggested by the authors.',
    placeholder: 'Directions for future inquiry, potential extensions, and unaddressed challenges...'
  }
];

export interface AnalyzedPaper {
  id: string;
  paperNumber: number; // e.g. 1 for "Paper 01"
  title: string;
  authors: string;
  fileName: string;
  fileHash?: string;
  fileSizeBytes?: number;
  extractedSectors: SectorSummary;
  pageCount?: number;
  createdAt: string;
  updatedAt?: string;
  status: 'confirmed';
  notes?: string;
}

export interface PaperDraft {
  title: string;
  authors: string;
  fileName: string;
  fileHash?: string;
  fileSizeBytes?: number;
  extractedSectors: SectorSummary;
  pageCount?: number;
  rawTextSnippet?: string;
}
