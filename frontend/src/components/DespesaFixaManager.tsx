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

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const DespesaFixaManager = ({ initialDespesas = [], ownerId }: { initialDespesas?: DespesaFixa[]; ownerId?: string }) => {
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
      const response = await deleteDespesaFixa(id, ownerId);
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
      if (ownerId) formDataObj.append('ownerId', ownerId);
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
    <section className="card w-full overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
        aria-expanded={isAccordionOpen}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 text-left hover:bg-surface-2/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
              Despesas fixas
              <span className="badge num">{despesas.length}</span>
            </h2>
            <p className="text-sm text-muted">Contas que se repetem todo mês.</p>
          </div>
        </div>
        <svg className={`w-5 h-5 text-muted transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Content */}
      <div className={`grid transition-all duration-300 ease-in-out ${isAccordionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-5 sm:p-6 border-t border-line">
            <p className="text-sm text-muted mb-5">
              Cadastre contas recorrentes como água, luz, internet e aluguel. Elas entram automaticamente no total de cada mês.
            </p>

            {despesas.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted">
                Nenhuma despesa fixa cadastrada ainda.
              </div>
            ) : (
              <ul className="divide-y divide-line border border-line rounded-lg mb-5">
                {despesas.map((despesa) => (
                  <li key={despesa._id} className="group flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg truncate">{despesa.name}</p>
                      {despesa.description && (
                        <p className="text-xs text-muted truncate">{despesa.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="num text-sm font-semibold text-fg">
                        {currencyFormatter.format(despesa.value)}
                      </span>
                      <button onClick={() => openEditModal(despesa)} className="icon-btn hover:text-primary" title="Editar" aria-label={`Editar ${despesa.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(despesa._id)} className="icon-btn hover:text-danger" title="Excluir" aria-label={`Excluir ${despesa.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-4 px-4 py-3 bg-surface-2/60">
                  <span className="text-sm font-medium text-muted">Total mensal</span>
                  <span className="num text-sm font-semibold text-fg pr-[4.5rem]">
                    {currencyFormatter.format(despesas.reduce((acc, d) => acc + d.value, 0))}
                  </span>
                </li>
              </ul>
            )}

            <button
              onClick={openNewModal}
              className="w-full py-3 rounded-lg border border-dashed border-line text-sm font-medium text-primary hover:bg-surface-2 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Adicionar despesa fixa
            </button>

          </div>
        </div>
      </div>

      {/* Modal / Dialog Formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="overlay" onClick={closeModal}></div>

          <div className="card relative w-full max-w-md z-10 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl shadow-xl" role="dialog" aria-modal="true">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between">
              <h3 className="text-lg font-semibold text-fg">
                {editingDespesaId ? 'Editar despesa fixa' : 'Nova despesa fixa'}
              </h3>
              <button onClick={closeModal} className="icon-btn" aria-label="Fechar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="despesaFixaForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="label">Nome da despesa</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Aluguel, Internet..."
                    className="input"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="label">Valor mensal (R$)</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="Ex: 1500"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="input num"
                    required
                  />
                </div>

                <div>
                  <label className="label">Descrição <span className="font-normal text-muted">(opcional)</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ex: Aluguel do apartamento 102"
                    rows={3}
                    className="input resize-none"
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-line flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="btn btn-ghost">
                Cancelar
              </button>
              <button type="submit" form="despesaFixaForm" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Salvando...' : 'Salvar despesa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DespesaFixaManager;
