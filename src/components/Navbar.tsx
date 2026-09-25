import React from 'react';
import { 
  Printer, 
  Building2, 
  Sparkles, 
  RotateCcw, 
  Download, 
  Upload 
} from 'lucide-react';

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
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Contract: 3 zones */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('checklist')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-blue-700 transition-colors">
                AcessiLaudo Pro
              </span>
            </button>
            <span className="hidden lg:inline text-neutral-300">|</span>
            <button
              onClick={onOpenBuildingModal}
              className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded transition-colors max-w-xs truncate"
              title="Clique para editar dados da edificação e do perito"
            >
              <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{buildingName || 'Configurar Edificação'}</span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'checklist'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Vistoria de Campo
            </button>

            <button
              onClick={() => setActiveTab('laudo')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'laudo'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Laudo Técnico ABNT
            </button>

            <button
              onClick={() => setActiveTab('plano')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'plano'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Plano de Intervenção
            </button>

            <button
              onClick={() => setActiveTab('relatorio')}
              className={`hidden md:block px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
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
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
                title="Exportar dados do projeto (JSON)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
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
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
                title="Recarregar dados de exemplo (Alpha Tower)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
