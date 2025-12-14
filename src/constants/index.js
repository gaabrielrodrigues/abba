export const VIEWS = {
    DASHBOARD: 'dashboard',
    EXTRACT: 'extract',
    REPORTS: 'reports',
    BUDGETS: 'budgets',
    SUBSCRIPTIONS: 'subscriptions',
    CARDS: 'cards',
    MENU: 'menu'
};


export const DEFAULT_CATEGORIES = {
    income: [
        { id: 'salary', label: 'Salário', icon: '💰', color: '#4ade80' },
        { id: 'freelance', label: 'Freelance', icon: '💻', color: '#22d3ee' },
        { id: 'invest', label: 'Investimentos', icon: '📈', color: '#f472b6' },
        { id: 'other', label: 'Outros', icon: '🔹', color: '#94a3b8' }
    ],
    expense: [
        { id: 'housing', label: 'Moradia', icon: '🏠', color: '#f87171' },
        { id: 'food', label: 'Alimentação', icon: '🍔', color: '#fb923c' },
        { id: 'transport', label: 'Transporte', icon: '🚗', color: '#fbbf24' },
        { id: 'leisure', label: 'Lazer', icon: '🎉', color: '#a78bfa' },
        { id: 'health', label: 'Saúde', icon: '⚕️', color: '#34d399' },
        { id: 'shopping', label: 'Compras', icon: '🛍️', color: '#ec4899' },
        { id: 'other', label: 'Outros', icon: '🔹', color: '#94a3b8' }
    ]
};

export const API_BASE = import.meta.env.VITE_API_URL || '/api';
