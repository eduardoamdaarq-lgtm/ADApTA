import React, { useState, useEffect } from 'react';
import { 
  InspectionProject, 
  InspectionItem, 
  BuildingData, 
  SectorDefinition, 
  UserProfile 
} from './types/inspection';
import { 
  INITIAL_PROJECT, 
  INITIAL_PROJECTS_LIST, 
  createNewBuildingProject 
} from './data/defaultChecklist';
import { LandingPage } from './components/LandingPage';
import { BuildingPortfolio } from './components/BuildingPortfolio';
import { NewBuildingModal } from './components/NewBuildingModal';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { FieldChecklist } from './components/FieldChecklist';
import { LaudoTecnico } from './components/LaudoTecnico';
import { PlanoDeAcao } from './components/PlanoDeAcao';
import { ExecutiveReport } from './components/ExecutiveReport';
import { BuildingDataModal } from './components/BuildingDataModal';
import { AiAssistantModal } from './components/AiAssistantModal';

const STORAGE_PORTFOLIO_KEY = 'adapta_projects_portfolio_v2';
const STORAGE_LEGACY_KEY = 'adapta_project_v3_sectors';
const STORAGE_USER_KEY = 'adapta_auth_user_v1';
const STORAGE_ACTIVE_PROJECT_KEY = 'adapta_active_project_id_v1';

export default function App() {
  // Autenticação do Usuário
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Erro ao ler usuário salvo:', e);
    }
    return null;
  });

  // Salvar sessão do usuário
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    } catch (e) {
      console.error('Erro ao sincronizar sessão:', e);
    }
  }, [currentUser]);

  // Lista de Projetos (Portfólio de Edificações) com migração retroativa
  const [projects, setProjects] = useState<InspectionProject[]>(() => {
    try {
      const savedPortfolio = localStorage.getItem(STORAGE_PORTFOLIO_KEY);
      if (savedPortfolio) {
        const parsed = JSON.parse(savedPortfolio);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Migração de projeto legado (v3_sectors) para nunca perder os dados anteriores
      const legacyProjectStr = localStorage.getItem(STORAGE_LEGACY_KEY);
      if (legacyProjectStr) {
        const legacyProj = JSON.parse(legacyProjectStr);
        if (legacyProj && legacyProj.building && Array.isArray(legacyProj.items)) {
          const migratedLegacy: InspectionProject = {
            ...legacyProj,
            id: legacyProj.id || 'adapta-alpha-2026',
            status: legacyProj.status || 'em_andamento',
            building: {
              ...legacyProj.building,
              status: legacyProj.building.status || 'em_andamento',
            },
          };

          // Combina o legado do usuário com os outros exemplos de hospital e centro cívico
          const otherDemos = INITIAL_PROJECTS_LIST.filter(p => p.id !== migratedLegacy.id);
          return [migratedLegacy, ...otherDemos];
        }
      }
    } catch (e) {
      console.error('Erro ao carregar portfólio de projetos:', e);
    }
    return INITIAL_PROJECTS_LIST;
  });

  // Salvar Portfólio de Projetos no localStorage sempre que houver modificação
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Erro ao salvar portfólio de projetos no localStorage:', e);
    }
  }, [projects]);

  // Edificação Ativa Selecionada (ID)
  // null = Visão Geral do Portfólio de Edificações
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    try {
      const savedActive = localStorage.getItem(STORAGE_ACTIVE_PROJECT_KEY);
      if (savedActive && savedActive !== 'null') {
        return savedActive;
      }
    } catch (e) {
      console.error('Erro ao carregar ID do projeto ativo:', e);
    }
    return null;
  });

  // Salvar ID do projeto ativo
  useEffect(() => {
    try {
      if (currentProjectId) {
        localStorage.setItem(STORAGE_ACTIVE_PROJECT_KEY, currentProjectId);
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_PROJECT_KEY);
      }
    } catch (e) {
      console.error('Erro ao salvar projeto ativo no localStorage:', e);
    }
  }, [currentProjectId]);

  // Abas dentro do Workspace da Edificação Ativa
  const [activeTab, setActiveTab] = useState<'checklist' | 'laudo' | 'plano' | 'relatorio'>('checklist');
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>('todos');
  
  // Modais
  const [isNewBuildingModalOpen, setIsNewBuildingModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [editingProjectTarget, setEditingProjectTarget] = useState<InspectionProject | null>(null);

  // Projeto atualmente selecionado
  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  // Atualizar o projeto ativo no portfólio de projetos
  const handleUpdateCurrentProject = (updater: (prev: InspectionProject) => InspectionProject) => {
    if (!currentProjectId) return;
    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === currentProjectId) {
          return updater(proj);
        }
        return proj;
      })
    );
  };

  // Cadastrar Nova Edificação (sem perder nenhuma das anteriores!)
  const handleCreateNewBuilding = (
    building: BuildingData,
    sectors: SectorDefinition[],
    templateMode: 'standard' | 'blank'
  ) => {
    const newProject = createNewBuildingProject(building, sectors, templateMode);
    
    // Adiciona ao topo da lista de projetos preservando todos os dados existentes
    setProjects(prev => [newProject, ...prev]);
    
    // Abre diretamente o workspace da nova edificação
    setCurrentProjectId(newProject.id);
    setActiveTab('checklist');
  };

  // Duplicar Projeto Existente
  const handleDuplicateProject = (projectId: string) => {
    const sourceProject = projects.find(p => p.id === projectId);
    if (!sourceProject) return;

    const clonedId = `adapta-proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const clonedProject: InspectionProject = {
      ...sourceProject,
      id: clonedId,
      building: {
        ...sourceProject.building,
        name: `${sourceProject.building.name} (Cópia)`,
      },
      items: sourceProject.items.map((item, idx) => ({
        ...item,
        id: `${clonedId}-item-${idx + 1}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects(prev => [clonedProject, ...prev]);
  };

  // Excluir Projeto do Portfólio
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  // Editar identificação da edificação (modal)
  const handleSaveBuildingData = (updatedBuilding: BuildingData, updatedSectors?: SectorDefinition[]) => {
    const targetId = editingProjectTarget?.id || currentProjectId;
    if (!targetId) return;

    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === targetId) {
          const newStatus = updatedBuilding.status || proj.status;
          return {
            ...proj,
            building: updatedBuilding,
            sectors: updatedSectors || proj.sectors,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return proj;
      })
    );

    setEditingProjectTarget(null);
  };

  // Abrir modal de edição para um projeto específico
  const handleOpenEditBuilding = (project: InspectionProject) => {
    setEditingProjectTarget(project);
    setIsBuildingModalOpen(true);
  };

  // Ações nos Itens de Vistoria do Projeto Ativo
  const handleUpdateItem = (updatedItem: InspectionItem) => {
    handleUpdateCurrentProject(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === updatedItem.id ? updatedItem : item),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddItem = (newItem: InspectionItem) => {
    handleUpdateCurrentProject(prev => ({
      ...prev,
      items: [newItem, ...prev.items],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddSector = (newSector: SectorDefinition) => {
    handleUpdateCurrentProject(prev => ({
      ...prev,
      sectors: [...(prev.sectors || []), newSector],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteItem = (id: string) => {
    handleUpdateCurrentProject(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Exportar Backup Completo (Todas as edificações)
  const handleExportAllProjects = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ADApTA_Portfolio_Completo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Exportar Projeto Individual Ativo
  const handleExportSingleProject = () => {
    if (!currentProject) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AcessiLaudo_${currentProject.building.name.replace(/\s+/g, '_')}_${currentProject.building.inspectionDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar Projeto(s) via JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && json.length > 0 && json[0].building) {
          // Importando portfólio completo
          setProjects(json);
          alert(`Portfólio com ${json.length} edificações importado com sucesso!`);
        } else if (json.building && Array.isArray(json.items)) {
          // Importando um projeto único: adiciona sem substituir os outros!
          const newId = json.id || `adapta-proj-${Date.now()}`;
          const importedProject: InspectionProject = {
            ...json,
            id: newId,
            status: json.status || json.building.status || 'em_andamento',
          };
          
          setProjects(prev => {
            const filtered = prev.filter(p => p.id !== newId);
            return [importedProject, ...filtered];
          });
          setCurrentProjectId(newId);
          alert(`Edificação "${importedProject.building.name}" importada com sucesso para o seu portfólio!`);
        } else {
          alert('Arquivo JSON inválido. Estrutura de dados incompatível.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
  };

  // Resetar Alpha Tower para dados de demonstração
  const handleResetToDemo = () => {
    setProjects(prev => {
      const others = prev.filter(p => p.id !== INITIAL_PROJECT.id);
      return [INITIAL_PROJECT, ...others];
    });
  };

  // Imprimir Laudo
  const handlePrintLaudo = () => {
    setActiveTab('laudo');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // 1. Tela Inicial de Apresentação e Login (quando não logado)
  if (!currentUser) {
    return (
      <LandingPage
        onLogin={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  // 2. Tela de Portfólio de Edificações (quando logado e nenhum projeto específico aberto)
  if (!currentProjectId || !currentProject) {
    return (
      <>
        <BuildingPortfolio
          projects={projects}
          currentUser={currentUser}
          onSelectProject={(id) => {
            setCurrentProjectId(id);
            setActiveTab('checklist');
          }}
          onOpenNewBuildingModal={() => setIsNewBuildingModalOpen(true)}
          onEditBuildingData={handleOpenEditBuilding}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onExportAllProjects={handleExportAllProjects}
          onImportProjectJson={handleImportJson}
          onLogout={() => {
            setCurrentUser(null);
            setCurrentProjectId(null);
          }}
        />

        {/* Modal de Cadastro de Nova Edificação */}
        <NewBuildingModal
          isOpen={isNewBuildingModalOpen}
          onClose={() => setIsNewBuildingModalOpen(false)}
          currentUser={currentUser}
          onCreateBuilding={handleCreateNewBuilding}
        />

        {/* Modal de Edição de Dados da Edificação */}
        {editingProjectTarget && (
          <BuildingDataModal
            building={editingProjectTarget.building}
            sectors={editingProjectTarget.sectors}
            isOpen={isBuildingModalOpen}
            onClose={() => {
              setIsBuildingModalOpen(false);
              setEditingProjectTarget(null);
            }}
            onSave={handleSaveBuildingData}
          />
        )}
      </>
    );
  }

  // 3. Workspace Completo da Edificação Ativa (Vistoria, Laudo, Plano, Relatório)
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Navbar Superior com Navegação e Seletor de Edificações */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBuildingModal={() => {
          setEditingProjectTarget(currentProject);
          setIsBuildingModalOpen(true);
        }}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onResetToDemo={handleResetToDemo}
        onExportJson={handleExportSingleProject}
        onImportJson={handleImportJson}
        onPrintLaudo={handlePrintLaudo}
        buildingName={currentProject.building.name}
        currentUser={currentUser}
        allProjects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={(id) => setCurrentProjectId(id)}
        onReturnToPortfolio={() => setCurrentProjectId(null)}
        onOpenNewBuildingModal={() => setIsNewBuildingModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentProjectId(null);
        }}
      />

      {/* Conteúdo Principal do Projeto Ativo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Painel de Métricas (visível em todas as telas exceto impressão) */}
        <div className="no-print">
          <DashboardStats
            items={currentProject.items}
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
              items={currentProject.items}
              sectors={currentProject.sectors || []}
              building={currentProject.building}
              onEditBuilding={() => {
                setEditingProjectTarget(currentProject);
                setIsBuildingModalOpen(true);
              }}
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onAddSector={handleAddSector}
              selectedFilterStatus={selectedFilterStatus}
              onClearFilterStatus={() => setSelectedFilterStatus('todos')}
            />
          </div>
        )}

        {activeTab === 'laudo' && (
          <LaudoTecnico
            project={currentProject}
            onUpdateProject={(updatedProjectOrUpdater) => {
              if (typeof updatedProjectOrUpdater === 'function') {
                handleUpdateCurrentProject(updatedProjectOrUpdater);
              } else {
                handleUpdateCurrentProject(() => updatedProjectOrUpdater);
              }
            }}
            onPrint={handlePrintLaudo}
            onEditBuilding={() => {
              setEditingProjectTarget(currentProject);
              setIsBuildingModalOpen(true);
            }}
          />
        )}

        {activeTab === 'plano' && (
          <div className="no-print">
            <PlanoDeAcao
              items={currentProject.items}
              onUpdateItem={handleUpdateItem}
              buildingName={currentProject.building.name}
            />
          </div>
        )}

        {activeTab === 'relatorio' && (
          <div className="no-print">
            <ExecutiveReport
              project={currentProject}
              onPrint={handlePrintLaudo}
            />
          </div>
        )}
      </main>

      {/* Rodapé institucional */}
      <footer className="no-print mt-auto border-t border-neutral-200 bg-white py-4 text-center text-xs text-neutral-500">
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

      {/* Modal de Configuração da Edificação Ativa / Selecionada */}
      {(editingProjectTarget || currentProject) && (
        <BuildingDataModal
          building={(editingProjectTarget || currentProject).building}
          sectors={(editingProjectTarget || currentProject).sectors}
          isOpen={isBuildingModalOpen}
          onClose={() => {
            setIsBuildingModalOpen(false);
            setEditingProjectTarget(null);
          }}
          onSave={handleSaveBuildingData}
        />
      )}

      {/* Modal de Criação de Nova Edificação */}
      <NewBuildingModal
        isOpen={isNewBuildingModalOpen}
        onClose={() => setIsNewBuildingModalOpen(false)}
        currentUser={currentUser}
        onCreateBuilding={handleCreateNewBuilding}
      />

      {/* Modal do Assistente de Normas NBR 9050 */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </div>
  );
}
