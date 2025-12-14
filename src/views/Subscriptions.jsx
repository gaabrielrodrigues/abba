import React from 'react';
import { ChevronLeft, Zap } from 'lucide-react';
import { VIEWS } from '../constants';
import { formatCurrency } from '../utils';

export function Subscriptions({
    setActiveView,
    possibleSubscriptions
}) {
    return (
        <div className="view-container">
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => setActiveView(VIEWS.MENU)}><ChevronLeft /></button>
                    <h2 className="text-2xl">Assinaturas</h2>
                </div>

            </div>
            <p className="text-sm text-secondary" style={{ marginBottom: '1.5rem' }}>
                Gastos recorrentes identificados automaticamente.
            </p>

            {possibleSubscriptions.length === 0 ? (
                <div className="flex-center" style={{ flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
                    <Zap size={48} className="text-secondary" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p className="text-secondary">Nenhuma assinatura detectada ainda.</p>
                    <p className="text-xs text-secondary" style={{ marginTop: '0.5rem' }}>O sistema aprende com seus gastos recorrentes.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {possibleSubscriptions.map((sub, idx) => (
                        <div key={idx} className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '50px', height: '50px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #333 0%, #000 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #333'
                            }}>
                                <span style={{ fontSize: '1.5rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    {sub.description.charAt(0)}
                                </span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 className="font-bold">{sub.description}</h4>
                                <p className="text-xs text-secondary">Estimado mensalmente</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">{formatCurrency(sub.amount)}</p>
                                <span className="text-xs text-secondary" style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>
                                    Mensal
                                </span>
                            </div>
                        </div>
                    ))}

                    <div className="card" style={{ marginTop: '1rem', background: '#1e1e1e', services: 'center', textAlign: 'center' }}>
                        <p className="text-sm font-bold">Total em Assinaturas</p>
                        <p className="text-2xl text-primary">
                            {formatCurrency(possibleSubscriptions.reduce((acc, s) => acc + s.amount, 0))}
                            <span className="text-xs text-secondary" style={{ marginLeft: '4px' }}>/mês</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
