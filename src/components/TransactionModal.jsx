import { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, ArrowRight, CheckCircle2, Delete, CreditCard } from 'lucide-react';
import { CategoryModal } from './CategoryModal';
import { API_BASE } from '../constants';

export function TransactionModal({ isOpen, onClose, onSuccess, categories = { income: [], expense: [] }, cards = [], onCategoryCreated, initialData = null }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('0');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('other');
    const [status, setStatus] = useState('paid');
    const [selectedCardId, setSelectedCardId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState('installments');
    const [recurrenceCount, setRecurrenceCount] = useState(12);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);

    // Safety: ensure type is valid option for categories, defaulting if needed
    // However, if categories is empty/loading, handle gracefully
    const currentCategories = categories && categories[type] ? categories[type] : [];

    useEffect(() => {
        if (initialData && isOpen) {
            setDescription(initialData.description || '');
            setAmount(initialData.amount ? (initialData.amount * 100).toString() : '0');
            setType(initialData.type || 'expense');
            setCategory(initialData.category || 'other');
            // Logic to deduce 'credit' status if cardId is present
            if (initialData.cardId) {
                setStatus('credit');
                setSelectedCardId(initialData.cardId);
            } else {
                setStatus(initialData.status === 'pending' ? 'pending' : 'paid');
                setSelectedCardId('');
            }
            setDate(initialData.date || new Date().toISOString().split('T')[0]);
            setIsRecurrent(initialData.isRecurrent || false);
        } else if (!initialData && isOpen) {
            // Reset fields for new transaction
            setDescription('');
            setAmount('');
            setType('expense');
            setCategory('other');
            setStatus('paid');
            setSelectedCardId('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsRecurrent(false);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!description || !amount || !date) return;

        // Validate card selection for credit transactions
        // Exception: allows editing to save even if cardId mismatch if not changing type
        if (status === 'credit' && !selectedCardId) {
            alert('Por favor, selecione um cartão de crédito.');
            return;
        }

        const finalStatus = status === 'credit' ? 'pending' : status;

        const transactionData = {
            description,
            amount: parseFloat(amount) / 100,
            type,
            category,
            status: finalStatus,
            date,
            cardId: status === 'credit' ? selectedCardId : null,
            isRecurrent,
            recurrenceType,
            recurrenceCount: recurrenceType === 'installments' ? recurrenceCount : null
        };

        console.log('📤 Enviando transação:', transactionData);

        try {
            let response;
            if (initialData && initialData.id) {
                // UPDATE
                response = await fetch(`${API_BASE}/transactions/${initialData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionData)
                });
            } else {
                // CREATE
                response = await fetch(`${API_BASE}/transactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionData)
                });
            }

            if (response.ok) {
                const savedTransaction = await response.json();
                onSuccess(savedTransaction);
                onClose();
                // Reset handled by useEffect
            } else {
                console.error('Error saving:', response.status);
                alert('Erro ao salvar transação.');
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Erro de conexão ao salvar.');
        }
    };

    return (
        <>
            <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0 }} onClick={onClose}>
                <div className="card animate-fade-in" style={{
                    width: '100%',
                    height: '92vh',
                    maxWidth: '100%',
                    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                    borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                    padding: '1.5rem',
                    background: '#0a0a0a',
                    display: 'flex', flexDirection: 'column'
                }} onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="flex-between" style={{ marginBottom: '2rem' }}>
                        <button className="btn-icon" onClick={onClose} style={{ background: '#1e1e1e', color: '#fff' }}>
                            <X size={20} />
                        </button>
                        <h3 className="font-bold">Nova Transação</h3>
                        <div style={{ width: '40px' }}></div>
                    </div>

                    <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

                        {/* Amount Display & Status Toggle */}
                        <div style={{ textAlign: 'center', marginBottom: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                            <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '1rem' }}>
                                {/* STATUS & TYPE TOGGLE */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                    {type === 'expense' ? (
                                        <>
                                            <div style={{ background: '#1e1e1e', borderRadius: '20px', padding: '4px', display: 'flex', gap: '4px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setStatus('paid')}
                                                    style={{
                                                        padding: '6px 12px', borderRadius: '16px', border: 'none', fontSize: '0.8rem', fontWeight: '600',
                                                        background: (status === 'paid' || status === 'pending') ? '#fff' : 'transparent',
                                                        color: (status === 'paid' || status === 'pending') ? '#000' : '#888'
                                                    }}
                                                >
                                                    Saldo
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setStatus('credit')}
                                                    style={{
                                                        padding: '6px 12px', borderRadius: '16px', border: 'none', fontSize: '0.8rem', fontWeight: '600',
                                                        background: status === 'credit' ? '#fff' : 'transparent',
                                                        color: status === 'credit' ? '#000' : '#888'
                                                    }}
                                                >
                                                    Crédito
                                                </button>
                                            </div>

                                            {(status === 'paid' || status === 'pending') && (
                                                <div
                                                    onClick={() => setStatus(status === 'paid' ? 'pending' : 'paid')}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                        fontSize: '0.8rem', color: '#ccc', cursor: 'pointer',
                                                        padding: '6px 12px', borderRadius: '8px', border: '1px solid #333',
                                                        background: '#111'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '14px', height: '14px', borderRadius: '50%',
                                                        border: status === 'paid' ? '4px solid #4ade80' : '2px solid #666',
                                                        background: status === 'paid' ? '#fff' : 'transparent'
                                                    }} />
                                                    <span>{status === 'paid' ? 'Pago' : 'Pendente'}</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                                            <span className="text-sm text-secondary" style={{ background: '#1e1e1e', padding: '6px 12px', borderRadius: '16px' }}>
                                                Entrada
                                            </span>
                                            <div
                                                onClick={() => setStatus(status === 'paid' ? 'pending' : 'paid')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    fontSize: '0.8rem', color: '#ccc', cursor: 'pointer',
                                                    padding: '6px 12px', borderRadius: '8px', border: '1px solid #333',
                                                    background: '#111'
                                                }}
                                            >
                                                <div style={{
                                                    width: '14px', height: '14px', borderRadius: '50%',
                                                    border: status === 'paid' ? '4px solid #4ade80' : '2px solid #666',
                                                    background: status === 'paid' ? '#fff' : 'transparent'
                                                }} />
                                                <span>{status === 'paid' ? 'Recebido' : 'Pendente'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Card Selection Display if Credit */}
                                {status === 'credit' && cards.length > 0 && (
                                    <div
                                        onClick={() => setIsCardSelectorOpen(true)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            marginBottom: '1rem', cursor: 'pointer'
                                        }}
                                    >
                                        <CreditCard size={14} className="text-secondary" />
                                        <span className="text-xs text-secondary underline">
                                            {selectedCardId ? cards.find(c => c.id === selectedCardId)?.name : 'Selecionar Cartão'}
                                        </span>
                                    </div>
                                )}
                                {status === 'credit' && cards.length === 0 && (
                                    <p className="text-xs text-error" style={{ marginBottom: '1rem' }}>Sem cartões cadastrados</p>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <span className="text-2xl text-secondary">R$</span>
                                    <span style={{ fontSize: '3.5rem', fontWeight: 'bold', color: type === 'income' ? '#4ade80' : '#fff' }}>
                                        {(parseInt(amount || '0') / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div style={{ width: '40px', height: '4px', background: '#333', borderRadius: '2px', margin: '1rem auto' }} />
                            </div>
                        </div>

                        {/* Meta Input Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#a1a1a1',
                                    fontSize: '0.75rem',
                                    fontFamily: 'inherit',
                                    width: 'auto',
                                    minWidth: '100px'
                                }}
                            />
                            <span className="text-secondary">•</span>
                            <input
                                type="text"
                                placeholder="Adicionar nota..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    width: '120px',
                                    textAlign: 'left'
                                }}
                            />
                        </div>

                        {/* Control Action Bar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#1e1e1e', padding: '8px', borderRadius: '50px',
                            marginBottom: '1.5rem'
                        }}>
                            <button type="button"
                                onClick={() => {
                                    const nextType = type === 'expense' ? 'income' : 'expense';
                                    setType(nextType);
                                    if (nextType === 'income') setStatus('paid'); // Reset status for income
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: '#000', padding: '8px 16px', borderRadius: '24px', border: '1px solid #333'
                                }}
                            >
                                {type === 'expense' ? <ArrowDownCircle size={18} color="#ef4444" /> : <ArrowUpCircle size={18} color="#4ade80" />}
                                <span className="text-sm font-medium" style={{ color: '#fff' }}>{type === 'expense' ? 'Conta' : 'Carteira'}</span>
                            </button>

                            <ArrowRight size={16} className="text-secondary" />

                            <button type="button"
                                onClick={() => setIsCategoryModalOpen(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'transparent', padding: '8px 16px', borderRadius: '24px', border: 'none'
                                }}
                            >
                                <span>{currentCategories.find(c => c.id === category)?.icon || '🔹'}</span>
                                <span className="text-sm font-medium" style={{ color: '#fff' }}>{currentCategories.find(c => c.id === category)?.label || 'Categoria'}</span>
                            </button>


                            <button type="submit" className="btn-primary flex-center" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}>
                                <CheckCircle2 size={20} />
                            </button>
                        </div>

                        {/* Keypad */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0].map((key, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="touch-effect"
                                    disabled={key === ''}
                                    onClick={() => {
                                        if (key !== '') {
                                            if (amount === '0') setAmount(String(key));
                                            else setAmount(amount + String(key));
                                        }
                                    }}
                                    style={{
                                        padding: '1.25rem',
                                        background: '#1e1e1e',
                                        borderRadius: '12px',
                                        fontSize: '1.5rem',
                                        fontWeight: '500',
                                        border: 'none',
                                        color: '#fff',
                                        visibility: key === '' ? 'hidden' : 'visible'
                                    }}
                                >
                                    {key}
                                </button>
                            ))}

                            <button
                                type="button"
                                className="touch-effect flex-center"
                                onClick={() => {
                                    if (amount.length <= 1) setAmount('0');
                                    else setAmount(amount.slice(0, -1));
                                }}
                                style={{
                                    padding: '1.25rem',
                                    background: '#1e1e1e',
                                    borderRadius: '12px',
                                    border: 'none',
                                    color: '#fff'
                                }}
                            >
                                <Delete size={24} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Category Modal */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={currentCategories}
                type={type}
                onSelect={(catId) => { setCategory(catId); setIsCategoryModalOpen(false); }}
                onCategoryAdded={(newCat) => {
                    if (onCategoryCreated) onCategoryCreated(newCat);
                }}
            />


            {/* Card Selector Modal - Simple Inline Implementation */}
            {isCardSelectorOpen && (
                <div className="modal-overlay" onClick={() => setIsCardSelectorOpen(false)}>
                    <div className="card" style={{ width: '80%', maxWidth: '300px', background: '#1e1e1e', border: '1px solid #333' }} onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-center" style={{ marginBottom: '1rem' }}>Selecionar Cartão</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {cards.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { setSelectedCardId(c.id); setIsCardSelectorOpen(false); }}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        background: selectedCardId === c.id ? '#333' : 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}
                                >
                                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: c.color }} />
                                    <span>{c.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
