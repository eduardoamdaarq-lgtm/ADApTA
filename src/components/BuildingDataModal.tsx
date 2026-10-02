import React, { useState, useEffect } from 'react';
import { BuildingData, SectorDefinition, ProjectInspectionStatus } from '../types/inspection';
import { X, Building2, Layers, Plus, Trash2, CheckCircle2, ShieldCheck, Clock, Calendar, CheckCircle } from 'lucide-react';
import { PREESTABLISHED_SECTORS } from '../data/defaultChecklist';

interface BuildingDataModalProps {
  building: BuildingData;
  sectors?: SectorDefinition[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBuilding: BuildingData, updatedSectors?: SectorDefinition[]) => void;
}

export const BuildingDataModal: React.FC<BuildingDataModalProps> = ({
  building,
  sectors = [],
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<BuildingData>({ ...building });
  const [currentSectors, setCurrentSectors] = useState<SectorDefinition[]>([...sectors]);
  const [newCustomSectorName, setNewCustomSectorName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...building });
      setCurrentSectors([...sectors]);
    }
  }, [isOpen, building, sectors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, currentSectors);
    onClose();
  };

  const handleAddPreestablished = (pre: SectorDefinition) => {
    if (currentSectors.some(s => s.id === pre.id || s.name.toLowerCase() === pre.name.toLowerCase())) {
      return;
    }
    setCurrentSectors(prev => [...prev, { ...pre, createdAt: new Date().toISOString() }]);
  };

  const handleAddCustomSector = () => {
    const name = newCustomSectorName.trim();
    if (!name) return;
    const id = `setor_${Date.now()}`;
    const code = name.slice(0, 3).toUpperCase();
    setCurrentSectors(prev => [
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
    setCurrentSectors(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl border border-neutral-200 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-bold text-neutral-900">
              1. Identificação da Edificação &amp; 1.1 Setores
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Situação da Inspeção */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
            <label className="block font-bold text-neutral-900 text-xs">
              Situação da Inspeção da Edificação:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'em_andamento' })}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  (formData.status || 'em_andamento') === 'em_andamento'
                    ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Em Vistoria</span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-0.5">Sendo inspecionada atualmente</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'agendada' })}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  formData.status === 'agendada'
                    ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-blue-800 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Agendada</span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-0.5">Será inspecionada no futuro</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'concluida' })}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  formData.status === 'concluida'
                    ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Concluída</span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-0.5">Laudo e vistoria finalizados</p>
              </button>
            </div>
          </div>

          {/* 1. DADOS DA EDIFICAÇÃO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 flex items-center gap-1.5">
                <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded text-[10px]">1</span>
                <span>Identificação Geral da Edificação</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nome do Edifício / Imóvel
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nome Fantasia / Condomínio
                </label>
                <input
                  type="text"
                  value={formData.tradeName || ''}
                  onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">
                  Endereço Completo (Rua, Número, Bairro)
                </label>
                <input
                  type="text"
                  required
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
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Área Construída</label>
                <input
                  type="text"
                  value={formData.constructedArea}
                  onChange={e => setFormData({ ...formData, constructedArea: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
            </div>

            {/* Classificação da Edificação conforme Decreto Federal nº 5.296/2004 */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-md space-y-2 mt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <label className="block font-bold text-neutral-900 text-xs">
                  Classificação da Edificação (Decreto Federal nº 5.296 de 2004, Art. 8º)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Opção: Uso Coletivo */}
                <label className={`flex flex-col p-3 rounded-md border cursor-pointer transition-all ${
                  formData.classification === 'uso_coletivo'
                    ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white/70 border-neutral-200 hover:border-neutral-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="classification"
                      value="uso_coletivo"
                      checked={formData.classification === 'uso_coletivo'}
                      onChange={() => setFormData({ ...formData, classification: 'uso_coletivo' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-bold text-neutral-900 text-xs">Edificações de Uso Coletivo</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1.5 pl-5 leading-relaxed text-justify">
                    <strong>Definição Legal:</strong> aquelas destinadas às atividades de natureza comercial, hoteleira, cultural, esportiva, financeira, turística, recreativa, social, religiosa, educacional, industrial e de saúde, inclusive as edificações de prestação de serviços de atividades da mesma natureza.
                  </p>
                </label>

                {/* Opção: Uso Público */}
                <label className={`flex flex-col p-3 rounded-md border cursor-pointer transition-all ${
                  formData.classification === 'uso_publico'
                    ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white/70 border-neutral-200 hover:border-neutral-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="classification"
                      value="uso_publico"
                      checked={formData.classification === 'uso_publico'}
                      onChange={() => setFormData({ ...formData, classification: 'uso_publico' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-bold text-neutral-900 text-xs">Edificações de Uso Público</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-1.5 pl-5 leading-relaxed text-justify">
                    <strong>Definição Legal:</strong> aquelas administradas por entidades da administração pública, direta e indireta, ou por empresas prestadoras de serviços públicos e destinadas ao público em geral.
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* 1.1 SETORES DA EDIFICAÇÃO */}
          <div className="space-y-3 pt-3 border-t border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 flex items-center gap-1.5">
                <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded text-[10px]">1.1</span>
                <span>Setores da Edificação a Serem Inspecionados</span>
              </h4>
              <span className="text-[11px] text-neutral-500">
                {currentSectors.length} {currentSectors.length === 1 ? 'setor ativo' : 'setores ativos'}
              </span>
            </div>

            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Dentro de uma edificação pode haver múltiplos setores. Os setores podem ser selecionados a partir de modelos pré-estabelecidos ou criados de forma personalizada, inclusive <strong>após o início da inspeção</strong>.
            </p>

            {/* Setores Atuais na Edificação */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3">
              <div className="text-[11px] font-bold text-neutral-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-700" />
                <span>Setores Cadastrados para Vistoria:</span>
              </div>

              {currentSectors.length === 0 ? (
                <div className="text-neutral-500 italic text-[11px] py-1">
                  Nenhum setor cadastrado. Adicione setores abaixo para subdividir a inspeção predial.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentSectors.map(sec => (
                    <div
                      key={sec.id}
                      className="flex items-center gap-1.5 bg-white border border-neutral-300 rounded-md px-2.5 py-1 text-neutral-800 text-xs shadow-2xs group"
                    >
                      {sec.codePrefix && (
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1 rounded">
                          {sec.codePrefix}
                        </span>
                      )}
                      <span className="font-semibold">{sec.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSector(sec.id)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors ml-1 p-0.5 rounded cursor-pointer"
                        title="Remover este setor"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Setores Pré-estabelecidos sugeridos */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-neutral-700 text-[11px]">
                Adicionar Setores Pré-estabelecidos (Sugestões NBR 9050):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PREESTABLISHED_SECTORS.map(pre => {
                  const isAlreadyAdded = currentSectors.some(
                    s => s.id === pre.id || s.name.toLowerCase() === pre.name.toLowerCase()
                  );
                  return (
                    <button
                      key={pre.id}
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => handleAddPreestablished(pre)}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                        isAlreadyAdded
                          ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
                          : 'bg-white border-neutral-300 text-neutral-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50/50'
                      }`}
                      title={pre.description}
                    >
                      {isAlreadyAdded ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Plus className="w-3 h-3 text-blue-600" />
                      )}
                      <span>{pre.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inserir Novo Nome de Setor Personalizado */}
            <div className="pt-1">
              <label className="block font-semibold text-neutral-700 text-[11px] mb-1">
                Ou Inserir Novo Nome de Setor Personalizado:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Passeio Público, Acesso Principal, Estacionamento, Circulação Interna, Bloco B..."
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
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Setor</span>
                </button>
              </div>
            </div>
          </div>

          {/* DADOS DO CONTRATANTE */}
          <div className="space-y-3 pt-3 border-t border-neutral-200">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 border-b border-neutral-100 pb-1">
              Proprietário / Contratante
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Razão Social / Nome do Contratante
                </label>
                <input
                  type="text"
                  value={formData.contractorName}
                  onChange={e => setFormData({ ...formData, contractorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  CNPJ / CPF
                </label>
                <input
                  type="text"
                  value={formData.contractorCnpjCpf}
                  onChange={e => setFormData({ ...formData, contractorCnpjCpf: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* DADOS DO RESPONSÁVEL TÉCNICO */}
          <div className="space-y-3 pt-3 border-t border-neutral-200">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 border-b border-neutral-100 pb-1">
              Responsável Técnico pelo Laudo (Perito)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nome do Arquiteto(a) / Engenheiro(a)
                </label>
                <input
                  type="text"
                  required
                  value={formData.technicalManager}
                  onChange={e => setFormData({ ...formData, technicalManager: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Registro Profissional (CAU / CREA)
                </label>
                <input
                  type="text"
                  required
                  value={formData.technicalCouncilId}
                  onChange={e => setFormData({ ...formData, technicalCouncilId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Número do RRT / ART
                </label>
                <input
                  type="text"
                  required
                  value={formData.rrtArtNumber}
                  onChange={e => setFormData({ ...formData, rrtArtNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Data da Inspeção de Campo
              </label>
              <input
                type="date"
                required
                value={formData.inspectionDate}
                onChange={e => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full sm:w-48 px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs cursor-pointer"
            >
              Salvar Dados da Edificação &amp; Setores
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

