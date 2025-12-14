import { ChevronLeft, Plus, CreditCard, X, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { VIEWS } from '../constants';
import { formatCurrency } from '../utils';

export function Cards({
    setActiveView,
    cards,
    onCardCreated,
    onCardDeleted,
    onPayBill
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCard, setNewCard] = useState({ name: '', limit: '', closingDay: '', dueDay: '', color: '#3b82f6' });

    const handleCreateCard = async (e) => {
        e.preventDefault();
        if (!newCard.name || !newCard.limit || !newCard.closingDay || !newCard.dueDay) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const card = {
            id: Date.now().toString(),
            name: newCard.name,
            limit: parseFloat(newCard.limit),
            closingDay: parseInt(newCard.closingDay),
            dueDay: parseInt(newCard.dueDay),
            color: newCard.color
        };

        const success = await onCardCreated(card);
        if (success) {
            setNewCard({ name: '', limit: '', closingDay: '', dueDay: '', color: '#3b82f6' });
            setIsModalOpen(false);
        } else {
            alert('Erro ao criar cartão. Tente novamente.');
        }
    };

    const handleDeleteCard = async (id) => {
        if (confirm('Tem certeza? Isso não removerá as transações vinculadas.')) {
            await onCardDeleted(id);
        }
    };

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

    return (
        <div className="view-container">
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => setActiveView(VIEWS.MENU)}><ChevronLeft /></button>
                    <h2 className="text-2xl">Cartões</h2>
                </div>
                <button className="btn-icon" onClick={() => setIsModalOpen(true)} style={{ background: '#333', color: '#fff' }}>
                    <Plus size={20} />
                </button>
            </div>
            <p className="text-sm text-secondary" style={{ marginBottom: '1.5rem' }}>
                Gerencie seus cartões de crédito e limites.
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {cards.length === 0 ? (
                    <div className="flex-center" style={{ flexDirection: 'column', padding: '3rem', opacity: 0.5 }}>
                        <CreditCard size={48} className="text-secondary" style={{ marginBottom: '1rem' }} />
                        <p className="text-secondary">Nenhum cartão adicionado.</p>
                    </div>
                ) : (
                    cards.filter(c => c && c.id).map(card => (
                        <div key={card.id} className="card touch-effect" style={{
                            background: `linear-gradient(135deg, ${card.color}20 0%, #1e1e1e 100%)`,
                            border: `1px solid ${card.color}40`,
                            position: 'relative'
                        }}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '10px',
                                    background: card.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff'
                                }}>
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{card.name}</h3>
                                    <p className="text-xs text-secondary">
                                        Fecha dia {card.closingDay} • Vence dia {card.dueDay}
                                    </p>
                                </div>
                            </div>

                            {/* Billing Info */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <span className="text-xs text-secondary">Fatura Atual</span>
                                    <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                                        <span className="text-sm font-bold" style={{ color: card.currentBill > 0 ? '#fbbf24' : '#4ade80' }}>
                                            {formatCurrency(card.currentBill || 0)}
                                        </span>
                                        {card.currentBill > 0 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`Pagar fatura de ${formatCurrency(card.currentBill)}? Isso criará uma despesa no seu saldo.`)) {
                                                        onPayBill(card);
                                                    }
                                                }}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    marginTop: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Pagar
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {card.nextBill > 0 && (
                                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                        <span className="text-xs text-secondary">Próxima Fatura</span>
                                        <span className="text-xs font-medium text-secondary">
                                            {formatCurrency(card.nextBill || 0)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-between">
                                    <span className="text-xs text-secondary">Vencimento</span>
                                    <span className="text-xs font-medium">
                                        {card.billDueDate ? new Date(card.billDueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-between">
                                <div>
                                    <p className="text-xs text-secondary" style={{ marginBottom: '2px' }}>Limite Disponível</p>
                                    <p className="font-bold">{formatCurrency(card.availableLimit || 0)}</p>
                                </div>
                                <div className="text-end">
                                    <button
                                        className="btn-icon"
                                        style={{ color: '#ef4444' }}
                                        onClick={(e) => {
                                            console.log('🗑️ Clique no lixo detectado para cartão:', card.id);
                                            e.stopPropagation();
                                            handleDeleteCard(card.id);
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Add Card */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '400px', background: '#0a0a0a', border: '1px solid #333' }} onClick={e => e.stopPropagation()}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                            <h3 className="font-bold text-lg">Novo Cartão</h3>
                            <button className="btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="text-xs text-secondary">Nome do Cartão (ex: Nubank)</label>
                                <input
                                    className="input-field"
                                    placeholder="Nubank"
                                    value={newCard.name}
                                    onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label className="text-xs text-secondary">Limite Total (R$)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="5000"
                                    value={newCard.limit}
                                    onChange={e => setNewCard({ ...newCard, limit: e.target.value })}
                                />
                            </div>

                            <div className="flex-between" style={{ gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="text-xs text-secondary">Dia Fechamento</label>
                                    <input
                                        type="number" max="31" min="1"
                                        className="input-field"
                                        placeholder="1"
                                        value={newCard.closingDay}
                                        onChange={e => setNewCard({ ...newCard, closingDay: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="text-xs text-secondary">Dia Vencimento</label>
                                    <input
                                        type="number" max="31" min="1"
                                        className="input-field"
                                        placeholder="10"
                                        value={newCard.dueDay}
                                        onChange={e => setNewCard({ ...newCard, dueDay: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="text-xs text-secondary">Cor do Cartão</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setNewCard({ ...newCard, color: c })}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '50%', background: c,
                                                border: newCard.color === c ? '2px solid #fff' : '2px solid transparent',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                Criar Cartão
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
