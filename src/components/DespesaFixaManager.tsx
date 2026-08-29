"use client";

import React, { useState } from 'react';
import { createDespesaFixa, deleteDespesaFixa } from '@/actions/despesaFixa';
import toast from 'react-hot-toast';

export interface DespesaFixa {
  _id: string;
  name: string;
  value: number;
  description?: string;
}

const DespesaFixaManager = ({ initialDespesas = [] }: { initialDespesas?: DespesaFixa[] }) => {
  const [despesas, setDespesas] = useState<DespesaFixa[]>(initialDespesas);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDespesaId, setEditingDespesaId] = useState<string | null>(null);

  const openNewModal = () => {
    setEditingDespesaId(null);
    setFormData({ name: '', value: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (despesa: DespesaFixa) => {
    setEditingDespesaId(despesa._id);
    setFormData({
      name: despesa.name,
      value: despesa.value.toString(),
      description: despesa.description || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDespesaId(null);
    setFormData({ name: '', value: '', description: '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Certeza que deseja excluir esta despesa fixa? Ela deixará de constar nos próximos meses.")) return;
    
    try {
      const response = await deleteDespesaFixa(id);
      if (response.success) {
        toast.success(response.message || "Despesa fixa deletada com sucesso.");
        setDespesas(despesas.filter(d => d._id !== id));
      } else {
        toast.error(response.message || "Erro ao deletar despesa.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado ao deletar.");
      console.error(error);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    value: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.value) {
      toast.error("Por favor, preencha o nome e o valor.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      if (editingDespesaId) formDataObj.append('id', editingDespesaId);
      formDataObj.append('name', formData.name);
      formDataObj.append('value', formData.value);
      if (formData.description) formDataObj.append('description', formData.description);

      const response = await createDespesaFixa({}, formDataObj);

      if (response.success) {
        toast.success(response.message || "Despesa salva com sucesso!");
        window.location.reload();
      } else {
        toast.error(response.message || "Erro ao salvar despesa.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Accordion Container */}
      <div className="clay-card-static clay-bg-pink overflow-hidden transition-colors duration-300">
        
        {/* Accordion Header */}
        <button 
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="clay-accordion-btn w-full flex items-center justify-between p-6 sm:p-8 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="clay-icon w-10 h-10 bg-gradient-to-br from-[#FF7EB3] to-[#FF9ECF] flex items-center justify-center rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-clay-primary flex items-center gap-2">
              Despesas Fixas
              <span className="clay-badge bg-[#FFF0F5] dark:bg-[#3A2338] text-[#FF7EB3] dark:text-[#ff9ecf] text-xs py-1 px-2.5 ml-2">
                {despesas.length}
              </span>
            </h2>
          </div>
          <div className={`transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
            <div className="clay-icon w-8 h-8 bg-[#FFF0F5] dark:bg-[#3A2338] flex items-center justify-center rounded-full text-[#FF7EB3] dark:text-[#ff9ecf]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </button>

        {/* Accordion Content */}
        <div className={`transition-all duration-500 ease-in-out ${isAccordionOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 sm:p-8 pt-0 border-t border-[#FF7EB3]/10">
            <p className="text-clay-secondary mb-6 font-medium">
              Cadastre contas recorrentes como Água, Luz, Internet e Aluguel. Elas aparecerão automaticamente consolidadas todo mês.
            </p>

            {despesas.length === 0 ? (
              <div className="text-center py-8 text-clay-secondary">
                Nenhuma despesa fixa cadastrada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {despesas.map((despesa) => (
                  <div key={despesa._id} className="clay-card clay-bg-dialog p-5 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-clay-primary truncate pr-2">{despesa.name}</h4>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(despesa)} className="p-1.5 text-[#7C5CFC] hover:bg-[#F0EDFF] rounded-md transition-colors cursor-pointer" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(despesa._id)} className="p-1.5 text-[#FF7EB3] hover:bg-[#FFF0F5] rounded-md transition-colors cursor-pointer" title="Excluir">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                    {despesa.description && (
                      <p className="text-sm text-clay-secondary mb-4 line-clamp-2">{despesa.description}</p>
                    )}
                    <div className="mt-auto pt-2 border-t border-[#FF7EB3]/10 flex justify-between items-center">
                      <span className="text-xs font-semibold text-clay-secondary uppercase tracking-wider">Valor Mensal</span>
                      <span className="font-bold text-[#FF7EB3] text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesa.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={openNewModal}
              className="clay-dashed w-full py-4 text-[#FF7EB3] dark:text-[#ff9ecf] font-semibold flex items-center justify-center gap-2 cursor-pointer"
              style={{ borderColor: 'rgba(255, 126, 179, 0.25)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Cadastrar Nova Despesa Fixa
            </button>
            
          </div>
        </div>
      </div>

      {/* Modal / Dialog Formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#2D2B55]/30 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          <div className="clay-modal clay-bg-dialog w-full max-w-md z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#FF7EB3]/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-clay-primary">
                {editingDespesaId ? 'Editar Despesa Fixa' : 'Cadastrar Despesa Fixa'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-clay-secondary hover:text-clay-primary transition-colors clay-icon w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FFF0F5] dark:hover:bg-[#3A2338] cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="despesaFixaForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-clay-primary mb-1">Nome da Despesa</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Aluguel, Internet..."
                    className="clay-input w-full px-4 py-2.5 text-clay-primary placeholder:text-clay-secondary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-clay-primary mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="Ex: 1500"
                    min="0"
                    step="0.01"
                    className="clay-input w-full px-4 py-2.5 text-clay-primary placeholder:text-clay-secondary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-clay-primary mb-1">Descrição (Opcional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ex: Aluguel do apartamento 102"
                    rows={3}
                    className="clay-input w-full px-4 py-2.5 text-clay-primary placeholder:text-clay-secondary/50 resize-none"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-[#FF7EB3]/10 flex justify-end gap-3 bg-[#FFF0F5]/30 dark:bg-[#3A2338]/30">
              <button 
                type="button"
                onClick={closeModal}
                className="clay-button px-5 py-2.5 font-medium text-clay-secondary bg-white/60 dark:bg-gray-800/60 hover:text-clay-primary cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="despesaFixaForm"
                disabled={isSubmitting}
                className={`clay-button px-5 py-2.5 font-medium text-white cursor-pointer ${
                   isSubmitting ? 'bg-[#FF7EB3]/50 cursor-not-allowed' : 'bg-gradient-to-r from-[#FF7EB3] to-[#FF9ECF]'
                }`}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Despesa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DespesaFixaManager;
