import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils';
import { VIEWS } from '../constants';

export function Reports({
    setActiveView,
    reportType,
    setReportType,
    chartData,
    changeMonth,
    formattedMonth
}) {
    return (
        <div className="view-container">
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" onClick={() => setActiveView(VIEWS.MENU)}><ChevronLeft /></button>
                    <h2 className="text-2xl">Relatórios</h2>
                </div>
            </div>

            <div style={{ background: '#1e1e1e', padding: '4px', borderRadius: '12px', display: 'flex', marginBottom: '1rem' }}>
                <button
                    type="button"
                    className="btn"
                    style={{
                        flex: 1,
                        background: reportType === 'expense' ? '#333' : 'transparent',
                        color: reportType === 'expense' ? '#fff' : '#888',
                        border: 'none',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setReportType('expense')}
                >
                    Saídas
                </button>
                <button
                    type="button"
                    className="btn"
                    style={{
                        flex: 1,
                        background: reportType === 'income' ? '#333' : 'transparent',
                        color: reportType === 'income' ? '#fff' : '#888',
                        border: 'none',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setReportType('income')}
                >
                    Entradas
                </button>
            </div>

            {/* Date Navigation Mini */}
            <div className="flex-between" style={{ marginBottom: '1rem', padding: '0.5rem', background: '#1e1e1e', borderRadius: '8px' }}>
                <button className="btn-icon" onClick={() => changeMonth(-1)}><ChevronLeft size={16} /></button>
                <span className="text-xs font-medium" style={{ textTransform: 'capitalize' }}>{formattedMonth}</span>
                <button className="btn-icon" onClick={() => changeMonth(1)}><ChevronRight size={16} /></button>
            </div>

            <div className="card">
                <p className="card-title">{reportType === 'income' ? 'Fontes de Renda' : 'Despesas por Categoria'}</p>
                {chartData.length > 0 ? (
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e1e1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-center" style={{ height: '200px', flexDirection: 'column' }}>
                        <p className="text-secondary text-sm">Sem dados neste mês.</p>
                    </div>
                )}

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                    {chartData.map(d => (
                        <div key={d.name} className="flex-between">
                            <div className="flex-center" style={{ gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }}></div>
                                <span className="text-sm">{d.name}</span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(d.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
