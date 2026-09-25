import React from 'react';
import { InspectionProject } from '../types/inspection';
import { 
  Building2, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle, 
  FileText, 
  Scale, 
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';

interface ExecutiveReportProps {
  project: InspectionProject;
  onPrint: () => void;
}

export const ExecutiveReport: React.FC<ExecutiveReportProps> = ({ project, onPrint }) => {
  const { building, items, laudoSummary } = project;

  const total = items.length;
  const conformes = items.filter(i => i.status === 'conforme').length;
  const naoConformes = items.filter(i => i.status === 'nao_conforme');
  const na = items.filter(i => i.status === 'nao_se_aplica').length;
  const valid = total - na;
  const rate = valid > 0 ? Math.round((conformes / valid) * 100) : 0;

  const criticos = naoConformes.filter(i => i.criticality === 'Crítico');
  const medios = naoConformes.filter(i => i.criticality === 'Médio');
  const baixos = naoConformes.filter(i => i.criticality === 'Baixo');

  // Categorias
  const categories = Array.from(new Set(items.map(i => i.categoryId))).map(catId => {
    const catItems = items.filter(i => i.categoryId === catId);
    const catName = catItems[0]?.categoryName || catId;
    const catConf = catItems.filter(i => i.status === 'conforme').length;
    const catTotal = catItems.filter(i => i.status !== 'nao_se_aplica').length;
    const catRate = catTotal > 0 ? Math.round((catConf / catTotal) * 100) : 0;
    return { id: catId, name: catName, rate: catRate, total: catTotal, conf: catConf };
  });

  return (
    <div className="space-y-6">
      {/* Banner Superior Executivo */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-1">
              Relatório Gerencial Sintético para Gestores & Conselho
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Panorama de Acessibilidade Predial
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-semibold text-neutral-800">{building.name}</span>
              <span aria-hidden="true">·</span>
              <span>{building.city} - {building.state}</span>
              <span aria-hidden="true">·</span>
              <span>Vistoria: {building.inspectionDate}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 bg-neutral-50 px-4 py-3 rounded-lg border border-neutral-200">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase">Índice Geral</div>
              <div className="text-3xl font-extrabold font-mono text-neutral-900 tabular-nums">
                {rate}%
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico em 3 Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Classificação Legal
            </div>
            <div className="text-base font-bold text-neutral-900">
              {laudoSummary?.classification || (rate >= 80 ? 'Acessibilidade Parcial Adequada' : 'Acessibilidade com Restrições Críticas')}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed text-justify">
              Conforme exigências da Lei Brasileira de Inclusão (Lei 13.146/2015) e Decreto 5.296/2004 para edificações coletivas.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Exposição a Riscos Jurídicos
            </div>
            <div className="text-base font-bold text-rose-700">
              {criticos.length > 0 ? `${criticos.length} Pontos de Risco Iminente` : 'Baixa Exposição a Autuações'}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed text-justify">
              Itens críticos em rampas e sanitários podem gerar notificações perante Ministério Público, Procon e órgãos municipais de fiscalização.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Plano de Investimento
            </div>
            <div className="text-base font-bold text-neutral-900">
              {naoConformes.length} Intervenções Físicas
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed text-justify">
              Adequações recomendadas divididas em curto prazo (30 a 60 dias) e médio prazo (90 a 180 dias) com prioridade GUT.
            </p>
          </div>
        </div>
      </div>

      {/* Radar de Conformidade por Setores */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
          Aderência Normativa por Setor da Edificação
        </h3>

        <div className="space-y-3 pt-2">
          {categories.map(cat => (
            <div key={cat.id} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-neutral-800">{cat.name}</span>
                <span className="font-mono font-bold tabular-nums text-neutral-900">
                  {cat.rate}% ({cat.conf}/{cat.total} conformes)
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    cat.rate >= 80 ? 'bg-emerald-600' : cat.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${cat.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendações Estratégicas para a Administração */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
          Diretrizes Estratégicas Recomendadas pelo Perito
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-900 block text-sm">
              Fase 1 · Urgência Imediata (30 a 60 dias)
            </span>
            <ul className="list-disc list-inside space-y-1 text-neutral-700">
              <li>Regularização da declividade da rampa principal ou instalação de plataforma.</li>
              <li>Ajuste das barras de apoio e instalação de botão de socorro nos sanitários PCD.</li>
              <li>Piso tátil de alerta no topo das escadas com contraste visual adequado.</li>
            </ul>
          </div>

          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-900 block text-sm">
              Fase 2 · Complementação & Sinalização (90 a 180 dias)
            </span>
            <ul className="list-disc list-inside space-y-1 text-neutral-700">
              <li>Instalação de placas com relevo e Braille nas paredes adjacentes às portas.</li>
              <li>Ampliação das faixas de transferência das vagas reservadas para 1,20m.</li>
              <li>Adequação de desníveis em soleiras com cunhas chanfradas de alumínio.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
