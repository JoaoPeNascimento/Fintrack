"use client";

import React, { useState } from 'react';
import { createCard, updateCard, deleteCard } from '@/actions/card';
import toast from 'react-hot-toast';

// Tipagem básica de um cartão
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

  // Form State
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
    <div className="w-full mb-8">
      {/* Accordion Container */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 overflow-hidden transition-colors duration-300">
        
        {/* Accordion Header */}
        <button 
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 dark:text-indigo-400">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Meus Cartões de Crédito
              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs py-1 px-2.5 rounded-full ml-2">
                {cards.length}
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
            
            {cards.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum cartão cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {cards.map((card) => (
                  <div key={card.id} className={`p-5 rounded-xl shadow-lg bg-gradient-to-br ${colorStyles[card.color]} text-white relative overflow-hidden group`}>
                     {/* Decorative background shapes for card effect */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10"></div>
                    <div className="absolute right-12 -top-6 w-16 h-16 rounded-full bg-white/10"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="font-medium tracking-widest text-white/80">CREDIT CARD</div>
                      <div className="flex items-center gap-2 relative z-10">
                        <button onClick={() => openEditCardModal(card)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors text-white" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteCard(card.id)} className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full backdrop-blur-sm transition-colors text-white" title="Excluir">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold truncate tracking-wider mb-1">
                      {card.name.toUpperCase()}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-end text-sm">
                      <div>
                        <div className="text-white/70 text-xs">Limite</div>
                        <div className="font-semibold">
                          R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <div className="text-white/70 text-xs">Fecha</div>
                          <div className="font-semibold">Dia {card.closingDay}</div>
                        </div>
                        <div>
                          <div className="text-white/70 text-xs">Vence</div>
                          <div className="font-semibold">Dia {card.dueDay}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={openNewCardModal}
              className="w-full py-4 border-2 border-dashed border-indigo-300 dark:border-indigo-700/50 rounded-xl text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Cadastrar Novo Cartão
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
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {editingCardId ? 'Editar Cartão' : 'Cadastrar Novo Cartão'}
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
              {/* Card Preview */}
              <div className="mb-6 flex justify-center">
                <div className={`w-full max-w-sm h-48 rounded-xl shadow-lg bg-gradient-to-br ${colorStyles[formData.color]} text-white relative overflow-hidden group p-6 flex flex-col justify-between transition-all duration-300`}>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10"></div>
                  <div className="absolute right-12 -top-6 w-20 h-20 rounded-full bg-white/10"></div>
                  
                  <div className="flex justify-between items-start">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
                        <rect x="2" y="5" width="44" height="22" rx="4" fill="none"></rect>
                        <line x1="2" y1="12" x2="46" y2="12"></line>
                      </svg>
                  </div>
                  
                  <div className="flex-1 flex items-center">
                     <div className="text-xl font-bold tracking-widest truncate opacity-90">
                       {formData.name ? formData.name.toUpperCase() : 'NOME DO CARTÃO'}
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-sm font-medium">
                      R$ {formData.limit ? parseFloat(formData.limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </div>
                    <div className="text-xs uppercase opacity-80 flex gap-3 text-right">
                       <div><span className="block opacity-60 text-[10px]">Fecha</span>{formData.closingDay || '--'}</div>
                       <div><span className="block opacity-60 text-[10px]">Vence</span>{formData.dueDay || '--'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <form id="cardForm" onSubmit={handleSaveCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Cartão (Apelido)</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Nubank, Itaú Black..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite do Cartão (R$)</label>
                  <input
                    type="number"
                    name="limit"
                    value={formData.limit}
                    onChange={handleInputChange}
                    placeholder="Ex: 5000"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dia do Fechamento</label>
                    <input
                      type="number"
                      name="closingDay"
                      value={formData.closingDay}
                      onChange={handleInputChange}
                      placeholder="Ex: 5"
                      min="1"
                      max="31"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dia do Vencimento</label>
                    <input
                      type="number"
                      name="dueDay"
                      value={formData.dueDay}
                      onChange={handleInputChange}
                      placeholder="Ex: 12"
                      min="1"
                      max="31"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor de Personalização</label>
                  <div className="grid grid-cols-5 gap-3">
                    {(Object.keys(colorStyles) as CardColor[]).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`
                          h-12 rounded-lg bg-gradient-to-br ${colorStyles[color]} 
                          flex items-center justify-center transition-all duration-200
                          ${formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900 scale-105 shadow-md' : 'opacity-70 hover:opacity-100'}
                        `}
                        aria-label={`Selecionar cor ${color}`}
                      >
                         {formData.color === color && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-md">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                         )}
                      </button>
                    ))}
                  </div>
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
                form="cardForm"
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-lg font-medium text-white shadow-sm transition-colors ${
                   isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Cartão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardManager;
