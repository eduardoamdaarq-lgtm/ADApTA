import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  FileText, 
  ClipboardCheck, 
  ShieldCheck, 
  MapPin, 
  LogOut, 
  User, 
  CheckCircle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { InspectionProject, UserProfile, ProjectInspectionStatus } from '../types/inspection';

interface BuildingPortfolioProps {
  projects: InspectionProject[];
  currentUser: UserProfile;
  onSelectProject: (projectId: string) => void;
  onOpenNewBuildingModal: () => void;
  onEditBuildingData: (project: InspectionProject) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onExportAllProjects: () => void;
  onImportProjectJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogout: () => void;
}

export const BuildingPortfolio: React.FC<BuildingPortfolioProps> = ({
  projects,
  currentUser,
  onSelectProject,
  onOpenNewBuildingModal,
  onEditBuildingData,
  onDuplicateProject,
  onDeleteProject,
  onExportAllProjects,
  onImportProjectJson,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'todos' | ProjectInspectionStatus>('todos');
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<InspectionProject | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Totais estatísticos do portfólio
  const stats = useMemo(() => {
    const total = projects.length;
    const emVistoria = projects.filter(p => (p.status || p.building.status) === 'em_andamento').length;
    const concluidas = projects.filter(p => (p.status || p.building.status) === 'concluida').length;
    const agendadas = projects.filter(p => (p.status || p.building.status) === 'agendada').length;
    return { total, emVistoria, concluidas, agendadas };
  }, [projects]);

  // Filtragem dos projetos
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const pStatus = project.status || project.building.status || 'em_andamento';
      
      // Filtro de status
      if (selectedStatusFilter !== 'todos' && pStatus !== selectedStatusFilter) {
        return false;
      }

      // Filtro de busca textual
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const b = project.building;
        const matchesName = b.name.toLowerCase().includes(query);
        const matchesTrade = (b.tradeName || '').toLowerCase().includes(query);
        const matchesAddress = b.address.toLowerCase().includes(query);
        const matchesCity = b.city.toLowerCase().includes(query);
        const matchesContractor = (b.contractorName || '').toLowerCase().includes(query);
        const matchesType = (b.type || '').toLowerCase().includes(query);
        return matchesName || matchesTrade || matchesAddress || matchesCity || matchesContractor || matchesType;
      }

      return true;
    });
  }, [projects, selectedStatusFilter, searchTerm]);

  // Cálculo de taxa de conformidade para o card
  const getProjectCompliance = (project: InspectionProject) => {
    const items = project.items || [];
    if (items.length === 0) return { rate: 0, conformes: 0, naoConformes: 0, pendentes: 0, total: 0 };
    
    const conformes = items.filter(i => i.status === 'conforme').length;
    const naoConformes = items.filter(i => i.status === 'nao_conforme').length;
    const pendentes = items.filter(i => i.status === 'pendente').length;
    const aplicaveis = items.filter(i => i.status !== 'nao_se_aplica').length;
    
    const rate = aplicaveis > 0 ? Math.round((conformes / aplicaveis) * 100) : 0;
    return { rate, conformes, naoConformes, pendentes, total: items.length };
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Header do Portfólio */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Wordmark e identificação pericial */}
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                  ADApTA
                </span>
                <span className="hidden sm:inline text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {currentUser.name}
                </span>
              </div>
              <span className="hidden md:inline text-neutral-300">|</span>
              <span className="hidden md:inline text-xs font-semibold text-neutral-600">
                Portfólio de Edificações
              </span>
            </div>

            {/* Perfil e Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700">
                <div className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center">
                  EA
                </div>
                <div className="leading-tight">
                  <span className="font-bold text-neutral-900 block">{currentUser.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">{currentUser.cau}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer border border-neutral-200"
                title="Sair da sessão e retornar à página inicial"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Portfólio */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner Superior com Resumo e Ação Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Minhas Edificações Inspecionadas
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              Gerencie suas vistorias em andamento, consulte laudos técnicos periciais já concluídos e acompanhe inspeções agendadas sem perder dados.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewBuildingModal}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inserir Nova Edificação</span>
            </button>
          </div>
        </div>

        {/* Métricas do Portfólio (Cards Informativos) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card: Total */}
          <div 
            onClick={() => setSelectedStatusFilter('todos')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedStatusFilter === 'todos'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Total de Edificações
              </span>
              <Building2 className="w-4 h-4 opacity-70" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold mt-2">
              {stats.total}
            </div>
            <div className="text-[11px] opacity-70 mt-1">
              Imóveis sob gestão no portfólio
            </div>
          </div>

          {/* Card: Em Vistoria (Estão sendo inspecionadas) */}
          <div 
            onClick={() => setSelectedStatusFilter('em_andamento')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedStatusFilter === 'em_andamento'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white border-amber-200/80 text-neutral-800 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-100">
                Em Vistoria
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-amber-900">
              {stats.emVistoria}
            </div>
            <div className="text-[11px] text-amber-800/80 mt-1">
              Estão sendo inspecionadas
            </div>
          </div>

          {/* Card: Concluídas (Já foram inspecionadas) */}
          <div 
            onClick={() => setSelectedStatusFilter('concluida')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedStatusFilter === 'concluida'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white border-emerald-200/80 text-neutral-800 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-100">
                Laudos Concluídos
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-emerald-900">
              {stats.concluidas}
            </div>
            <div className="text-[11px] text-emerald-800/80 mt-1">
              Já foram inspecionadas
            </div>
          </div>

          {/* Card: Agendadas (Serão inspecionadas) */}
          <div 
            onClick={() => setSelectedStatusFilter('agendada')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedStatusFilter === 'agendada'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white border-blue-200/80 text-neutral-800 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-100">
                Agendadas
              </span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold mt-2 text-blue-900">
              {stats.agendadas}
            </div>
            <div className="text-[11px] text-blue-800/80 mt-1">
              Serão inspecionadas em breve
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Campo de Busca */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, endereço ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 text-neutral-900"
            />
          </div>

          {/* Abas de Filtro de Status */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedStatusFilter('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedStatusFilter === 'todos'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('em_andamento')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedStatusFilter === 'em_andamento'
                  ? 'bg-amber-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Em Vistoria ({stats.emVistoria})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('concluida')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedStatusFilter === 'concluida'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Concluídas ({stats.concluidas})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('agendada')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedStatusFilter === 'agendada'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Agendadas ({stats.agendadas})
            </button>
          </div>

          {/* Backup e Exportações */}
          <div className="flex items-center gap-1.5 shrink-0 border-t sm:border-t-0 sm:border-l border-neutral-200 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-end">
            <button
              onClick={onExportAllProjects}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Exportar backup completo de todas as edificações (JSON)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Exportar Tudo</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Importar edificação a partir de arquivo JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Importar JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={onImportProjectJson}
            />
          </div>
        </div>

        {/* Lista / Grid de Edificações */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Nenhuma edificação encontrada
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? `Nenhum imóvel corresponde aos termos pesquisados "${searchTerm}".`
                  : 'Nenhuma edificação cadastrada nesta categoria de status.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenNewBuildingModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Nova Edificação</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const b = project.building;
              const pStatus = project.status || b.status || 'em_andamento';
              const compliance = getProjectCompliance(project);

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-neutral-200/90 hover:border-neutral-300 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Topo do Card com Badge de Status */}
                  <div className="p-4 border-b border-neutral-100 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {/* Status Tag */}
                      {pStatus === 'em_andamento' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Em Vistoria</span>
                        </span>
                      )}

                      {pStatus === 'concluida' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Laudo Concluído</span>
                        </span>
                      )}

                      {pStatus === 'agendada' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>Agendada</span>
                        </span>
                      )}

                      {/* Classificação Legal (Decreto 5.296/2004) */}
                      <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        {b.classification === 'uso_publico' ? 'Uso Público' : 'Uso Coletivo'}
                      </span>
                    </div>

                    {/* Nome do Edifício e Tipologia */}
                    <div>
                      <h3 
                        onClick={() => onSelectProject(project.id)}
                        className="text-sm font-bold text-neutral-900 group-hover:text-blue-700 transition-colors cursor-pointer line-clamp-1"
                        title={b.name}
                      >
                        {b.name}
                      </h3>
                      {b.tradeName && (
                        <div className="text-xs text-neutral-500 font-medium line-clamp-1 mt-0.5">
                          {b.tradeName}
                        </div>
                      )}
                    </div>

                    {/* Endereço */}
                    <div className="flex items-start gap-1.5 text-neutral-500 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400 mt-0.5" />
                      <span className="line-clamp-1">
                        {b.address} · {b.city}/{b.state}
                      </span>
                    </div>
                  </div>

                  {/* Corpo do Card: Métricas e Indicadores Técnicos */}
                  <div className="p-4 flex-1 space-y-3 bg-neutral-50/50 text-xs">
                    {/* Barra de Progresso / Conformidade */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-neutral-700">Índice de Conformidade NBR 9050</span>
                        <span className="font-bold text-neutral-900">{compliance.rate}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            compliance.rate >= 80 
                              ? 'bg-emerald-500' 
                              : compliance.rate >= 50 
                              ? 'bg-amber-500' 
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${compliance.rate}%` }}
                        />
                      </div>
                    </div>

                    {/* Resumo Numérico de Itens */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-white p-2 rounded border border-neutral-200">
                        <div className="text-[10px] text-neutral-500">Conformes</div>
                        <div className="text-xs font-bold text-emerald-700">{compliance.conformes}</div>
                      </div>
                      <div className="bg-white p-2 rounded border border-neutral-200">
                        <div className="text-[10px] text-neutral-500">Não Conf.</div>
                        <div className="text-xs font-bold text-rose-700">{compliance.naoConformes}</div>
                      </div>
                      <div className="bg-white p-2 rounded border border-neutral-200">
                        <div className="text-[10px] text-neutral-500">Pendentes</div>
                        <div className="text-xs font-bold text-amber-700">{compliance.pendentes}</div>
                      </div>
                    </div>

                    {/* Detalhes de Data e Setores */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                      <span>Data: {b.inspectionDate || 'Não definida'}</span>
                      <span>{project.sectors?.length || 0} setores vistoriados</span>
                    </div>
                  </div>

                  {/* Rodapé do Card com Ações */}
                  <div className="p-3 bg-white border-t border-neutral-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="flex-1 py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Abrir Vistoria &amp; Laudo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Ações Secundárias */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditBuildingData(project)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                        title="Editar identificação da edificação e setores"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDuplicateProject(project.id)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                        title="Duplicar este projeto"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Excluir edificação"
                        aria-label={`Excluir edificação ${project.building.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Confirmação para Excluir Edificação */}
      {projectToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          onClick={() => setProjectToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-neutral-900">
                  Excluir Edificação
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Tem certeza que deseja excluir permanentemente a edificação{' '}
                  <strong className="text-neutral-900 font-semibold">{projectToDelete.building.name}</strong> do seu portfólio?
                </p>
              </div>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-950">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Atenção: Ação irreversível</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-800">
                Todos os dados de cadastro, {projectToDelete.items.length} itens de vistoria técnica, fotos anexadas, laudo pericial e plano de ação associados a esta edificação serão excluídos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete = projectToDelete.id;
                  setProjectToDelete(null);
                  onDeleteProject(idToDelete);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Edificação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Institucional */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>ADApTA</strong> · Avaliação Digital dos Parâmetros Técnicos de Acessibilidade
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <span>ABNT NBR 9050:2020</span>
            <span aria-hidden="true">·</span>
            <span>ABNT NBR 16537</span>
            <span aria-hidden="true">·</span>
            <span>Lei 13.146/2015</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
