import React, { useState } from 'react';
import { InspectionProject, InspectionItem } from '../types/inspection';
import { 
  Printer, 
  Sparkles, 
  FileCheck, 
  Building, 
  MapPin, 
  UserCheck, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Scale, 
  ShieldCheck, 
  Loader2, 
  ChevronRight 
} from 'lucide-react';

interface LaudoTecnicoProps {
  project: InspectionProject;
  onUpdateProject: (updated: InspectionProject) => void;
  onPrint: () => void;
  onEditBuilding: () => void;
}

export const LaudoTecnico: React.FC<LaudoTecnicoProps> = ({
  project,
  onUpdateProject,
  onPrint,
  onEditBuilding,
}) => {
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const { building, items, laudoSummary } = project;

  // Calculos
  const totalItems = items.length;
  const conformes = items.filter(i => i.status === 'conforme').length;
  const naoConformes = items.filter(i => i.status === 'nao_conforme');
  const pendentes = items.filter(i => i.status === 'pendente').length;
  const naoSeAplica = items.filter(i => i.status === 'nao_se_aplica').length;
  const validTotal = totalItems - naoSeAplica;
  const complianceRate = validTotal > 0 ? Math.round((conformes / validTotal) * 100) : 0;

  // Agrupamento por setor (1.1 Setores)
  const categories = Array.from(new Set(items.map(i => i.sectorId || i.categoryId || 'geral'))).map(sectorId => {
    const catItems = items.filter(i => (i.sectorId || i.categoryId) === sectorId);
    const catName = catItems[0]?.sectorName || catItems[0]?.categoryName || sectorId;
    const catConf = catItems.filter(i => i.status === 'conforme').length;
    const catNc = catItems.filter(i => i.status === 'nao_conforme').length;
    const catValid = catItems.length - catItems.filter(i => i.status === 'nao_se_aplica').length;
    const catRate = catValid > 0 ? Math.round((catConf / catValid) * 100) : 0;
    return { id: sectorId, name: catName, total: catItems.length, conf: catConf, nc: catNc, rate: catRate };
  });

  // Regenerar Resumo com IA
  const handleRegenerateSummary = async () => {
    try {
      setIsAiGenerating(true);
      const res = await fetch('/api/gemini/laudo-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingName: building.name,
          address: building.address,
          buildingType: building.type,
          totalItems,
          conformItems: conformes,
          nonConformItems: naoConformes.length,
          naItems: naoSeAplica,
          nonConformities: naoConformes.map(i => ({
            code: i.code,
            title: i.title,
            measurement: i.measurement,
            notes: i.fieldNotes,
            criticality: i.criticality,
            diagnosis: i.technicalDiagnosis,
          })),
        }),
      });

      if (!res.ok) throw new Error('Falha na resposta');
      const data = await res.json();

      if (data.success) {
        onUpdateProject({
          ...project,
          laudoSummary: {
            executiveSummary: data.executiveSummary,
            classification: data.classification,
            generalRecommendations: data.generalRecommendations || [],
            technicalConclusion: data.technicalConclusion,
            legalBasis: data.legalBasis,
            generatedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar parecer com IA neste momento. O laudo continuará com as diretrizes normativas locais.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior (Não imprime) */}
      <div className="no-print bg-white border border-neutral-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900">
            Laudo Técnico Pericial de Acessibilidade
          </h2>
          <p className="text-xs text-neutral-500">
            Documento emitido conforme parâmetros da ABNT NBR 9050, NBR 16537 e NBR 16747.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEditBuilding}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md border border-neutral-300 transition-colors cursor-pointer"
          >
            Editar Cabeçalho / RT
          </button>

          <button
            onClick={handleRegenerateSummary}
            disabled={isAiGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-md border border-blue-300 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Atualizando Parecer IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>Atualizar Parecer com IA</span>
              </>
            )}
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Laudo A4 / PDF</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL DO LAUDO (Estilizado para visualização e impressão A4) */}
      <div className="bg-white border border-neutral-200 sm:rounded-lg p-6 sm:p-12 shadow-sm max-w-4xl mx-auto text-neutral-900 print:border-none print:shadow-none print:p-0 print:max-w-none">
        {/* CABEÇALHO FORMAL PERICIAL */}
        <header className="border-b-2 border-neutral-900 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-neutral-600 mb-1 flex items-center gap-2">
                <span>Laudo Técnico de Inspeção Predial</span>
                <span className="text-neutral-300">·</span>
                <span className="font-extrabold text-blue-900">Sistema ADApTA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                LAUDO PERICIAL DE ACESSIBILIDADE
              </h1>
              <div className="text-sm font-semibold text-blue-800 mt-1">
                Avaliação Digital dos Parâmetros Técnicos de Acessibilidade · ABNT NBR 9050 & NBR 16537
              </div>
            </div>

            <div className="text-right text-xs text-neutral-500 font-mono space-y-0.5 shrink-0">
              <div>Protocolo: <span className="font-semibold text-neutral-800">LAU-{project.id.toUpperCase()}</span></div>
              <div>Data da Vistoria: <span className="font-semibold text-neutral-800">{building.inspectionDate}</span></div>
              <div>RRT / ART: <span className="font-semibold text-neutral-800">{building.rrtArtNumber}</span></div>
            </div>
          </div>
        </header>

        {/* 1. DADOS CADASTRAIS DO IMÓVEL E RESPONSÁVEL TÉCNICO */}
        <section className="mb-8 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1.5 mb-3 flex items-center gap-2">
            <span>1. Identificação do Objeto e Responsabilidade Técnica</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs bg-neutral-50 p-4 rounded-md border border-neutral-200">
            <div>
              <span className="text-neutral-500 block font-medium">Edificação Inspecionada:</span>
              <span className="font-bold text-neutral-900 text-sm">{building.name}</span>
              {building.tradeName && <span className="text-neutral-600 block">({building.tradeName})</span>}
            </div>

            <div>
              <span className="text-neutral-500 block font-medium">Tipologia e Uso:</span>
              <span className="font-semibold text-neutral-900">{building.type}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-neutral-500 block font-medium">Classificação Legal da Edificação (Decreto Federal nº 5.296/2004):</span>
              <span className="inline-block mt-0.5 font-bold text-xs text-blue-900 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded">
                {building.classification === 'uso_publico' ? 'Edificação de Uso Público' : 'Edificação de Uso Coletivo'}
              </span>
              <span className="text-[11px] text-neutral-600 block mt-1 leading-snug">
                {building.classification === 'uso_publico'
                  ? 'Aquelas administradas por entidades da administração pública, direta e indireta, ou por empresas prestadoras de serviços públicos e destinadas ao público em geral.'
                  : 'Aquelas destinadas às atividades de natureza comercial, hoteleira, cultural, esportiva, financeira, turística, recreativa, social, religiosa, educacional, industrial e de saúde, inclusive as edificações de prestação de serviços de atividades da mesma natureza.'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-neutral-500 block font-medium">Endereço Completo:</span>
              <span className="font-semibold text-neutral-900">
                {building.address} · {building.city} - {building.state} · CEP {building.zipCode}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block font-medium">Área Construída / Pavimentos:</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {building.constructedArea} · {building.floorsCount} pavimentos
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block font-medium">Proprietário / Solicitante:</span>
              <span className="font-semibold text-neutral-900">{building.contractorName}</span>
              <span className="text-neutral-500 block font-mono text-[11px]">{building.contractorCnpjCpf}</span>
            </div>

            <div>
              <span className="text-neutral-500 block font-medium">Responsável Técnico / Perito:</span>
              <span className="font-bold text-neutral-900">{building.technicalManager}</span>
              <span className="text-blue-800 font-semibold block">{building.technicalCouncilId}</span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-neutral-200/80">
              <span className="text-neutral-700 block font-bold text-xs mb-1.5 flex items-center gap-1.5">
                <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded text-[10px]">1.1</span>
                <span>Setores da Edificação Inspecionados:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(project.sectors && project.sectors.length > 0 ? project.sectors : categories).map(sec => {
                  const itemsCount = project.items.filter(i => (i.sectorId || i.categoryId) === sec.id).length;
                  return (
                    <span
                      key={sec.id}
                      className="bg-white border border-neutral-300 text-neutral-800 rounded px-2 py-1 text-[11px] font-medium flex items-center gap-1 shadow-2xs"
                    >
                      <strong className="text-blue-900">{sec.name}</strong>
                      <span className="text-neutral-400 font-mono">({itemsCount} elementos)</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 2. OBJETIVO, ESCOPO E NORMAS DE REFERÊNCIA */}
        <section className="mb-8 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1.5 mb-3">
            2. Objetivo e Fundamentação Normativa
          </h2>
          <div className="text-xs text-neutral-700 leading-relaxed space-y-2 text-justify">
            <p>
              O presente Laudo Técnico de Acessibilidade tem por objetivo avaliar pericialmente as condições de acessibilidade arquitetônica, rotas de fuga, circulação, sinalização e uso dos espaços na referida edificação, identificando eventuais barreiras físicas ou urbanísticas que limitem ou impeçam o uso autônomo e seguro por pessoas com deficiência (PCD) ou mobilidade reduzida.
            </p>
            <p>
              A fundamentação técnica, critérios de amostragem e parâmetros de tolerância adotados baseiam-se rigorosamente no arcabouço normativo e legislativo vigente:
            </p>
            <ul className="list-disc list-inside space-y-1 font-medium text-neutral-800 pl-2">
              <li><strong>ABNT NBR 9050:2020</strong> – Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos;</li>
              <li><strong>ABNT NBR 16537:2024</strong> – Acessibilidade — Sinalização tátil no piso — Diretrizes para elaboração de projetos e instalação;</li>
              <li><strong>ABNT NBR 9077:2025</strong> – Saídas de emergência em edifícios e compatibilização com rotas de fuga acessíveis;</li>
              <li><strong>ABNT NBR 16858-3:2022 / NBR ISO 9386-1:2013</strong> – Elevadores e plataformas de elevação motorizadas para acessibilidade;</li>
              <li><strong>ABNT NBR 16747:2020</strong> – Inspeção predial — Diretrizes, conceitos, terminologia e procedimento;</li>
              <li><strong>Lei Federal nº 13.146/2015</strong> – Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da PCD);</li>
              <li><strong>Decretos Federais nº 5.296/2004 e nº 9.451/2018</strong> – Regulamentação de acessibilidade e unidades adaptáveis;</li>
              <li><strong>Resolução CONTRAN nº 965/2022</strong> – Sinalização e dimensionamento de vagas de estacionamento reservadas para PCD e Idosos.</li>
            </ul>
          </div>
        </section>

        {/* 3. RESUMO EXECUTIVO E ÍNDICE GERAL DE CONFORMIDADE */}
        <section className="mb-8 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1.5 mb-3 flex items-center justify-between">
            <span>3. Resumo Executivo e Diagnóstico de Conformidade</span>
            <span className="font-mono text-xs font-bold text-neutral-900">
              Taxa Global: {complianceRate}%
            </span>
          </h2>

          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 mb-4 text-xs text-neutral-800 leading-relaxed space-y-2 whitespace-pre-line text-justify">
            {laudoSummary?.executiveSummary || (
              `Realizada vistoria técnica detalhada in loco na edificação ${building.name}. Foram auditados ${totalItems} pontos de inspeção normativa, dos quais ${conformes} encontram-se em conformidade, ${naoConformes.length} apresentaram não conformidades físicas ou de sinalização e ${pendentes} aguardam validação complementar. A edificação atinge taxa de aderência de ${complianceRate}%.`
            )}
          </div>

          {/* Tabela de Setores */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-neutral-200">
              <thead>
                <tr className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-200">
                  <th className="py-2 px-3">Setor Auditado</th>
                  <th className="py-2 px-3 text-center">Itens</th>
                  <th className="py-2 px-3 text-center text-emerald-700">Conformes</th>
                  <th className="py-2 px-3 text-center text-rose-700">Não Conformes</th>
                  <th className="py-2 px-3 text-right">Aderência (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-medium">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-neutral-50">
                    <td className="py-2 px-3 font-semibold text-neutral-900">{cat.name}</td>
                    <td className="py-2 px-3 text-center font-mono tabular-nums">{cat.total}</td>
                    <td className="py-2 px-3 text-center font-mono tabular-nums text-emerald-700">{cat.conf}</td>
                    <td className="py-2 px-3 text-center font-mono tabular-nums text-rose-700 font-bold">{cat.nc}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums font-bold">
                      <span className={cat.rate >= 80 ? 'text-emerald-700' : cat.rate >= 50 ? 'text-amber-700' : 'text-rose-700'}>
                        {cat.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quebra de página para impressão formal */}
        <div className="print-page-break" />

        {/* 4. RELATÓRIO FOTOGRÁFICO E DIAGNÓSTICO DETALHADO DAS NÃO CONFORMIDADES */}
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b-2 border-neutral-900 pb-1.5 mb-4 flex items-center justify-between">
            <span>4. Apontamento Pericial das Não Conformidades & Registro Fotográfico</span>
            <span className="text-xs font-mono font-bold text-rose-700">
              {naoConformes.length} Irregularidades
            </span>
          </h2>

          {naoConformes.length === 0 ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-md text-center text-xs text-emerald-800">
              Nenhuma não conformidade registrada nesta vistoria técnica. Todos os itens inspecionados encontram-se em conformidade ou não aplicáveis.
            </div>
          ) : (
            <div className="space-y-6">
              {naoConformes.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="border border-neutral-300 rounded-md p-4 print-break-inside-avoid bg-white space-y-3"
                >
                  {/* Cabeçalho do Apontamento */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-200 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-neutral-900 text-white px-2 py-0.5 rounded">
                        Item {idx + 1} · {item.code}
                      </span>
                      <span className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        1.1 Setor: {item.sectorName || item.categoryName}
                      </span>
                      {item.elementName && (
                        <span className="text-xs font-medium text-neutral-800 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded font-mono">
                          1.1.1 Elemento: {item.elementName}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-neutral-900">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-semibold text-neutral-600">Criticidade:</span>
                      <span className={`font-bold ${
                        item.criticality === 'Crítico' ? 'text-rose-700' : item.criticality === 'Médio' ? 'text-amber-700' : 'text-neutral-700'
                      }`}>
                        {item.criticality || 'Médio'} (GUT {item.priorityGUT || 3})
                      </span>
                    </div>
                  </div>

                  {/* Informações Técnicas e Foto */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Bloco de Foto */}
                    <div className="md:col-span-1">
                      {item.photoUrl ? (
                        <div className="border border-neutral-200 rounded overflow-hidden aspect-4/3 bg-neutral-100">
                          <img
                            src={item.photoUrl}
                            alt={`Foto da irregularidade ${item.code}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="border border-neutral-200 rounded aspect-4/3 bg-neutral-50 flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
                          <span className="text-[11px]">Registro fotográfico em arquivo digital pericial</span>
                        </div>
                      )}
                      <div className="text-[10px] text-neutral-500 mt-1 italic">
                        Local: {item.location || 'Conforme vistoria in loco'}
                      </div>
                    </div>

                    {/* Bloco Descritivo */}
                    <div className="md:col-span-2 space-y-2">
                      <div>
                        <span className="font-bold text-neutral-800 block text-[11px] uppercase">
                          Norma e Exigência:
                        </span>
                        <div className="text-neutral-700 leading-snug">
                          <span className="font-semibold text-blue-800">{item.standardReference}</span> — {item.standardRequirement}
                        </div>
                      </div>

                      {item.measurement && (
                        <div className="bg-neutral-50 p-2 rounded border border-neutral-200 font-mono text-[11px]">
                          <strong className="text-neutral-900">Medição Aferida em Campo: </strong>
                          <span className="text-rose-800 font-bold">{item.measurement}</span>
                        </div>
                      )}

                      <div>
                        <span className="font-bold text-neutral-800 block text-[11px] uppercase">
                          Diagnóstico Técnico / Risco:
                        </span>
                        <p className="text-neutral-700 text-justify leading-snug">
                          {item.technicalDiagnosis || item.fieldNotes || 'Irregularidade dimensional ou de sinalização que impede a transposição segura por pessoas com deficiência ou mobilidade reduzida.'}
                        </p>
                      </div>

                      <div className="pt-1 border-t border-neutral-100">
                        <span className="font-bold text-neutral-900 block text-[11px] uppercase">
                          Recomendação de Intervenção / Adequação:
                        </span>
                        <p className="text-neutral-800 font-medium text-justify leading-snug">
                          {item.technicalRecommendation || 'Proceder ao remanejamento ou reforma física conforme parâmetros da ABNT NBR 9050.'}
                        </p>
                        <div className="text-[10px] text-neutral-500 font-mono mt-1">
                          Prazo recomendado para execução: <strong>{item.suggestedDeadlineDays || 60} dias</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quebra de página para impressão formal */}
        <div className="print-page-break" />

        {/* 5. PLANO DE AÇÃO E MATRIZ GUT */}
        <section className="mb-8 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1.5 mb-3">
            5. Plano de Ação e Matriz de Priorização das Intervenções (GUT)
          </h2>
          <div className="text-xs text-neutral-700 mb-3 text-justify">
            A matriz abaixo consolida as recomendações técnicas por ordem de criticidade, estabelecendo prioridade executiva para o cronograma de obras civis e adequações prediais:
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-300">
                  <th className="py-2 px-2.5">Código</th>
                  <th className="py-2 px-2.5">Elemento / Local</th>
                  <th className="py-2 px-2.5">Intervenção Recomendada</th>
                  <th className="py-2 px-2.5 text-center">GUT</th>
                  <th className="py-2 px-2.5 text-center">Criticidade</th>
                  <th className="py-2 px-2.5 text-right">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-medium">
                {naoConformes.map(nc => (
                  <tr key={nc.id} className="hover:bg-neutral-50">
                    <td className="py-2 px-2.5 font-mono font-bold text-neutral-900">{nc.code}</td>
                    <td className="py-2 px-2.5 text-neutral-800 max-w-[140px] truncate">{nc.title}</td>
                    <td className="py-2 px-2.5 text-neutral-700 leading-snug">
                      {nc.technicalRecommendation || 'Adequação física segundo NBR 9050'}
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono font-bold text-neutral-900">{nc.priorityGUT || 3}</td>
                    <td className="py-2 px-2.5 text-center font-semibold">
                      <span className={nc.criticality === 'Crítico' ? 'text-rose-700' : 'text-amber-700'}>
                        {nc.criticality || 'Médio'}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono tabular-nums text-neutral-900 font-semibold whitespace-nowrap">
                      {nc.suggestedDeadlineDays || 60}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. CONCLUSÃO TÉCNICA E TERMO DE ENCERRAMENTO */}
        <section className="mb-8 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1.5 mb-3">
            6. Parecer Conclusivo e Termo de Encerramento
          </h2>
          <div className="text-xs text-neutral-800 leading-relaxed space-y-3 text-justify">
            <p>
              {laudoSummary?.technicalConclusion || (
                `Com base nas vistorias de campo e na análise técnica realizada, conclui-se que o imóvel ${building.name} apresenta condições de acessibilidade com restrições normativas que requerem adequação. As irregularidades classificadas como críticas devem ser tratadas com caráter de urgência para mitigar riscos de acidentes e garantir a plenitude do direito de ir e vir preconizado pela Lei Brasileira de Inclusão (Lei 13.146/2015).`
              )}
            </p>
            <p>
              O presente Laudo Técnico de Acessibilidade é composto por {naoConformes.length > 0 ? 'relatório fotográfico, memorial de medições e matriz de recomendações' : 'checklist pericial e parecer conclusivo'}, sendo emitido em 2 (duas) vias de igual teor e forma, devidamente amparado pelo respectivo registro de responsabilidade técnica perante o Conselho de Classe profissional.
            </p>
          </div>

          {/* Bloco de Assinatura do Perito */}
          <div className="mt-12 pt-8 border-t border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-xs text-neutral-500 font-mono space-y-0.5 text-center sm:text-left">
              <div>Local e Data: {building.city}, {building.inspectionDate}</div>
              <div>Registro Técnico: {building.rrtArtNumber}</div>
              <div>Validade Técnica Recomendada: 2 anos ou até reformas físicas</div>
            </div>

            <div className="text-center sm:text-right">
              <div className="w-64 border-b border-neutral-900 mx-auto sm:ml-auto mb-1.5" />
              <div className="text-xs font-bold text-neutral-900 uppercase">
                {building.technicalManager}
              </div>
              <div className="text-xs text-neutral-600 font-medium">
                Arquiteto e Urbanista · Perito em Acessibilidade
              </div>
              <div className="text-xs text-blue-800 font-mono font-semibold">
                {building.technicalCouncilId}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
