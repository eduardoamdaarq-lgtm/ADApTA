import React, { useState, useMemo } from 'react';
import { InspectionItem, InspectionStatus, CriticalityLevel, SectorDefinition, BuildingData } from '../types/inspection';
import { 
  Search, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Ruler, 
  Loader2,
  FolderPlus,
  Layers,
  Component,
  Building2,
  ShieldCheck,
  Edit3,
  SlidersHorizontal
} from 'lucide-react';
import { PREESTABLISHED_SECTORS } from '../data/defaultChecklist';

interface FieldChecklistProps {
  items: InspectionItem[];
  sectors: SectorDefinition[];
  building?: BuildingData;
  onEditBuilding?: () => void;
  onUpdateItem: (item: InspectionItem) => void;
  onAddItem: (item: InspectionItem) => void;
  onDeleteItem: (id: string) => void;
  onAddSector: (sector: SectorDefinition) => void;
  selectedFilterStatus?: string;
  onClearFilterStatus?: () => void;
}

export const FieldChecklist: React.FC<FieldChecklistProps> = ({
  items,
  sectors,
  building,
  onEditBuilding,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onAddSector,
  selectedFilterStatus = 'todos',
  onClearFilterStatus,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(selectedFilterStatus);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isAiLoadingMap, setIsAiLoadingMap] = useState<Record<string, boolean>>({});
  const [groupByElement, setGroupByElement] = useState<boolean>(true);
  
  // Modals
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [showAddSectorModal, setShowAddSectorModal] = useState<boolean>(false);

  // New Sector State
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorCode, setNewSectorCode] = useState('');
  const [newSectorDesc, setNewSectorDesc] = useState('');

  // New Item State (1.1.1 Elemento do Setor)
  const [newItemSectorId, setNewItemSectorId] = useState(sectors[0]?.id || 'geral');
  const [newItemElementName, setNewItemElementName] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemStandard, setNewItemStandard] = useState('ABNT NBR 9050:2020');
  const [newItemReq, setNewItemReq] = useState('');

  // Sync incoming filter from stats
  React.useEffect(() => {
    if (selectedFilterStatus) {
      setStatusFilter(selectedFilterStatus);
    }
  }, [selectedFilterStatus]);

  // Handle Photo Upload
  const handlePhotoUpload = (item: InspectionItem, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpdateItem({
        ...item,
        photoUrl: base64,
        updatedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Status Change
  const handleStatusChange = (item: InspectionItem, newStatus: InspectionStatus) => {
    const updated: InspectionItem = {
      ...item,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (newStatus === 'nao_conforme' && !updated.criticality) {
      updated.criticality = 'Médio';
      updated.priorityGUT = 3;
      updated.suggestedDeadlineDays = 60;
    }

    onUpdateItem(updated);
    if (newStatus === 'nao_conforme') {
      setExpandedItemId(item.id);
    }
  };

  // Call AI Specialist Diagnosis
  const handleAiDiagnosis = async (item: InspectionItem) => {
    try {
      setIsAiLoadingMap(prev => ({ ...prev, [item.id]: true }));

      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemTitle: item.title,
          category: item.sectorName || item.categoryName,
          standard: item.standardReference,
          measurement: item.measurement,
          notes: item.fieldNotes,
          status: item.status,
          photoBase64: item.photoUrl?.startsWith('data:') ? item.photoUrl : undefined,
        }),
      });

      if (!res.ok) throw new Error('Falha na resposta da API');
      const data = await res.json();

      if (data.success) {
        onUpdateItem({
          ...item,
          technicalDiagnosis: data.diagnosis,
          technicalRecommendation: data.recommendation,
          criticality: data.criticality || item.criticality || 'Médio',
          priorityGUT: data.priorityGUT || item.priorityGUT || 3,
          suggestedDeadlineDays: data.suggestedDeadlineDays || item.suggestedDeadlineDays || 60,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
      onUpdateItem({
        ...item,
        technicalDiagnosis: `Constatada não conformidade com os parâmetros da ${item.standardReference}. A medição de ${item.measurement || 'campo'} indica divergência dos limites normativos, prejudicando o fluxo livre e autônomo dos usuários.`,
        technicalRecommendation: `Proceder às reformas de adequação física regularizando as cotas e materiais conforme o Desenho Universal da NBR 9050.`,
        criticality: item.criticality || 'Médio',
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsAiLoadingMap(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Create New Sector (1.1 Setor)
  const handleCreateSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName.trim()) return;

    const sectorId = `setor_${Date.now()}`;
    const code = newSectorCode.trim().toUpperCase() || newSectorName.substring(0, 3).toUpperCase();

    const newSec: SectorDefinition = {
      id: sectorId,
      name: newSectorName.trim(),
      codePrefix: code,
      description: newSectorDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddSector(newSec);
    setSelectedSector(sectorId);
    setNewSectorName('');
    setNewSectorCode('');
    setNewSectorDesc('');
    setShowAddSectorModal(false);
  };

  // Create New Element Item (1.1.1 Elemento do Setor)
  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const currentSector = sectors.find(s => s.id === newItemSectorId);
    const sectorName = currentSector ? currentSector.name : 'Geral';
    const prefix = currentSector?.codePrefix || 'ELM';

    const newItem: InspectionItem = {
      id: `elem-${Date.now()}`,
      code: newItemCode.trim().toUpperCase() || `${prefix}-${Math.floor(10 + Math.random() * 90)}`,
      sectorId: newItemSectorId,
      sectorName: sectorName,
      elementName: newItemElementName.trim() || 'Elemento de Campo',
      categoryId: newItemSectorId,
      categoryName: sectorName,
      title: newItemTitle,
      standardReference: newItemStandard || 'ABNT NBR 9050:2020',
      standardRequirement: newItemReq || 'Conforme especificado em projeto executivo e normas de acessibilidade.',
      status: 'pendente',
      criticality: 'Médio',
      priorityGUT: 3,
      suggestedDeadlineDays: 60,
      updatedAt: new Date().toISOString(),
    };

    onAddItem(newItem);
    setNewItemTitle('');
    setNewItemCode('');
    setNewItemElementName('');
    setNewItemReq('');
    setShowAddItemModal(false);
    setExpandedItemId(newItem.id);
  };

  // Filtering
  const filteredItems = items.filter(item => {
    // Sector filter
    const itemSector = item.sectorId || item.categoryId;
    if (selectedSector !== 'todos' && itemSector !== selectedSector) {
      return false;
    }

    // Status filter
    if (statusFilter === 'conforme' && item.status !== 'conforme') return false;
    if (statusFilter === 'nao_conforme' && item.status !== 'nao_conforme') return false;
    if (statusFilter === 'pendente' && item.status !== 'pendente') return false;
    if (statusFilter === 'nao_se_aplica' && item.status !== 'nao_se_aplica') return false;
    if (statusFilter === 'criticos' && (item.status !== 'nao_conforme' || item.criticality !== 'Crítico')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${item.code} ${item.title} ${item.sectorName || ''} ${item.elementName || ''} ${item.standardReference} ${item.location || ''} ${item.fieldNotes || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  // Grouped items by Element (1.1.1 Elementos do Setor)
  const groupedItems = useMemo(() => {
    if (!groupByElement) {
      return [{ elementKey: 'all', elementName: '', items: filteredItems }];
    }

    const map = new Map<string, InspectionItem[]>();
    for (const item of filteredItems) {
      const key = item.elementName?.trim() || 'Elemento Geral';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }

    const groups: { elementKey: string; elementName: string; items: InspectionItem[] }[] = [];
    map.forEach((grpItems, key) => {
      groups.push({
        elementKey: key,
        elementName: key,
        items: grpItems,
      });
    });

    return groups;
  }, [filteredItems, groupByElement]);

  const activeSectorObj = sectors.find(s => s.id === selectedSector);

  return (
    <div className="space-y-5">
      {/* 1. EDIFICAÇÃO (Informações Gerais & Classificação Decreto nº 5.296/2004) */}
      {building && (
        <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/90 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>1. Edificação</span>
              </span>
              <h2 className="text-base font-bold text-neutral-900">
                {building.name}
              </h2>
              {building.tradeName && (
                <span className="text-xs text-neutral-500 font-normal">
                  ({building.tradeName})
                </span>
              )}
            </div>

            {onEditBuilding && (
              <button
                onClick={onEditBuilding}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                title="Editar informações gerais da edificação, classificação e gerenciar setores"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Edificação &amp; Setores (1 e 1.1)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
            {/* Classificação com definição Decreto 5.296/2004 */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-md space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Classificação (Decreto Federal nº 5.296/2004, Art. 8º):</span>
              </div>
              <div className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>
                  {building.classification === 'uso_publico' ? 'Edificação de Uso Público' : 'Edificação de Uso Coletivo'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-snug text-justify">
                {building.classification === 'uso_publico'
                  ? 'Aquelas administradas por entidades da administração pública, direta e indireta, ou por empresas prestadoras de serviços públicos e destinadas ao público em geral.'
                  : 'Aquelas destinadas às atividades de natureza comercial, hoteleira, cultural, esportiva, financeira, turística, recreativa, social, religiosa, educacional, industrial e de saúde, inclusive as edificações de prestação de serviços de atividades da mesma natureza.'}
              </p>
            </div>

            {/* Localização & Tipologia */}
            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-md space-y-1">
              <div className="text-neutral-500 font-medium text-[11px]">Localização &amp; Tipologia:</div>
              <div className="font-semibold text-neutral-900 leading-tight">
                {building.address}, {building.city} - {building.state}
              </div>
              <div className="text-neutral-600 text-[11px] pt-1">
                Tipologia: <strong className="text-neutral-800">{building.type}</strong> · Área: <strong className="text-neutral-800">{building.constructedArea}</strong> ({building.floorsCount} pavimentos)
              </div>
              <div className="text-neutral-500 font-mono text-[10px]">CEP: {building.zipCode}</div>
            </div>

            {/* Perito & Vistoria Técnica */}
            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-md space-y-1">
              <div className="text-neutral-500 font-medium text-[11px]">Responsabilidade Técnica &amp; Vistoria:</div>
              <div className="font-semibold text-neutral-900">
                {building.technicalManager}
              </div>
              <div className="text-neutral-600 text-[11px]">
                {building.technicalCouncilId} · <span className="font-mono">{building.rrtArtNumber}</span>
              </div>
              <div className="text-neutral-600 text-[11px] pt-0.5">
                Data da Inspeção de Campo: <strong className="text-neutral-900 font-mono">{building.inspectionDate}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1.1 SETORES DA EDIFICAÇÃO & FILTROS */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/90 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-700" />
              <span>1.1 Setores da Edificação</span>
            </span>
            <span className="text-xs text-neutral-600 hidden md:inline">
              Subdivisão da inspeção por setores da edificação ({sectors.length} setores ativos)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Novo Setor (1.1) */}
            <button
              onClick={() => setShowAddSectorModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer border border-neutral-200 whitespace-nowrap"
              title="Cadastrar um novo setor na edificação (ex: Passeio Público, Garagem, Saguão, etc.)"
            >
              <FolderPlus className="w-3.5 h-3.5 text-blue-700" />
              <span>+ Novo Setor (1.1)</span>
            </button>

            {/* Botão Novo Elemento (1.1.1) */}
            <button
              onClick={() => {
                if (selectedSector !== 'todos') {
                  setNewItemSectorId(selectedSector);
                }
                setShowAddItemModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              title="Adicionar um elemento a ser vistoriado no setor (ex: piso, porta, rampa, etc.)"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Elemento (1.1.1)</span>
            </button>
          </div>
        </div>

        {/* Chips de Seleção de Setores (1.1 Setores) */}
        <div>
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Selecione o Setor para Avaliar os Elementos:</span>
            {activeSectorObj && (
              <span className="text-neutral-600 font-normal lowercase">
                setor selecionado: <strong className="text-neutral-900">{activeSectorObj.name}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs">
            {/* Opção Todos */}
            <button
              onClick={() => setSelectedSector('todos')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSector === 'todos'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <span>Todos os Setores</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedSector === 'todos' ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-700'
              }`}>
                {items.length}
              </span>
            </button>

            {/* Lista dos Setores Cadastrados */}
            {sectors.map(sec => {
              const count = items.filter(i => (i.sectorId || i.categoryId) === sec.id).length;
              const ncCount = items.filter(i => (i.sectorId || i.categoryId) === sec.id && i.status === 'nao_conforme').length;
              const isSelected = selectedSector === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSector(sec.id)}
                  className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-700 text-white font-semibold shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {sec.codePrefix && (
                    <span className={`font-mono text-[10px] px-1 rounded ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {sec.codePrefix}
                    </span>
                  )}
                  <span>{sec.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-blue-800 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {count}
                  </span>
                  {ncCount > 0 && (
                    <span
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-rose-600'}`}
                      title={`${ncCount} não conformidades registradas`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {activeSectorObj?.description && (
            <div className="text-[11px] text-neutral-500 bg-neutral-50 px-2.5 py-1 rounded border border-neutral-100 mt-1">
              <strong>Abrangência do setor:</strong> {activeSectorObj.description}
            </div>
          )}
        </div>

        {/* Barra de Filtros de Busca e Status */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-neutral-100">
          {/* Abas Segmentadas de Status */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => { setStatusFilter('todos'); onClearFilterStatus?.(); }}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'todos' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Todos ({filteredItems.length})
            </button>
            <button
              onClick={() => { setStatusFilter('nao_conforme'); onClearFilterStatus?.(); }}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'nao_conforme' ? 'bg-rose-600 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Não Conformes ({items.filter(i => (selectedSector === 'todos' || (i.sectorId || i.categoryId) === selectedSector) && i.status === 'nao_conforme').length})
            </button>
            <button
              onClick={() => { setStatusFilter('criticos'); onClearFilterStatus?.(); }}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'criticos' ? 'bg-rose-800 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Críticos ({items.filter(i => (selectedSector === 'todos' || (i.sectorId || i.categoryId) === selectedSector) && i.status === 'nao_conforme' && i.criticality === 'Crítico').length})
            </button>
            <button
              onClick={() => { setStatusFilter('conforme'); onClearFilterStatus?.(); }}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'conforme' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Conformes ({items.filter(i => (selectedSector === 'todos' || (i.sectorId || i.categoryId) === selectedSector) && i.status === 'conforme').length})
            </button>
            <button
              onClick={() => { setStatusFilter('pendente'); onClearFilterStatus?.(); }}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'pendente' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pendentes ({items.filter(i => (selectedSector === 'todos' || (i.sectorId || i.categoryId) === selectedSector) && i.status === 'pendente').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle de Agrupamento por Elemento */}
            <button
              type="button"
              onClick={() => setGroupByElement(!groupByElement)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                groupByElement
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
              title="Agrupar ou desagrupar itens por elemento do setor"
            >
              <Component className="w-3.5 h-3.5 text-blue-700" />
              <span>{groupByElement ? 'Agrupado por Elemento' : 'Lista Individual'}</span>
            </button>

            {/* Campo de Busca Rápida */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar elemento ou norma..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1.1.1 ELEMENTOS DO SETOR (Checklist & Avaliação em Campo) */}
      <div className="space-y-6">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-10 text-center">
            <div className="text-neutral-400 mb-2">Nenhum elemento de inspeção encontrado para os filtros selecionados.</div>
            <button
              onClick={() => { setStatusFilter('todos'); setSelectedSector('todos'); setSearchQuery(''); }}
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Limpar filtros e exibir todos os elementos
            </button>
          </div>
        ) : (
          groupedItems.map(group => (
            <div key={group.elementKey} className="space-y-3">
              {/* Cabeçalho do Elemento (1.1.1 Elemento do Setor) */}
              {groupByElement && group.elementName && (
                <div className="flex items-center justify-between bg-neutral-100/90 border border-neutral-200 px-3.5 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-neutral-800 bg-white border border-neutral-300 px-2 py-0.5 rounded flex items-center gap-1.5 shadow-2xs">
                      <Component className="w-3.5 h-3.5 text-blue-700" />
                      <span>1.1.1 Elemento: {group.elementName}</span>
                    </span>
                    <span className="text-xs text-neutral-600 font-medium">
                      ({group.items.length} {group.items.length === 1 ? 'parâmetro analisado' : 'parâmetros analisados'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-emerald-700 font-semibold">
                      {group.items.filter(i => i.status === 'conforme').length} conf
                    </span>
                    <span className="text-rose-700 font-bold">
                      {group.items.filter(i => i.status === 'nao_conforme').length} nc
                    </span>
                  </div>
                </div>
              )}

              {/* Itens do Elemento */}
              <div className="space-y-3">
                {group.items.map(item => {
                  const isExpanded = expandedItemId === item.id;
                  const isAiLoading = !!isAiLoadingMap[item.id];

                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white border rounded-lg transition-all shadow-xs overflow-hidden ${
                        item.status === 'nao_conforme' 
                          ? 'border-rose-200 ring-1 ring-rose-100' 
                          : item.status === 'conforme'
                          ? 'border-neutral-200'
                          : 'border-neutral-200'
                      }`}
                    >
                      {/* Linha Principal do Item */}
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Identificação Hierárquica do Elemento */}
                          <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 font-medium">
                              <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {item.code}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-blue-900 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                                <Layers className="w-3 h-3 text-blue-700" />
                                <span>Setor: {item.sectorName || item.categoryName}</span>
                              </span>
                              {item.elementName && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Component className="w-3 h-3 text-neutral-600" />
                                    <span>Elemento: {item.elementName}</span>
                                  </span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="text-neutral-500 font-medium">{item.standardReference}</span>
                            </div>

                            <h3 className="text-base font-semibold text-neutral-900 leading-snug">
                              {item.title}
                            </h3>

                            <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
                              {item.standardRequirement}
                            </p>
                          </div>

                          {/* Botões Rápidos de Status */}
                          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center lg:self-start">
                            <button
                              onClick={() => handleStatusChange(item, 'conforme')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                item.status === 'conforme'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                              title="Marcar como Conforme"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Conforme</span>
                            </button>

                            <button
                              onClick={() => handleStatusChange(item, 'nao_conforme')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                item.status === 'nao_conforme'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                              title="Marcar como Não Conforme"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Não Conforme</span>
                            </button>

                            <button
                              onClick={() => handleStatusChange(item, 'nao_se_aplica')}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                item.status === 'nao_se_aplica'
                                  ? 'bg-neutral-700 text-white'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                              title="Item não se aplica neste setor"
                            >
                              N/A
                            </button>

                            <button
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                              title={isExpanded ? 'Recolher detalhes' : 'Expandir dados de campo e laudo'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Resumo compacto quando fechado */}
                        {!isExpanded && (item.measurement || item.fieldNotes || item.location || item.photoUrl) && (
                          <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                            {item.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-neutral-400" />
                                <span className="font-medium text-neutral-700">{item.location}</span>
                              </div>
                            )}
                            {item.measurement && (
                              <div className="flex items-center gap-1">
                                <Ruler className="w-3 h-3 text-neutral-400" />
                                <span className="font-mono text-neutral-700">{item.measurement}</span>
                              </div>
                            )}
                            {item.fieldNotes && (
                              <div className="truncate max-w-md text-neutral-500">
                                {item.fieldNotes}
                              </div>
                            )}
                            {item.photoUrl && (
                              <div className="flex items-center gap-1 text-blue-600 font-medium">
                                <Camera className="w-3 h-3" />
                                <span>1 foto anexada</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Área Expandida de Coleta */}
                      {isExpanded && (
                        <div className="bg-neutral-50/70 border-t border-neutral-200 p-4 sm:p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Medições e Anotações de Campo */}
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    Setor de Localização (1.1)
                                  </label>
                                  <select
                                    value={item.sectorId || ''}
                                    onChange={e => {
                                      const sec = sectors.find(s => s.id === e.target.value);
                                      onUpdateItem({
                                        ...item,
                                        sectorId: e.target.value,
                                        sectorName: sec ? sec.name : item.sectorName,
                                        categoryId: e.target.value,
                                        categoryName: sec ? sec.name : item.categoryName,
                                      });
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-md font-medium"
                                  >
                                    {sectors.map(sec => (
                                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    Elemento do Setor (1.1.1)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: Circulação / Piso / Rampa / Porta"
                                    value={item.elementName || ''}
                                    onChange={e => onUpdateItem({ ...item, elementName: e.target.value })}
                                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-md font-medium"
                                  />
                                </div>
                              </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Ponto Específico no Setor</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Entrada lateral, corredor norte, sanitário unissex..."
                            value={item.location || ''}
                            onChange={e => onUpdateItem({ ...item, location: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                            <Ruler className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Medições Aferidas em Campo (Trena / Inclinômetro)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Medido: 0,92m de largura; inclinação transversal: 2,1%"
                            value={item.measurement || ''}
                            onChange={e => onUpdateItem({ ...item, measurement: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Anotações de Campo do Vistoriador
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Descreva o acabamento, material do piso, obstáculos, conservação..."
                            value={item.fieldNotes || ''}
                            onChange={e => onUpdateItem({ ...item, fieldNotes: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                      </div>

                      {/* Registro Fotográfico */}
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-neutral-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Evidência Fotográfica do Elemento</span>
                          </span>
                          {item.photoUrl && (
                            <button
                              type="button"
                              onClick={() => onUpdateItem({ ...item, photoUrl: undefined })}
                              className="text-xs text-rose-600 hover:underline cursor-pointer"
                            >
                              Remover foto
                            </button>
                          )}
                        </label>

                        {item.photoUrl ? (
                          <div className="relative group rounded-md overflow-hidden border border-neutral-200 bg-neutral-900 aspect-video max-h-48">
                            <img
                              src={item.photoUrl}
                              alt={`Inspeção ${item.code}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="px-3 py-1.5 text-xs font-medium bg-white text-neutral-900 rounded-md shadow-xs cursor-pointer hover:bg-neutral-100">
                                Substituir Foto
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={e => handlePhotoUpload(item, e)}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 hover:border-neutral-400 bg-white rounded-md cursor-pointer transition-colors max-h-48">
                            <Camera className="w-6 h-6 text-neutral-400 mb-1" />
                            <span className="text-xs font-semibold text-neutral-700">Tirar Foto ou Carregar Arquivo</span>
                            <span className="text-xs text-neutral-400 mt-0.5">Captura direta de câmera ou galeria</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={e => handlePhotoUpload(item, e)}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Bloco de Não Conformidade e Laudo */}
                    {item.status === 'nao_conforme' && (
                      <div className="mt-4 pt-4 border-t border-rose-200 bg-rose-50/40 rounded-lg p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                              Tratamento da Não Conformidade para o Laudo
                            </span>
                          </div>

                          <button
                            onClick={() => handleAiDiagnosis(item)}
                            disabled={isAiLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-md border border-blue-300 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isAiLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Elaborando Parecer...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                                <span>Gerar Parecer com IA</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                              Grau de Criticidade
                            </label>
                            <select
                              value={item.criticality || 'Médio'}
                              onChange={e => onUpdateItem({ ...item, criticality: e.target.value as CriticalityLevel })}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-md font-medium"
                            >
                              <option value="Crítico">Crítico (Risco de acidente / Bloqueio total)</option>
                              <option value="Médio">Médio (Perda parcial de autonomia)</option>
                              <option value="Baixo">Baixo (Irregularidade leve / estética)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                              Prioridade GUT (Gravidade x Urgência)
                            </label>
                            <select
                              value={item.priorityGUT || 3}
                              onChange={e => onUpdateItem({ ...item, priorityGUT: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-md font-mono"
                            >
                              <option value={5}>Nível 5 - Imediata (Até 30 dias)</option>
                              <option value={4}>Nível 4 - Alta (Até 60 dias)</option>
                              <option value={3}>Nível 3 - Média (Até 90 dias)</option>
                              <option value={2}>Nível 2 - Moderada (Até 120 dias)</option>
                              <option value={1}>Nível 1 - Baixa (Até 180 dias)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                              Prazo Sugerido
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={15}
                                step={15}
                                value={item.suggestedDeadlineDays || 60}
                                onChange={e => onUpdateItem({ ...item, suggestedDeadlineDays: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-neutral-300 rounded-md"
                              />
                              <span className="text-xs text-neutral-500 whitespace-nowrap">dias</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1">
                            Diagnóstico Pericial (Texto oficial para o Laudo)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Descreva formalmente a infração à norma, os riscos e as cotas desatendidas..."
                            value={item.technicalDiagnosis || ''}
                            onChange={e => onUpdateItem({ ...item, technicalDiagnosis: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed font-sans"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1">
                            Recomendação Técnica de Intervenção (Plano de Ação)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Especifique a obra, intervenção ou equipamento necessário..."
                            value={item.technicalRecommendation || ''}
                            onChange={e => onUpdateItem({ ...item, technicalRecommendation: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed font-sans"
                          />
                        </div>
                      </div>
                    )}

                    {/* Ações do Rodapé */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-xs">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="flex items-center gap-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Excluir este ponto do checklist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Ponto</span>
                      </button>

                      <button
                        onClick={() => setExpandedItemId(null)}
                        className="px-3 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded font-medium transition-colors cursor-pointer"
                      >
                        Salvar e Concluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))
  )}
</div>

      {/* Modal: Cadastrar Novo Setor (1.1 Setores) */}
      {showAddSectorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
              <FolderPlus className="w-5 h-5 text-blue-700" />
              <h3 className="text-base font-bold text-neutral-900">
                Cadastrar Novo Setor na Edificação (1.1)
              </h3>
            </div>

            <form onSubmit={handleCreateSector} className="space-y-3.5 text-xs">
              {/* Sugestões Rápidas de Setores Pré-estabelecidos */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1.5 text-[11px]">
                  Sugestões de Setores Pré-estabelecidos:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PREESTABLISHED_SECTORS.map(pre => {
                    const isAlreadyAdded = sectors.some(
                      s => s.id === pre.id || s.name.toLowerCase() === pre.name.toLowerCase()
                    );
                    return (
                      <button
                        key={pre.id}
                        type="button"
                        onClick={() => {
                          setNewSectorName(pre.name);
                          setNewSectorCode(pre.codePrefix || '');
                          setNewSectorDesc(pre.description || '');
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isAlreadyAdded
                            ? 'bg-neutral-50 border-neutral-200 text-neutral-400'
                            : 'bg-white border-neutral-300 text-neutral-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50/50'
                        }`}
                        title={pre.description}
                      >
                        + {pre.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nome do Setor
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Passeio Público, Garagem G2, Hall dos Elevadores..."
                  value={newSectorName}
                  onChange={e => setNewSectorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Prefixo de Código (Sigla)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Ex: PAS, GAR, HAL"
                  value={newSectorCode}
                  onChange={e => setNewSectorCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Descrição / Abrangência
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Abrange a calçada pública, rebaixo de meio-fio e faixa de pedestres..."
                  value={newSectorDesc}
                  onChange={e => setNewSectorDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddSectorModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs cursor-pointer"
                >
                  Criar Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Novo Elemento do Setor (1.1.1 Elementos) */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
              <Component className="w-5 h-5 text-blue-700" />
              <h3 className="text-base font-bold text-neutral-900">
                Novo Elemento a Inspecionar no Setor (1.1.1)
              </h3>
            </div>

            <form onSubmit={handleCreateCustomItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Setor de Destino (1.1)
                  </label>
                  <select
                    value={newItemSectorId}
                    onChange={e => setNewItemSectorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md font-medium"
                  >
                    {sectors.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Elemento Analisado (1.1.1)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Circulação, Piso, Rampa, Porta..."
                    value={newItemElementName}
                    onChange={e => setNewItemElementName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['Circulação', 'Piso', 'Rampa', 'Porta', 'Sanitário', 'Vaga PCD', 'Corrimão', 'Sinalização'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setNewItemElementName(chip)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Código do Elemento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CIR-04, PAS-03"
                    value={newItemCode}
                    onChange={e => setNewItemCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-neutral-50 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Norma Técnica de Referência
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: ABNT NBR 9050:2020 item 6.12"
                    value={newItemStandard}
                    onChange={e => setNewItemStandard(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Título / Critério de Avaliação
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Material do piso - regularidade e coeficiente de atrito"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Requisito / Parâmetro Normativo Exigido
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: O piso deve ser firme, estável, plano, antiderrapante sob qualquer condição, com declividade transversal máxima de 2%..."
                  value={newItemReq}
                  onChange={e => setNewItemReq(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs cursor-pointer"
                >
                  Salvar Elemento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
