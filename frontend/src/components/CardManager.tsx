"use client";

import React, { useState } from 'react';
import { createCard, updateCard, deleteCard } from '@/actions/card';
import toast from 'react-hot-toast';

export type CardColor = 'orange' | 'purple' | 'red' | 'blue' | 'yellow';

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: CardColor;
}

const colorStyles: Record<CardColor, string> = {
  orange: 'from-orange-500 to-amber-500',
  purple: 'from-purple-600 to-indigo-600',
  red: 'from-red-500 to-rose-600',
  blue: 'from-blue-500 to-cyan-500',
  yellow: 'from-yellow-400 to-yellow-600',
};

const CardManager = ({ initialCards = [] }: { initialCards?: CreditCard[] }) => {
  const [cards, setCards] = useState<CreditCard[]>(initialCards);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const openNewCardModal = () => {
    setEditingCardId(null);
    setFormData({ name: '', limit: '', closingDay: '', dueDay: '', color: 'purple' });
    setIsModalOpen(true);
  };

  const openEditCardModal = (card: CreditCard) => {
    setEditingCardId(card.id);
    setFormData({
      name: card.name,
      limit: card.limit.toString(),
      closingDay: card.closingDay.toString(),
      dueDay: card.dueDay.toString(),
      color: card.color,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCardId(null);
    setFormData({ name: '', limit: '', closingDay: '', dueDay: '', color: 'purple' });
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm("Certeza que deseja excluir este cartão?")) return;
    
    try {
      const response = await deleteCard(cardId);
      if (response.success) {
        toast.success(response.message || "Cartão deletado com sucesso.");
        setCards(cards.filter(c => c.id !== cardId));
      } else {
        toast.error(response.message || "Erro ao deletar cartão.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado ao deletar.");
      console.error(error);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    limit: '',
    closingDay: '',
    dueDay: '',
    color: 'purple' as CardColor,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.limit || !formData.closingDay || !formData.dueDay) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCardId) {
        const response = await updateCard(editingCardId, {
          name: formData.name,
          limit: parseFloat(formData.limit as string),
          closingDay: parseInt(formData.closingDay as string),
          dueDay: parseInt(formData.dueDay as string),
          color: formData.color,
        });

        if (response.success && response.card) {
          toast.success(response.message || "Cartão atualizado com sucesso!");
          
          setCards(cards.map(c => c.id === editingCardId ? {
            id: response.card._id || Math.random().toString(),
            name: response.card.name,
            limit: response.card.limit,
            closingDay: response.card.closingDay,
            dueDay: response.card.dueDay,
            color: response.card.color as CardColor,
          } : c));
          closeModal();
        } else {
          toast.error(response.message || "Erro ao atualizar cartão.");
        }
      } else {
        const response = await createCard({
          name: formData.name,
          limit: parseFloat(formData.limit as string),
          closingDay: parseInt(formData.closingDay as string),
          dueDay: parseInt(formData.dueDay as string),
          color: formData.color,
        });

        if (response.success && response.card) {
          toast.success(response.message || "Cartão salvo com sucesso!");
          
          const newCard: CreditCard = {
            id: response.card._id || Math.random().toString(),
            name: response.card.name,
            limit: response.card.limit,
            closingDay: response.card.closingDay,
            dueDay: response.card.dueDay,
            color: response.card.color as CardColor,
          };

          setCards([newCard, ...cards]);
          closeModal();
          
          if (!isAccordionOpen) setIsAccordionOpen(true);
        } else {
          toast.error(response.message || "Erro ao salvar cartão.");
        }
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
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
              Cartões de crédito
              <span className="badge num">{cards.length}</span>
            </h2>
            <p className="text-sm text-muted">Limites, fechamento e vencimento.</p>
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

            {cards.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted">
                Nenhum cartão cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {cards.map((card) => (
                  <div key={card.id} className={`p-5 rounded-xl bg-gradient-to-br ${colorStyles[card.color]} text-white relative overflow-hidden shadow-sm`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-xs font-medium tracking-widest text-white/70">CRÉDITO</div>
                      <div className="flex items-center gap-1 relative z-10">
                        <button onClick={() => openEditCardModal(card)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white/90 cursor-pointer" title="Editar" aria-label={`Editar ${card.name}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteCard(card.id)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white/90 cursor-pointer" title="Excluir" aria-label={`Excluir ${card.name}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>

                    <div className="text-base font-semibold truncate tracking-wide mb-1">
                      {card.name}
                    </div>

                    <div className="mt-4 flex justify-between items-end text-sm">
                      <div>
                        <div className="text-white/70 text-xs">Limite</div>
                        <div className="num font-semibold">
                          R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <div className="text-white/70 text-xs">Fecha</div>
                          <div className="num font-semibold">Dia {card.closingDay}</div>
                        </div>
                        <div>
                          <div className="text-white/70 text-xs">Vence</div>
                          <div className="num font-semibold">Dia {card.dueDay}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={openNewCardModal}
              className="w-full py-3 rounded-lg border border-dashed border-line text-sm font-medium text-primary hover:bg-surface-2 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Adicionar cartão
            </button>

          </div>
        </div>
      </div>

      {/* Modal / Dialog Formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="overlay" onClick={closeModal}></div>

          <div className="card relative w-full max-w-lg z-10 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl shadow-xl" role="dialog" aria-modal="true">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between">
              <h3 className="text-lg font-semibold text-fg">
                {editingCardId ? 'Editar cartão' : 'Novo cartão'}
              </h3>
              <button onClick={closeModal} className="icon-btn" aria-label="Fechar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Card Preview */}
              <div className="mb-6 flex justify-center">
                <div className={`w-full max-w-sm h-44 rounded-xl shadow-sm bg-gradient-to-br ${colorStyles[formData.color]} text-white relative overflow-hidden p-6 flex flex-col justify-between transition-all duration-300`}>
                  <div className="text-xs font-medium tracking-widest text-white/70">CRÉDITO</div>

                  <div className="text-lg font-semibold tracking-wide truncate">
                    {formData.name || 'Nome do cartão'}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="num text-sm font-medium">
                      R$ {formData.limit ? parseFloat(formData.limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </div>
                    <div className="num text-xs flex gap-3 text-right">
                       <div><span className="block text-white/60 text-[10px] uppercase">Fecha</span>{formData.closingDay || '--'}</div>
                       <div><span className="block text-white/60 text-[10px] uppercase">Vence</span>{formData.dueDay || '--'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <form id="cardForm" onSubmit={handleSaveCard} className="space-y-4">
                <div>
                  <label className="label">Nome do cartão</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Nubank, Itaú Black..."
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Limite (R$)</label>
                  <input
                    type="number"
                    name="limit"
                    value={formData.limit}
                    onChange={handleInputChange}
                    placeholder="Ex: 5000"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="input num"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Dia do fechamento</label>
                    <input
                      type="number"
                      name="closingDay"
                      value={formData.closingDay}
                      onChange={handleInputChange}
                      placeholder="Ex: 5"
                      min="1"
                      max="31"
                      className="input num"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Dia do vencimento</label>
                    <input
                      type="number"
                      name="dueDay"
                      value={formData.dueDay}
                      onChange={handleInputChange}
                      placeholder="Ex: 12"
                      min="1"
                      max="31"
                      className="input num"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Cor</label>
                  <div className="grid grid-cols-5 gap-3">
                    {(Object.keys(colorStyles) as CardColor[]).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`
                          h-10 rounded-lg bg-gradient-to-br ${colorStyles[color]}
                          flex items-center justify-center transition-all duration-150 cursor-pointer
                          ${formData.color === color ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary' : 'opacity-70 hover:opacity-100'}
                        `}
                        aria-label={`Selecionar cor ${color}`}
                        aria-pressed={formData.color === color}
                      >
                         {formData.color === color && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                         )}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-line flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="btn btn-ghost">
                Cancelar
              </button>
              <button type="submit" form="cardForm" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Salvando...' : 'Salvar cartão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CardManager;
