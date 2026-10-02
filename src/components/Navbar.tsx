import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Building2, 
  Sparkles, 
  RotateCcw, 
  Download, 
  Upload,
  ArrowLeft,
  ChevronDown,
  Plus,
  LogOut,
  Check,
  Clock,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { InspectionProject, UserProfile } from '../types/inspection';

interface NavbarProps {
  activeTab: 'checklist' | 'laudo' | 'plano' | 'relatorio';
  setActiveTab: (tab: 'checklist' | 'laudo' | 'plano' | 'relatorio') => void;
  onOpenBuildingModal: () => void;
  onOpenAiAssistant: () => void;
  onResetToDemo: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrintLaudo: () => void;
  buildingName: string;
  currentUser?: UserProfile | null;
  allProjects?: InspectionProject[];
  currentProjectId?: string;
  onSelectProject?: (id: string) => void;
  onReturnToPortfolio?: () => void;
  onOpenNewBuildingModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBuildingModal,
  onOpenAiAssistant,
  onResetToDemo,
  onExportJson,
  onImportJson,
  onPrintLaudo,
  buildingName,
  currentUser,
  allProjects = [],
  currentProjectId,
  onSelectProject,
  onReturnToPortfolio,
  onOpenNewBuildingModal,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBuildingMenuOpen, setIsBuildingMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBuildingMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Contract: 3 zones */}
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Zone 1: Single text element wordmark + Navegação entre Edificações */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Botão Voltar ao Portfólio */}
            {onReturnToPortfolio && (
              <button
                onClick={onReturnToPortfolio}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-blue-700 bg-neutral-100 hover:bg-blue-50 border border-neutral-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer"
                title="Voltar ao Painel Geral de Edificações"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edificações</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('checklist')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold tracking-tight text-neutral-900 group-hover:text-blue-700 transition-colors bg-white">
                  ADApTA
                </span>
                <span className="hidden sm:inline text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {currentUser?.name || 'Eduardo Almeida'}
                </span>
              </div>
              <div className="text-[10px] text-neutral-500 font-medium hidden md:block leading-none -mt-0.5">
                Avaliação Digital dos Parâmetros Técnicos de Acessibilidade
              </div>
            </button>

            <span className="hidden xl:inline text-neutral-300">|</span>

            {/* Dropdown Seletor Rápido de Edificações */}
            {allProjects.length > 0 && onSelectProject && (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsBuildingMenuOpen(!isBuildingMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors max-w-xs truncate cursor-pointer"
                  title="Trocar de edificação ou visualizar lista"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span className="truncate max-w-[160px]">{buildingName || 'Selecionar Edificação'}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                </button>

                {isBuildingMenuOpen && (
                  <div className="absolute left-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 flex items-center justify-between">
                      <span>Alternar Edificação</span>
                      <span>{allProjects.length} cadastradas</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {allProjects.map((p) => {
                        const isCurrent = p.id === currentProjectId;
                        const pStatus = p.status || p.building.status || 'em_andamento';
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              onSelectProject(p.id);
                              setIsBuildingMenuOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors ${
                              isCurrent ? 'bg-blue-50/70 font-bold text-blue-900' : 'text-neutral-700'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="truncate font-semibold">{p.building.name}</div>
                              <div className="text-[10px] text-neutral-400 truncate">
                                {p.building.city}/{p.building.state}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {pStatus === 'em_andamento' && (
                                <span className="p-1 rounded-full bg-amber-100 text-amber-700" title="Em Vistoria">
                                  <Clock className="w-3 h-3" />
                                </span>
                              )}
                              {pStatus === 'concluida' && (
                                <span className="p-1 rounded-full bg-emerald-100 text-emerald-700" title="Concluída">
                                  <CheckCircle className="w-3 h-3" />
                                </span>
                              )}
                              {pStatus === 'agendada' && (
                                <span className="p-1 rounded-full bg-blue-100 text-blue-700" title="Agendada">
                                  <Calendar className="w-3 h-3" />
                                </span>
                              )}
                              {isCurrent && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-neutral-100 pt-1 px-2 space-y-1">
                      {onOpenNewBuildingModal && (
                        <button
                          onClick={() => {
                            setIsBuildingMenuOpen(false);
                            onOpenNewBuildingModal();
                          }}
                          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Inserir Nova Edificação</span>
                        </button>
                      )}
                      {onReturnToPortfolio && (
                        <button
                          onClick={() => {
                            setIsBuildingMenuOpen(false);
                            onReturnToPortfolio();
                          }}
                          className="w-full flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Ver Todas no Painel</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onOpenBuildingModal}
              className="hidden 2xl:flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 px-2 py-1 rounded transition-colors"
              title="Configurar dados e setores desta edificação"
            >
              <span>Editar Dados</span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Vistoria de Campo
            </button>

            <button
              onClick={() => setActiveTab('laudo')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'laudo'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Laudo Técnico ABNT
            </button>

            <button
              onClick={() => setActiveTab('plano')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'plano'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Plano de Intervenção
            </button>

            <button
              onClick={() => setActiveTab('relatorio')}
              className={`hidden md:block px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'relatorio'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Relatório Executivo
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors whitespace-nowrap cursor-pointer"
              title="Consultar assistente de normas ABNT NBR 9050"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">Assistente NBR 9050</span>
              <span className="sm:hidden">IA</span>
            </button>

            <button
              onClick={onPrintLaudo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              title="Visualizar e Imprimir Laudo Pericial em formato A4/PDF"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Imprimir Laudo PDF</span>
            </button>

            {/* Menu de Backup / Dados */}
            <div className="hidden xl:flex items-center gap-1 border-l border-neutral-200 pl-2">
              <button
                onClick={onExportJson}
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                title="Exportar dados desta edificação (JSON)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                title="Importar projeto anterior (JSON)"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportJson}
              />
              <button
                onClick={onResetToDemo}
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                title="Recarregar dados originais de exemplo (Alpha Tower)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer border border-neutral-200 ml-1"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
