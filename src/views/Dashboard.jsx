import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { VIEWS } from '../constants';
import { formatCurrency } from '../utils';

export function Dashboard({
    setActiveView,
    generalBalance,
    changeMonth,
    formattedMonth,
    monthlyStats
}) {
    return (
        <div className="view-container no-scroll">
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <img src="/icon.svg" alt="logo" width="28" height="28" />
                    <h1 className="text-lg font-bold">Abba</h1>
                </div>
            </div>

            {/* General Balance Card */}
            <div
                className="card touch-effect"
                onClick={() => setActiveView(VIEWS.EXTRACT)}
                style={{
                    background: 'linear-gradient(135deg, #1e1e1e 0%, #000 100%)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <p className="card-title" style={{ color: 'rgba(255,255,255,0.7)' }}>Saldo Geral</p>
                        <h2 className="text-3xl" style={{ marginTop: '0.5rem' }}>{formatCurrency(generalBalance)}</h2>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        padding: '8px',
                        display: 'flex', alignItems: 'center', justifyItems: 'center'
                    }}>
                        <ArrowRight size={20} style={{ transform: 'rotate(-45deg)' }} />
                    </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="text-xs" style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', color: '#fff' }}>
                        Atual
                    </span>
                    <span className="text-xs text-secondary">Toque para ver extrato</span>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex-between" style={{ padding: '0 0.5rem' }}>
                <button className="btn-icon" onClick={() => changeMonth(-1)}><ChevronLeft /></button>
                <span className="font-medium" style={{ textTransform: 'capitalize' }}>{formattedMonth}</span>
                <button className="btn-icon" onClick={() => changeMonth(1)}><ChevronRight /></button>
            </div>

            {/* Monthly Summary */}
            <div className="card">
                <p className="card-title" style={{ marginBottom: '1rem' }}>Resumo do Mês</p>
                <div className="flex-between" style={{ gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                            <ArrowUpCircle size={16} className="text-secondary" />
                            <span className="text-xs text-secondary">Entradas</span>
                        </div>
                        <p className="text-lg font-medium">{formatCurrency(monthlyStats.income)}</p>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)', height: '40px' }} />
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                            <span className="text-xs text-secondary">Saídas</span>
                            <ArrowDownCircle size={16} className="text-secondary" />
                        </div>
                        <p className="text-lg font-medium">{formatCurrency(monthlyStats.expense)}</p>
                    </div>
                </div>
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div className="flex-between">
                        <span className="text-sm font-medium">Resultado</span>
                        <span className={`text-lg font-bold ${monthlyStats.balance >= 0 ? 'text-primary' : 'text-secondary'}`}>
                            {monthlyStats.balance > 0 ? '+' : ''}{formatCurrency(monthlyStats.balance)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
