import { ChevronLeft, ChevronRight, Wallet, Trash2, CreditCard, Edit2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { formatCurrency } from '../utils';

export function Extract({
    monthlyTransactions,
    categories,
    cards = [],
    toggleStatus,
    handleDelete,
    changeMonth,
    formattedMonth,
    onPayBill,
    onEditTransaction
}) {

    const groupedTransactions = useMemo(() => {
        const groups = {};
        monthlyTransactions.forEach(t => {
            const date = t.date.split('T')[0]; // Ensure YYYY-MM-DD
            if (!groups[date]) groups[date] = [];
            groups[date].push(t);
        });

        return Object.keys(groups)
            .sort((a, b) => new Date(b) - new Date(a))
            .map(date => ({
                date,
                items: groups[date]
            }));
    }, [monthlyTransactions]);

    const formatDateHeader = (dateStr) => {
        const date = new Date(dateStr + 'T12:00:00');
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Hoje';
        if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
        <div className="view-container">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h2 className="text-2xl">Extrato</h2>
                <div className="flex-center" style={{ gap: '1rem', color: 'var(--text-secondary)' }}>
                    <span className="text-sm" style={{ textTransform: 'capitalize' }}>{formattedMonth}</span>
                </div>
            </div>

            {/* Date Navigation Mini */}
            <div className="flex-between" style={{ marginBottom: '1.5rem', padding: '0.5rem', background: '#1e1e1e', borderRadius: '12px' }}>
                <button className="btn-icon" onClick={() => changeMonth(-1)}><ChevronLeft size={16} /></button>
                <span className="text-sm font-bold" style={{ textTransform: 'capitalize' }}>{formattedMonth}</span>
                <button className="btn-icon" onClick={() => changeMonth(1)}><ChevronRight size={16} /></button>
            </div>

            <div className="transactions-list" style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {monthlyTransactions.length === 0 ? (
                    <div className="card flex-center" style={{ padding: '3rem', flexDirection: 'column', background: 'transparent', border: 'none' }}>
                        <Wallet size={48} className="text-secondary" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p className="text-secondary text-sm">Nada por aqui ainda.</p>
                    </div>
                ) : (
                    groupedTransactions.map(group => (
                        <div key={group.date} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <h3 style={{
                                fontSize: '0.9rem',
                                color: '#888',
                                marginBottom: '0.5rem',
                                paddingLeft: '4px',
                                textTransform: 'capitalize',
                                fontWeight: '600',
                                letterSpacing: '0.5px'
                            }}>
                                {formatDateHeader(group.date)}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {group.items.map((t, index) => {
                                    const relevantCats = categories[t.type] || [];
                                    const cat = relevantCats.find(c => c.id === t.category) || { icon: '❓', label: 'Desconhecido', color: '#666' };
                                    const isIncome = t.type === 'income';

                                    return (
                                        <div
                                            key={t.id}
                                            className="list-item-glow"
                                            onClick={() => {
                                                if (onEditTransaction) onEditTransaction(t);
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                                padding: '12px 4px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderBottom: index < group.items.length - 1 ? '1px solid #1a1a1a' : 'none'
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {/* Icon with Color Background */}
                                                <div style={{
                                                    width: '42px', height: '42px',
                                                    borderRadius: '50%',
                                                    background: `rgba(${parseInt(cat.color?.slice(1, 3), 16) || 50}, ${parseInt(cat.color?.slice(3, 5), 16) || 50}, ${parseInt(cat.color?.slice(5, 7), 16) || 50}, 0.15)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.2rem',
                                                    color: cat.color || '#fff'
                                                }}>
                                                    {cat.icon}
                                                </div>

                                                <div className="flex-col" style={{ gap: '2px' }}>
                                                    <p className="font-medium" style={{ fontSize: '0.95rem', color: '#e5e5e5' }}>{t.description}</p>

                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                        <span className="text-xs" style={{ color: '#666' }}>{cat.label}</span>

                                                        {t.cardId && cards.length > 0 && (() => {
                                                            const card = cards.find(c => c.id === t.cardId);
                                                            return card ? (
                                                                <>
                                                                    <span style={{ color: '#333', fontSize: '10px' }}>•</span>
                                                                    <CreditCard size={10} style={{ color: card.color || '#666' }} />
                                                                    <span className="text-xs" style={{ color: '#666' }}>{card.name}</span>
                                                                </>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                                <span style={{
                                                    fontWeight: '600',
                                                    fontSize: '1.05rem',
                                                    color: isIncome ? '#4ade80' : (t.isVirtual ? '#fbbf24' : '#fff'),
                                                    letterSpacing: '-0.02em'
                                                }}>
                                                    {isIncome ? '+' : '-'} {formatCurrency(t.amount).replace('R$', '').trim()}
                                                </span>

                                                {/* Status Dot */}
                                                {t.isVirtual ? (
                                                    <span className="text-xs" style={{ color: '#fbbf24' }}>Previsto</span>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleStatus(t.id, t.status);
                                                            }}
                                                            style={{
                                                                width: '6px', height: '6px',
                                                                borderRadius: '50%',
                                                                background: t.status === 'paid' ? '#4ade80' : '#444',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                        <span className="text-xs" style={{ color: t.status === 'paid' ? '#4ade80' : '#666', opacity: 0.8 }}>
                                                            {t.status === 'paid' ? 'Pago' : 'Pendente'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
