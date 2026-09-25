import React, { useState } from 'react';
import { InspectionItem, CriticalityLevel } from '../types/inspection';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Filter, 
  ChevronRight,
  Calendar,
  Layers,
  Wrench,
  Check
} from 'lucide-react';

interface PlanoDeAcaoProps {
  items: InspectionItem[];
  onUpdateItem: (item: InspectionItem) => void;
  buildingName: string;
}

export const PlanoDeAcao: React.FC<PlanoDeAcaoProps> = ({
  items,
  onUpdateItem,
  buildingName,
}) => {
  const [filterCriticality, setFilterCriticality] = useState<string>('todos');
  const [actionStatuses, setActionStatuses] = useState<Record<string, 'nao_iniciado' | 'em_andamento' | 'concluido'>>({});

  const nonConformItems = items.filter(i => i.status === 'nao_conforme');

  // Sort by GUT / Criticality
  const sortedItems = [...nonConformItems].sort((a, b) => {
    const gutA = a.priorityGUT || 3;
    const gutB = b.priorityGUT || 3;
    return gutB - gutA;
  });

  const filteredItems = sortedItems.filter(item => {
    if (filterCriticality === 'todos') return true;
    return item.criticality === filterCriticality;
  });

  const handleStatusToggle = (id: string, status: 'nao_iniciado' | 'em_andamento' | 'concluido') => {
    setActionStatuses(prev => ({
      ...prev,
      [id]: status,
    }));
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Código', 'Elemento', 'Setor', 'Não Conformidade', 'Intervenção Recomendada', 'Criticidade', 'Prioridade GUT', 'Prazo (dias)', 'Status de Obra'];
    const rows = filteredItems.map(i => [
      `"${i.code}"`,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.categoryName}"`,
      `"${(i.technicalDiagnosis || i.fieldNotes || '').replace(/"/g, '""')}"`,
      `"${(i.technicalRecommendation || '').replace(/"/g, '""')}"`,
      `"${i.criticality || 'Médio'}"`,
      i.priorityGUT || 3,
      i.suggestedDeadlineDays || 60,
      `"${actionStatuses[i.id] || 'nao_iniciado'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Plano_de_Acao_Acessibilidade_${buildingName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalActions = nonConformItems.length;
  const concluidasCount = Object.values(actionStatuses).filter(s => s === 'concluido').length;
  const emAndamentoCount = Object.values(actionStatuses).filter(s => s === 'em_andamento').length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Plano de Ação */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-1">
              Engenharia & Facilities · Matriz de Intervenções
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Plano de Ação Corretiva e Adequação ABNT NBR 9050
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Cronograma físico de obras priorizado pela metodologia GUT (Gravidade x Urgência x Tendência).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Planilha (CSV)</span>
            </button>
          </div>
        </div>

        {/* Barra de Progresso de Execução */}
        <div className="mt-5 pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200">
            <div className="text-neutral-500 font-medium">Ações Corretivas Totais</div>
            <div className="text-xl font-bold font-mono text-neutral-900 mt-1">{totalActions}</div>
            <div className="text-neutral-400 text-[11px] mt-0.5">Apontadas na vistoria pericial</div>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-md border border-amber-200">
            <div className="text-amber-800 font-medium">Em Andamento / Projeto</div>
            <div className="text-xl font-bold font-mono text-amber-900 mt-1">{emAndamentoCount}</div>
            <div className="text-amber-700 text-[11px] mt-0.5">Em cotação ou execução</div>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-md border border-emerald-200">
            <div className="text-emerald-800 font-medium">Concluídas / Regularizadas</div>
            <div className="text-xl font-bold font-mono text-emerald-900 mt-1">{concluidasCount}</div>
            <div className="text-emerald-700 text-[11px] mt-0.5">
              {totalActions > 0 ? `${Math.round((concluidasCount / totalActions) * 100)}% das pendências` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Interativa de Ações */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        {/* Barra de Filtro de Criticidade */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Filtrar por Grau de Risco:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterCriticality('todos')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterCriticality === 'todos' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Todas ({nonConformItems.length})
              </button>
              <button
                onClick={() => setFilterCriticality('Crítico')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterCriticality === 'Crítico' ? 'bg-rose-700 text-white font-semibold' : 'text-rose-700 hover:bg-rose-100'
                }`}
              >
                Críticas ({nonConformItems.filter(i => i.criticality === 'Crítico').length})
              </button>
              <button
                onClick={() => setFilterCriticality('Médio')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterCriticality === 'Médio' ? 'bg-amber-700 text-white font-semibold' : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                Médias ({nonConformItems.filter(i => i.criticality === 'Médio').length})
              </button>
            </div>
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            {filteredItems.length} intervenções listadas
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhuma ação cadastrada para este filtro.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredItems.map(item => {
              const currentStatus = actionStatuses[item.id] || 'nao_iniciado';

              return (
                <div key={item.id} className="p-4 sm:p-5 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Descrição e Medidas */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className={`font-semibold ${
                          item.criticality === 'Crítico' ? 'text-rose-700' : 'text-amber-700'
                        }`}>
                          Criticidade {item.criticality}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span className="text-neutral-600 font-medium">{item.categoryName}</span>
                        {item.location && (
                          <>
                            <span aria-hidden="true" className="text-neutral-300">·</span>
                            <span className="text-neutral-500">{item.location}</span>
                          </>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-neutral-900">
                        {item.title}
                      </h4>

                      <div className="text-xs text-neutral-700 bg-neutral-50 p-2.5 rounded border border-neutral-200 space-y-1">
                        <div>
                          <strong className="text-neutral-900">Não Conformidade: </strong>
                          <span>{item.technicalDiagnosis || item.fieldNotes || 'Irregularidade detectada'}</span>
                        </div>
                        <div>
                          <strong className="text-blue-900">Intervenção Arquitetônica: </strong>
                          <span className="font-medium text-neutral-900">{item.technicalRecommendation || 'Adequação física conforme NBR 9050'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Controles de Prazo e Status de Obra */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
                      <div className="text-right text-xs font-mono space-y-0.5">
                        <div className="text-neutral-500">Prazo Recomendado:</div>
                        <div className="text-sm font-bold text-neutral-900">
                          {item.suggestedDeadlineDays || 60} dias
                        </div>
                      </div>

                      {/* Seletor de Estado de Execução */}
                      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-md text-xs font-medium">
                        <button
                          onClick={() => handleStatusToggle(item.id, 'nao_iniciado')}
                          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            currentStatus === 'nao_iniciado'
                              ? 'bg-white text-neutral-900 font-bold shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          Pendente
                        </button>
                        <button
                          onClick={() => handleStatusToggle(item.id, 'em_andamento')}
                          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            currentStatus === 'em_andamento'
                              ? 'bg-amber-500 text-white font-bold shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          Em Obra
                        </button>
                        <button
                          onClick={() => handleStatusToggle(item.id, 'concluido')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            currentStatus === 'concluido'
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Concluído</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
