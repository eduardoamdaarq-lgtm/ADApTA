export type InspectionStatus = 'pendente' | 'conforme' | 'nao_conforme' | 'nao_se_aplica';

export type CriticalityLevel = 'Baixo' | 'Médio' | 'Crítico';

export interface InspectionItem {
  id: string;
  code: string;
  categoryId: string;
  categoryName: string;
  title: string;
  standardReference: string; // e.g. "ABNT NBR 9050:2020 item 6.12"
  standardRequirement: string; // e.g. "Largura livre mínima de 1,20m para rota acessível"
  status: InspectionStatus;
  measurement?: string; // e.g. "Medido: 0,92m (déficit de 28cm)"
  fieldNotes?: string;
  criticality?: CriticalityLevel;
  priorityGUT?: number; // 1 to 5 (Gravidade x Urgência x Tendência)
  technicalDiagnosis?: string; // Formatted text for report
  technicalRecommendation?: string; // Proposed intervention
  suggestedDeadlineDays?: number;
  photoUrl?: string;
  location?: string; // e.g. "Acesso Principal - Fachada Leste"
  updatedAt?: string;
}

export interface BuildingData {
  name: string;
  tradeName?: string;
  type: string; // Comercial, Residencial, Saúde, Educacional, etc.
  address: string;
  city: string;
  state: string;
  zipCode: string;
  constructedArea: string; // e.g. "3.450 m²"
  floorsCount: number;
  contractorName: string; // Proprietário / Contratante
  contractorCnpjCpf: string;
  technicalManager: string; // Arquiteto(a) responsável
  technicalCouncilId: string; // CAU / CREA
  rrtArtNumber: string; // Número do RRT / ART
  inspectionDate: string; // YYYY-MM-DD
}

export interface LaudoSummary {
  executiveSummary: string;
  classification: string;
  generalRecommendations: string[];
  technicalConclusion: string;
  legalBasis: string;
  generatedAt?: string;
}

export interface InspectionProject {
  id: string;
  building: BuildingData;
  items: InspectionItem[];
  laudoSummary?: LaudoSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  total: number;
  conforme: number;
  naoConforme: number;
  naoSeAplica: number;
  pendente: number;
  complianceRate: number;
}
