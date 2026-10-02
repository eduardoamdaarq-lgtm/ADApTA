import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Plus, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle,
  FileCheck2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { BuildingData, SectorDefinition, ProjectInspectionStatus, UserProfile } from '../types/inspection';
import { PREESTABLISHED_SECTORS } from '../data/defaultChecklist';

interface NewBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCreateBuilding: (
    building: BuildingData, 
    sectors: SectorDefinition[], 
    templateMode: 'standard' | 'blank'
  ) => void;
}

export const NewBuildingModal: React.FC<NewBuildingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateBuilding,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<BuildingData>({
    name: '',
    tradeName: '',
    type: 'Comercial e Serviços',
    classification: 'uso_coletivo',
    address: '',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '',
    constructedArea: '',
    floorsCount: 1,
    contractorName: '',
    contractorCnpjCpf: '',
    technicalManager: currentUser.name || 'Arq. Eduardo M. Almeida',
    technicalCouncilId: currentUser.cau || 'CAU/SP nº A145892-3',
    rrtArtNumber: currentUser.rrtArtDefault || `RRT nº ${new Date().getFullYear()}/${Math.floor(1000000 + Math.random() * 9000000)}-SP`,
    inspectionDate: today,
    status: 'em_andamento',
  });

  const [status, setStatus] = useState<ProjectInspectionStatus>('em_andamento');
  const [templateMode, setTemplateMode] = useState<'standard' | 'blank'>('standard');
  const [selectedSectors, setSelectedSectors] = useState<SectorDefinition[]>([...PREESTABLISHED_SECTORS]);
  const [newCustomSectorName, setNewCustomSectorName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTogglePreSector = (sec: SectorDefinition) => {
    setValidationError(null);
    if (selectedSectors.some(s => s.id === sec.id)) {
      setSelectedSectors(prev => prev.filter(s => s.id !== sec.id));
    } else {
      setSelectedSectors(prev => [...prev, sec]);
    }
  };

  const handleAddCustomSector = () => {
    const name = newCustomSectorName.trim();
    if (!name) return;
    setValidationError(null);
    const id = `setor_${Date.now()}`;
    const code = name.slice(0, 3).toUpperCase();
    setSelectedSectors(prev => [
      ...prev,
      {
        id,
        name,
        codePrefix: code,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewCustomSectorName('');
  };

  const handleRemoveSector = (id: string) => {
    setSelectedSectors(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Por favor, informe o nome da edificação.');
      return;
    }
    if (selectedSectors.length === 0) {
      setValidationError('Por favor, selecione ao menos um setor para a vistoria da edificação.');
      return;
    }
    setValidationError(null);

    onCreateBuilding(
      {
        ...formData,
        status,
      },
      selectedSectors,
      templateMode
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl border border-neutral-200 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">
                Cadastrar Nova Edificação
              </h3>
              <p className="text-xs text-neutral-500">
                Uma nova vistoria, laudo ABNT, plano de ação e relatório executivo serão vinculados a este imóvel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}
          
          {/* Status Inicial da Inspeção */}
          <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
            <label className="block font-bold text-neutral-900 text-xs">
              Situação da Inspeção desta Edificação:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setStatus('em_andamento');
                  setFormData(prev => ({ ...prev, status: 'em_andamento' }));
                }}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  status === 'em_andamento'
                    ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-amber-800 text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Em Vistoria</span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Está sendo inspecionada atualmente.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('agendada');
                  setFormData(prev => ({ ...prev, status: 'agendada' }));
                }}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  status === 'agendada'
                    ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-blue-800 text-xs">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Agendada</span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Será inspecionada em data futura.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('concluida');
                  setFormData(prev => ({ ...prev, status: 'concluida' }));
                }}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  status === 'concluida'
                    ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Concluída</span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Já foi inspecionada / laudo emitido.
                </p>
              </button>
            </div>
          </div>

          {/* 1. DADOS DA EDIFICAÇÃO */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 flex items-center gap-1.5 border-b border-neutral-200 pb-1.5">
              <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded text-[10px]">1</span>
              <span>Identificação Geral do Imóvel</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nome do Edifício / Imóvel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Condomínio Edifício Horizon Tower"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nome Fantasia / Condomínio
                </label>
                <input
                  type="text"
                  placeholder="Ex: Horizon Corporate Center"
                  value={formData.tradeName || ''}
                  onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">
                  Endereço Completo (Logradouro, Número, Bairro) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  placeholder="01452-000"
                  value={formData.zipCode}
                  onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">UF</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs uppercase bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Tipologia / Uso</label>
                <input
                  type="text"
                  placeholder="Ex: Comercial, Saúde, Educação"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Área Construída</label>
                <input
                  type="text"
                  placeholder="Ex: 5.200 m²"
                  value={formData.constructedArea}
                  onChange={e => setFormData({ ...formData, constructedArea: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
            </div>

            {/* Classificação da Edificação Decreto nº 5.296/2004 */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Classificação Legal (Decreto Federal nº 5.296/2004, Art. 8º):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className={`flex items-start gap-2 p-2.5 rounded-md border cursor-pointer ${
                  formData.classification === 'uso_coletivo'
                    ? 'bg-white border-blue-600 ring-1 ring-blue-500 shadow-xs'
                    : 'bg-white/60 border-neutral-200'
                }`}>
                  <input
                    type="radio"
                    name="classification"
                    value="uso_coletivo"
                    checked={formData.classification === 'uso_coletivo'}
                    onChange={() => setFormData({ ...formData, classification: 'uso_coletivo' })}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs">Uso Coletivo</span>
                    <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">
                      Comercial, serviços, hotelaria, saúde privada, educação, etc.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-2 p-2.5 rounded-md border cursor-pointer ${
                  formData.classification === 'uso_publico'
                    ? 'bg-white border-blue-600 ring-1 ring-blue-500 shadow-xs'
                    : 'bg-white/60 border-neutral-200'
                }`}>
                  <input
                    type="radio"
                    name="classification"
                    value="uso_publico"
                    checked={formData.classification === 'uso_publico'}
                    onChange={() => setFormData({ ...formData, classification: 'uso_publico' })}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs">Uso Público</span>
                    <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">
                      Administração pública direta/indireta ou concessionárias de serviço público.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 1.1 SETORES DA EDIFICAÇÃO */}
          <div className="space-y-3 pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 flex items-center gap-1.5">
                <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded text-[10px]">1.1</span>
                <span>Setores da Edificação a Inspecionar</span>
              </h4>
              <span className="text-[11px] text-neutral-500">
                {selectedSectors.length} selecionados
              </span>
            </div>

            {/* Setores Selecionados */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
              <div className="text-[11px] font-bold text-neutral-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-700" />
                <span>Setores Inclusos nesta Edificação:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedSectors.map(sec => (
                  <span
                    key={sec.id}
                    className="inline-flex items-center gap-1 bg-white border border-neutral-300 rounded px-2 py-0.5 text-[11px] text-neutral-800"
                  >
                    <span className="font-mono font-bold text-blue-700">{sec.codePrefix || 'SET'}</span>
                    <span>{sec.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSector(sec.id)}
                      className="text-neutral-400 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sugestões Rápidas */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-neutral-600">
                Adicionar / Alternar Setores Sugeridos NBR 9050:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PREESTABLISHED_SECTORS.map(pre => {
                  const isChecked = selectedSectors.some(s => s.id === pre.id);
                  return (
                    <button
                      key={pre.id}
                      type="button"
                      onClick={() => handleTogglePreSector(pre)}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50 text-blue-800 border-blue-300 font-semibold'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {isChecked ? <CheckCircle2 className="w-3 h-3 text-blue-600" /> : <Plus className="w-3 h-3 text-neutral-400" />}
                      <span>{pre.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Setor customizado */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Ou digite o nome de outro setor específico (ex: Subsolo 1, Terraço, Bloco Anexo...)"
                value={newCustomSectorName}
                onChange={e => setNewCustomSectorName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSector();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomSector}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Checklist Modelo Inicial */}
          <div className="space-y-2 pt-2 border-t border-neutral-200">
            <label className="block font-bold text-neutral-900 text-xs">
              Checklist Inicial de Itens de Vistoria:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className={`p-3 rounded-lg border cursor-pointer transition-all ${
                templateMode === 'standard'
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400/20'
                  : 'bg-white border-neutral-200'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="templateMode"
                    value="standard"
                    checked={templateMode === 'standard'}
                    onChange={() => setTemplateMode('standard')}
                    className="text-blue-600"
                  />
                  <span className="font-bold text-xs text-neutral-900">Checklist Base NBR 9050 Completo</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 pl-5 leading-tight">
                  Carrega automaticamente os itens normativos de calçada, portas, rampas, sanitários PCD e piso tátil para preenchimento.
                </p>
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer transition-all ${
                templateMode === 'blank'
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400/20'
                  : 'bg-white border-neutral-200'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="templateMode"
                    value="blank"
                    checked={templateMode === 'blank'}
                    onChange={() => setTemplateMode('blank')}
                    className="text-blue-600"
                  />
                  <span className="font-bold text-xs text-neutral-900">Checklist em Branco</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 pl-5 leading-tight">
                  Inicia sem itens prévios para inserção 100% manual item por item durante a vistoria.
                </p>
              </label>
            </div>
          </div>

          {/* Dados do Contratante e Perito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Contratante / Proprietário
              </label>
              <input
                type="text"
                placeholder="Ex: Condomínio Edifício Horizon / Administradora"
                value={formData.contractorName}
                onChange={e => setFormData({ ...formData, contractorName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Data Prevista / Realizada da Vistoria *
              </label>
              <input
                type="date"
                required
                value={formData.inspectionDate}
                onChange={e => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Ações */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <span className="text-[11px] text-neutral-500 italic">
              * As outras edificações já cadastradas permanecerão intactas no seu portfólio.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar e Iniciar Vistoria</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
