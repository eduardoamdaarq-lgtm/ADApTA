import React, { useState } from 'react';
import { BuildingData } from '../types/inspection';
import { X, Building2, UserCheck, ShieldCheck } from 'lucide-react';

interface BuildingDataModalProps {
  building: BuildingData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: BuildingData) => void;
}

export const BuildingDataModal: React.FC<BuildingDataModalProps> = ({
  building,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<BuildingData>({ ...building });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl border border-neutral-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-bold text-neutral-900">
              Dados do Imóvel & Responsabilidade Técnica
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Dados do Imóvel */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 border-b border-neutral-100 pb-1">
              1. Identificação da Edificação
            </h4>

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
          </div>

          {/* Dados do Contratante */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 border-b border-neutral-100 pb-1">
              2. Dados do Proprietário / Contratante
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

          {/* Dados do Perito / Responsável Técnico */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-blue-900 border-b border-neutral-100 pb-1">
              3. Responsável Técnico pelo Laudo (Perito)
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
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-xs cursor-pointer"
            >
              Salvar Dados Cadastrais
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
