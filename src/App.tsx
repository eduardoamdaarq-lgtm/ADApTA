import React, { useState, useEffect } from 'react';
import { InspectionProject, InspectionItem, BuildingData } from './types/inspection';
import { INITIAL_PROJECT } from './data/defaultChecklist';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { FieldChecklist } from './components/FieldChecklist';
import { LaudoTecnico } from './components/LaudoTecnico';
import { PlanoDeAcao } from './components/PlanoDeAcao';
import { ExecutiveReport } from './components/ExecutiveReport';
import { BuildingDataModal } from './components/BuildingDataModal';
import { AiAssistantModal } from './components/AiAssistantModal';

const STORAGE_KEY = 'acessilaudo_project_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'laudo' | 'plano' | 'relatorio'>('checklist');
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>('todos');
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Initialize Project from LocalStorage or default
  const [project, setProject] = useState<InspectionProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao recuperar projeto do localStorage:', e);
    }
    return INITIAL_PROJECT;
  });

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Erro ao salvar projeto no localStorage:', e);
    }
  }, [project]);

  // Update item in checklist
  const handleUpdateItem = (updatedItem: InspectionItem) => {
    setProject(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === updatedItem.id ? updatedItem : item),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Add new item
  const handleAddItem = (newItem: InspectionItem) => {
    setProject(prev => ({
      ...prev,
      items: [newItem, ...prev.items],
      updatedAt: new Date().toISOString(),
    }));
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item da vistoria?')) return;
    setProject(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Update building data
  const handleSaveBuilding = (updatedBuilding: BuildingData) => {
    setProject(prev => ({
      ...prev,
      building: updatedBuilding,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Reset to Demo
  const handleResetToDemo = () => {
    if (window.confirm('Deseja recarregar o projeto de exemplo (Alpha Corporate Tower)? Suas alterações locais não salvas em arquivo serão substituídas.')) {
      setProject(INITIAL_PROJECT);
    }
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AcessiLaudo_${project.building.name.replace(/\s+/g, '_')}_${project.building.inspectionDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.building && Array.isArray(json.items)) {
          setProject(json);
          alert('Projeto importado com sucesso!');
        } else {
          alert('Arquivo JSON inválido. Estrutura de dados incompatível.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
  };

  // Print Laudo
  const handlePrintLaudo = () => {
    setActiveTab('laudo');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Navbar Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBuildingModal={() => setIsBuildingModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onResetToDemo={handleResetToDemo}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onPrintLaudo={handlePrintLaudo}
        buildingName={project.building.name}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Painel de Métricas (visível em todas as telas de tela, exceto impressão) */}
        <div className="no-print">
          <DashboardStats
            items={project.items}
            onFilterStatus={(status) => {
              setSelectedFilterStatus(status);
              setActiveTab('checklist');
            }}
          />
        </div>

        {/* Visualizações Conforme Aba Ativa */}
        {activeTab === 'checklist' && (
          <div className="no-print">
            <FieldChecklist
              items={project.items}
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              selectedFilterStatus={selectedFilterStatus}
              onClearFilterStatus={() => setSelectedFilterStatus('todos')}
            />
          </div>
        )}

        {activeTab === 'laudo' && (
          <LaudoTecnico
            project={project}
            onUpdateProject={setProject}
            onPrint={handlePrintLaudo}
            onEditBuilding={() => setIsBuildingModalOpen(true)}
          />
        )}

        {activeTab === 'plano' && (
          <div className="no-print">
            <PlanoDeAcao
              items={project.items}
              onUpdateItem={handleUpdateItem}
              buildingName={project.building.name}
            />
          </div>
        )}

        {activeTab === 'relatorio' && (
          <div className="no-print">
            <ExecutiveReport
              project={project}
              onPrint={handlePrintLaudo}
            />
          </div>
        )}
      </main>

      {/* Rodapé institucional */}
      <footer className="no-print mt-auto border-t border-neutral-200 bg-white py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AcessiLaudo Pro · Plataforma de Inspeção Predial de Acessibilidade
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

      {/* Modais */}
      <BuildingDataModal
        building={project.building}
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        onSave={handleSaveBuilding}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </div>
  );
}
