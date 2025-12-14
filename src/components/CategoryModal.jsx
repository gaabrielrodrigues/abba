import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { API_BASE } from '../constants';

export function CategoryModal({ isOpen, onClose, categories, type, onSelect, onCategoryAdded }) {
    const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('✨');

    if (!isOpen) return null;

    const handleCreate = async (e) => {
        e.preventDefault();
        const newId = newCatName.toLowerCase().replace(/ /g, '_') + '_' + Date.now();
        const newCat = {
            id: newId,
            label: newCatName,
            icon: newCatIcon,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            type: type
        };

        try {
            const res = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCat)
            });

            if (res.ok) {
                onCategoryAdded(newCat);
                setIsNewCategoryMode(false);
                setNewCatName('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay" style={{ alignItems: 'flex-end' }} onClick={onClose}>
            <div className="card animate-fade-in" style={{
                width: '100%', maxHeight: '70vh',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <h3 className="text-lg font-bold">Selecionar Categoria</h3>
                    <button className="btn-icon" onClick={onClose}><X /></button>
                </div>

                {!isNewCategoryMode ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {(categories || []).map(cat => (
                            <button key={cat.id} type="button" className="flex-col flex-center touch-effect"
                                style={{
                                    gap: '8px', padding: '1rem',
                                    borderRadius: '16px', border: 'none',
                                    background: '#1e1e1e', // We don't know selected here, simplified
                                }}
                                onClick={() => onSelect(cat.id)}
                            >
                                <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                                <span className="text-xs">{cat.label}</span>
                            </button>
                        ))}
                        <button type="button" className="flex-col flex-center touch-effect"
                            style={{ gap: '8px', padding: '1rem', borderRadius: '16px', border: '2px dashed #333', background: 'transparent' }}
                            onClick={() => setIsNewCategoryMode(true)}
                        >
                            <Plus size={24} color="#888" />
                            <span className="text-xs text-secondary">Nova</span>
                        </button>
                    </div>
                ) : (
                    /* Create New Category Form */
                    <form onSubmit={handleCreate} className="flex-col gap-4">
                        <div className="input-group">
                            <label className="text-xs text-secondary">Nome</label>
                            <input type="text" placeholder="Ex: Assinaturas" autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="text-xs text-secondary">Ícone (Emoji)</label>
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {['🛒', '🎮', '💊', '💡', '🎓', '✈️', '🎁', '🔧', '🐾', '👶', '💅', '🍺'].map(emoji => (
                                    <button
                                        key={emoji} type="button"
                                        onClick={() => setNewCatIcon(emoji)}
                                        style={{
                                            fontSize: '1.5rem', background: newCatIcon === emoji ? '#333' : 'transparent',
                                            border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer'
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-between">
                            <button type="button" className="btn" onClick={() => setIsNewCategoryMode(false)}>Voltar</button>
                            <button type="submit" className="btn btn-primary">Criar</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
