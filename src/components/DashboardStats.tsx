import React from 'react';
import { InspectionItem } from '../types/inspection';
import { AlertTriangle, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';

interface DashboardStatsProps {
  items: InspectionItem[];
  onFilterStatus?: (status: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ items, onFilterStatus }) => {
  const total = items.length;
  const conformes = items.filter(i => i.status === 'conforme').length;
  const naoConformes = items.filter(i => i.status === 'nao_conforme').length;
  const pendentes = items.filter(i => i.status === 'pendente').length;
  const naoSeAplica = items.filter(i => i.status === 'nao_se_aplica').length;

  const validItems = total - naoSeAplica;
  const rate = validItems > 0 ? Math.round((conformes / validItems) * 100) : 0;

  const criticos = items.filter(i => i.status === 'nao_conforme' && i.criticality === 'Crítico').length;
  const medios = items.filter(i => i.status === 'nao_conforme' && i.criticality === 'Médio').length;
  const baixos = items.filter(i => i.status === 'nao_conforme' && i.criticality === 'Baixo').length;

  let classification = 'Acessibilidade Plena';
  let classificationColor = 'text-emerald-700';
  if (rate < 50 || criticos >= 4) {
    classification = 'Condição Crítica / Inacessível';
    classificationColor = 'text-rose-700';
  } else if (rate < 85 || criticos > 0) {
    classification = 'Acessibilidade Parcial';
    classificationColor = 'text-amber-700';
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-1">
            Status da Inspeção Predial · NBR 9050 & NBR 16537
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Índice de Conformidade Global
            </h2>
            <span className={`text-sm font-semibold ${classificationColor}`}>
              ({classification})
            </span>
          </div>
        </div>

        {/* Barra de progresso visual */}
        <div className="flex flex-col gap-1.5 w-full lg:w-72">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Aderência Normativa</span>
            <span className="font-mono font-bold tabular-nums text-neutral-900">{rate}%</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-600 h-full transition-all duration-500" 
              style={{ width: `${rate}%` }} 
              title={`Conforme: ${rate}%`}
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${validItems > 0 ? (naoConformes / validItems) * 100 : 0}%` }} 
              title={`Não Conforme: ${validItems > 0 ? Math.round((naoConformes / validItems) * 100) : 0}%`}
            />
            <div 
              className="bg-amber-400 h-full transition-all duration-500" 
              style={{ width: `${validItems > 0 ? (pendentes / validItems) * 100 : 0}%` }} 
              title={`Pendente: ${validItems > 0 ? Math.round((pendentes / validItems) * 100) : 0}%`}
            />
          </div>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
        {/* Total Inspecionado */}
        <button
          onClick={() => onFilterStatus?.('todos')}
          className="text-left p-3 rounded-md hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200 cursor-pointer"
        >
          <div className="text-xs text-neutral-500 font-medium">Total de Itens</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {total}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">Catálogo NBR</div>
        </button>

        {/* Conformes */}
        <button
          onClick={() => onFilterStatus?.('conforme')}
          className="text-left p-3 rounded-md hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Conformes</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
            {conformes}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {validItems > 0 ? `${Math.round((conformes / validItems) * 100)}% atendido` : '0%'}
          </div>
        </button>

        {/* Não Conformes */}
        <button
          onClick={() => onFilterStatus?.('nao_conforme')}
          className="text-left p-3 rounded-md hover:bg-rose-50/50 transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            <span>Não Conformes</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-800 mt-1">
            {naoConformes}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            Exigem intervenção
          </div>
        </button>

        {/* Pendentes */}
        <button
          onClick={() => onFilterStatus?.('pendente')}
          className="text-left p-3 rounded-md hover:bg-amber-50/50 transition-colors border border-transparent hover:border-amber-200 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendentes</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-800 mt-1">
            {pendentes}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">Aguardando medição</div>
        </button>

        {/* Risco Crítico */}
        <button
          onClick={() => onFilterStatus?.('criticos')}
          className="col-span-2 sm:col-span-4 lg:col-span-1 text-left p-3 rounded-md bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Grau de Risco</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-700">
              {criticos}
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              críticos · {medios} méd · {baixos} bx
            </span>
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">Matriz de Prioridade</div>
        </button>
      </div>
    </div>
  );
};
