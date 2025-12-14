import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { VIEWS } from '../constants';
import { formatCurrency } from '../utils';

export function Budgets({
    setActiveView,
    categories,
    budgets,
    setBudgets,
    monthlyTransactions
}) {
    return (
        <div className="view-container">
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => setActiveView(VIEWS.MENU)}><ChevronLeft /></button>
                    <h2 className="text-2xl">Smart Budgets</h2>
                </div>

            </div>
            <p className="text-sm text-secondary" style={{ marginBottom: '1.5rem' }}>
                Defina limites mensais para suas categorias e mantenha o controle.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(categories.expense || []).map(cat => {
                    const limit = budgets[cat.id] || 0;
                    const spent = monthlyTransactions
                        .filter(t => t.category === cat.id && t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
                    let statusColor = '#4ade80'; // Green
                    if (percentage > 70) statusColor = '#facc15'; // Yellow
                    if (percentage > 90) statusColor = '#ef4444'; // Red
                    if (percentage > 100) statusColor = '#dc2626'; // Dark Red

                    return (
                        <div key={cat.id} className="card">
                            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                <div className="flex-center" style={{ gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                                    <span className="font-bold">{cat.label}</span>
                                </div>
                                {limit > 0 && (
                                    <span className="text-xs font-medium" style={{ color: statusColor }}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                )}
                            </div>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <div className="flex-between text-xs text-secondary" style={{ marginBottom: '4px' }}>
                                    <span>Gasto: {formatCurrency(spent)}</span>
                                    <span>Limite: {limit > 0 ? formatCurrency(limit) : 'Sem limite'}</span>
                                </div>
                                {limit > 0 && (
                                    <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${Math.min(percentage, 100)}%`,
                                                height: '100%',
                                                background: statusColor,
                                                transition: 'width 0.5s ease'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #333' }}>
                                <label className="text-xs text-secondary">Definir Limite Mensal:</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="number"
                                        placeholder="0,00"
                                        value={limit || ''}
                                        onChange={(e) => setBudgets({ ...budgets, [cat.id]: parseFloat(e.target.value) || 0 })}
                                        style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
