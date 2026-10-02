export type InspectionStatus = 'pendente' | 'conforme' | 'nao_conforme' | 'nao_se_aplica';

export type CriticalityLevel = 'Baixo' | 'Médio' | 'Crítico';

export type BuildingClassification = 'uso_publico' | 'uso_coletivo';

export type ProjectInspectionStatus = 'em_andamento' | 'concluida' | 'agendada';

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  council: string;
  cau: string;
  rrtArtDefault?: string;
  avatarUrl?: string;
}

export interface SectorDefinition {
  id: string;
  name: string;
  description?: string;
  codePrefix?: string;
  createdAt?: string;
}

export interface InspectionItem {
  id: string;
  code: string;
  sectorId: string; // ID do setor (ex: "passeio_publico", "acesso_principal", etc.)
  sectorName: string; // Nome do setor (ex: "Passeio Público", "Acesso Principal", etc.)
  categoryId?: string; // Compatibilidade retroativa
  categoryName?: string; // Compatibilidade retroativa
  elementName?: string; // Elemento do setor (ex: "Circulação", "Piso", "Rampa", "Porta", "Sanitário")
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
  classification: BuildingClassification; // Uso Público ou Uso Coletivo (Decreto nº 5.296/2004)
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
  status?: ProjectInspectionStatus;
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
  sectors: SectorDefinition[];
  items: InspectionItem[];
  laudoSummary?: LaudoSummary;
  status?: ProjectInspectionStatus; // 'em_andamento' | 'concluida' | 'agendada'
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectorSummary {
  id: string;
  name: string;
  total: number;
  conforme: number;
  naoConforme: number;
  naoSeAplica: number;
  pendente: number;
  complianceRate: number;
}

export interface CategorySummary extends SectorSummary {}

