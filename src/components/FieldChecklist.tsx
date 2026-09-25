import React, { useState } from 'react';
import { InspectionItem, InspectionStatus, CriticalityLevel } from '../types/inspection';
import { CHECKLIST_CATEGORIES } from '../data/defaultChecklist';
import { 
  Search, 
  Filter, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  MapPin,
  Ruler,
  Clock,
  Loader2
} from 'lucide-react';

interface FieldChecklistProps {
  items: InspectionItem[];
  onUpdateItem: (item: InspectionItem) => void;
  onAddItem: (item: InspectionItem) => void;
  onDeleteItem: (id: string) => void;
  selectedFilterStatus?: string;
  onClearFilterStatus?: () => void;
}

export const FieldChecklist: React.FC<FieldChecklistProps> = ({
  items,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  selectedFilterStatus = 'todos',
  onClearFilterStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(selectedFilterStatus);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isAiLoadingMap, setIsAiLoadingMap] = useState<Record<string, boolean>>({});
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);

  // New Item State
  const [newItemCategory, setNewItemCategory] = useState(CHECKLIST_CATEGORIES[0].id);
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
          category: item.categoryName,
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
      // Fallback local pericial template if network fails
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

  // Create Custom Item
  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const cat = CHECKLIST_CATEGORIES.find(c => c.id === newItemCategory);
    const newItem: InspectionItem = {
      id: `custom-${Date.now()}`,
      code: newItemCode.trim() || `GEN-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: newItemCategory,
      categoryName: cat?.name || 'Geral',
      title: newItemTitle,
      standardReference: newItemStandard || 'ABNT NBR 9050:2020',
      standardRequirement: newItemReq || 'Conforme especificado em projeto executivo de acessibilidade.',
      status: 'pendente',
      criticality: 'Médio',
      priorityGUT: 3,
      suggestedDeadlineDays: 60,
      updatedAt: new Date().toISOString(),
    };

    onAddItem(newItem);
    setNewItemTitle('');
    setNewItemCode('');
    setNewItemReq('');
    setShowAddItemModal(false);
    setExpandedItemId(newItem.id);
  };

  // Filtering
  const filteredItems = items.filter(item => {
    // Category filter
    if (selectedCategory !== 'todos' && item.categoryId !== selectedCategory) {
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
      const matchText = `${item.code} ${item.title} ${item.standardReference} ${item.location || ''} ${item.fieldNotes || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controles de Filtros e Busca */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por código (ex: RAM-01), termo, norma ou local..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Botão Novo Item */}
          <button
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Ponto de Inspeção</span>
          </button>
        </div>

        {/* Barra de Filtros Segmentados */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-neutral-100">
          {/* Categorias / Setores */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-medium text-neutral-500 shrink-0">Setor:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="todos">Todos os Setores ({items.length})</option>
              {CHECKLIST_CATEGORIES.map(cat => {
                const count = items.filter(i => i.categoryId === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium overflow-x-auto">
            <button
              onClick={() => { setStatusFilter('todos'); onClearFilterStatus?.(); }}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'todos' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => { setStatusFilter('nao_conforme'); onClearFilterStatus?.(); }}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'nao_conforme' ? 'bg-white text-rose-700 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Não Conformes ({items.filter(i => i.status === 'nao_conforme').length})
            </button>
            <button
              onClick={() => { setStatusFilter('criticos'); onClearFilterStatus?.(); }}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'criticos' ? 'bg-white text-rose-800 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Críticos ({items.filter(i => i.status === 'nao_conforme' && i.criticality === 'Crítico').length})
            </button>
            <button
              onClick={() => { setStatusFilter('conforme'); onClearFilterStatus?.(); }}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'conforme' ? 'bg-white text-emerald-700 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Conformes ({items.filter(i => i.status === 'conforme').length})
            </button>
            <button
              onClick={() => { setStatusFilter('pendente'); onClearFilterStatus?.(); }}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'pendente' ? 'bg-white text-amber-700 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pendentes ({items.filter(i => i.status === 'pendente').length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Itens do Checklist */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-10 text-center">
            <div className="text-neutral-400 mb-2">Nenhum ponto de inspeção encontrado para os filtros selecionados.</div>
            <button
              onClick={() => { setStatusFilter('todos'); setSelectedCategory('todos'); setSearchQuery(''); }}
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Limpar filtros e exibir todos os itens
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
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
                    {/* Identificação e Descrição */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 font-medium">
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.categoryName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-blue-700 font-medium">{item.standardReference}</span>
                      </div>

                      <h3 className="text-base font-semibold text-neutral-900 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
                        {item.standardRequirement}
                      </p>
                    </div>

                    {/* Botões Rápidos de Status (Conforme / Não Conforme / N.A. / Pendente) */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center lg:self-start">
                      <button
                        onClick={() => handleStatusChange(item, 'conforme')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          item.status === 'conforme'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="Marcar como Conforme à norma"
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
                        title="Marcar como Não Conforme (Gera apontamento no Laudo)"
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
                        title="Item não se aplica a este imóvel"
                      >
                        N/A
                      </button>

                      <button
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                        title={isExpanded ? 'Recolher detalhes de campo' : 'Expandir anotações e fotos de campo'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Resumo compacto de campo quando fechado */}
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

                {/* Área Expandida de Coleta de Campo & Laudo */}
                {isExpanded && (
                  <div className="bg-neutral-50/70 border-t border-neutral-200 p-4 sm:p-5 space-y-4">
                    {/* Campos de Coleta Rápida */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Medição de Campo e Local */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Localização no Imóvel</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Rampa externa do pórtico principal / Sanitário térreo"
                            value={item.location || ''}
                            onChange={e => onUpdateItem({ ...item, location: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                            <Ruler className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Medições Aferidas em Campo (Trena / Inclinômetro / Luxímetro)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Declividade medida: 11,4% / Vão livre medido: 74cm"
                            value={item.measurement || ''}
                            onChange={e => onUpdateItem({ ...item, measurement: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            Anotações Rápidas do Vistoriador
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Descreva o estado de conservação, acabamento, interferências ou observações visuais..."
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
                            <span>Evidência Fotográfica de Campo</span>
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
                              alt={`Inspeção ${item.code} - ${item.title}`}
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

                    {/* Bloco Específico de Não Conformidade & Laudo Técnico */}
                    {item.status === 'nao_conforme' && (
                      <div className="mt-4 pt-4 border-t border-rose-200 bg-rose-50/40 rounded-lg p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                              Tratamento da Não Conformidade para o Laudo
                            </span>
                          </div>

                          {/* Botão de Especialista IA */}
                          <button
                            onClick={() => handleAiDiagnosis(item)}
                            disabled={isAiLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-md border border-blue-300 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isAiLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Elaborando Parecer NBR 9050...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                                <span>Gerar Parecer Técnico com IA</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Parâmetros de Criticidade e Matriz GUT */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                              Grau de Criticidade (NBR 16747)
                            </label>
                            <select
                              value={item.criticality || 'Médio'}
                              onChange={e => onUpdateItem({ ...item, criticality: e.target.value as CriticalityLevel })}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-md font-medium"
                            >
                              <option value="Crítico">Crítico (Risco à vida / Bloqueio total)</option>
                              <option value="Médio">Médio (Perda parcial de autonomia)</option>
                              <option value="Baixo">Baixo (Irregularidade estética / menor)</option>
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
                              Prazo Sugerido para Adequação
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
                              <span className="text-xs text-neutral-500 whitespace-nowrap">dias corridos</span>
                            </div>
                          </div>
                        </div>

                        {/* Diagnóstico Pericial Formatado */}
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1 flex items-center justify-between">
                            <span>Diagnóstico Pericial (Texto oficial para o Laudo)</span>
                            <span className="text-xs font-normal text-neutral-500">Fundamentação técnica</span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Descreva formalmente a infração à norma, os riscos aos usuários com deficiência e as cotas desatendidas..."
                            value={item.technicalDiagnosis || ''}
                            onChange={e => onUpdateItem({ ...item, technicalDiagnosis: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed font-sans"
                          />
                        </div>

                        {/* Recomendação de Projeto / Intervenção */}
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1 flex items-center justify-between">
                            <span>Recomendação Técnica de Intervenção (Plano de Ação)</span>
                            <span className="text-xs font-normal text-neutral-500">Solução executiva arquitetônica</span>
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Especifique a obra, intervenção ou equipamento necessário para sanar a irregularidade..."
                            value={item.technicalRecommendation || ''}
                            onChange={e => onUpdateItem({ ...item, technicalRecommendation: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed font-sans"
                          />
                        </div>
                      </div>
                    )}

                    {/* Ações do Rodapé do Item */}
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
                        Salvar e Concluir Ponto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Adicionar Novo Ponto de Inspeção */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Adicionar Ponto de Inspeção Customizado
            </h3>

            <form onSubmit={handleCreateCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Setor / Categoria
                </label>
                <select
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md"
                >
                  {CHECKLIST_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Código Identificador
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CAL-04, PVE-01"
                    value={newItemCode}
                    onChange={e => setNewItemCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-neutral-50 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Norma Técnica
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: ABNT NBR 9050:2020"
                    value={newItemStandard}
                    onChange={e => setNewItemStandard(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Título do Ponto de Inspeção
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corrimãos intermediários em escadas largas"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Requisito / Parâmetro Normativo
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Escadas com largura igual ou superior a 2,40m devem possuir corrimão intermediário..."
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
                  Salvar Ponto de Inspeção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
