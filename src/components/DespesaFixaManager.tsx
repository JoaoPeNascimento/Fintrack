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

  // Form State
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
        
        // At this point we could refetch, but let's just do a simple optimism or reload,
        // Actually, revalidatePath will handle the server-side, but client state needs update.
        // We can just refresh to keep it simple, or optimistically update.
        // Doing a simple refresh since the page will re-render due to revalidatePath
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
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 overflow-hidden transition-colors duration-300">
        
        {/* Accordion Header */}
        <button 
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 dark:text-rose-400">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Despesas Fixas
              <span className="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 text-xs py-1 px-2.5 rounded-full ml-2">
                {despesas.length}
              </span>
            </h2>
          </div>
          <div className={`transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>

        {/* Accordion Content */}
        <div className={`transition-all duration-500 ease-in-out ${isAccordionOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 sm:p-8 pt-0 border-t border-gray-100 dark:border-gray-700/50">
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
              Cadastre contas recorrentes como Água, Luz, Internet e Aluguel. Elas aparecerão automaticamente consolidadas todo mês.
            </p>

            {despesas.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhuma despesa fixa cadastrada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {despesas.map((despesa) => (
                  <div key={despesa._id} className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate pr-2">{despesa.name}</h4>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(despesa)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(despesa._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Excluir">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                    {despesa.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{despesa.description}</p>
                    )}
                    <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Valor Mensal</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesa.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={openNewModal}
              className="w-full py-4 border-2 border-dashed border-rose-300 dark:border-rose-700/50 rounded-xl text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center gap-2"
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
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {editingDespesaId ? 'Editar Despesa Fixa' : 'Cadastrar Despesa Fixa'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="despesaFixaForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Despesa</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Aluguel, Internet..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-shadow"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="Ex: 1500"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-shadow"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (Opcional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ex: Aluguel do apartamento 102"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-shadow resize-none"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button 
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="despesaFixaForm"
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-lg font-medium text-white shadow-sm transition-colors ${
                   isSubmitting ? 'bg-rose-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'
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
