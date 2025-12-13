import { useState, useMemo, useEffect } from 'react';
import {
  Plus, ArrowUpCircle, ArrowDownCircle,
  Wallet, X, ChevronLeft, ChevronRight,
  LayoutDashboard, PieChart as PieChartIcon, List,
  CheckCircle2, Clock, Calendar, Trash2, LogOut, Lock, Repeat, Infinity as InfinityIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const VIEWS = {
  DASHBOARD: 'dashboard',
  EXTRACT: 'extract',
  REPORTS: 'reports'
};

const DEFAULT_CATEGORIES = {
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value));
};

// --- LOGIN COMPONENT ---
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token);
      } else {
        setError(data.error || 'Erro ao entrar');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  return (
    <div className="login-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="video-bg"
        poster="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
      >
        {/* Try local file first, then fallback to a generic abstract loop */}
        <source src="/login-background.mp4" type="video/mp4" />
        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-black-and-white-lines-loop-3023-large.mp4" type="video/mp4" />
      </video>

      <div className="login-card">
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(255,255,255,0.3)' }}>
            <img src="/icon.svg" alt="logo" width="40" height="40" style={{ display: 'block' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Finance</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">Controle sua vida financeira</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="input-group">
            <label className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Usuário</label>
            <input
              type="text"
              value={username} onChange={e => setUsername(e.target.value)}
              style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              placeholder="admin"
            />
          </div>
          <div className="input-group">
            <label className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Senha</label>
            <input
              type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              placeholder="••••••"
            />
          </div>

          {error && <p className="text-xs text-error" style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

          <button className="btn btn-primary" type="submit" style={{ padding: '1rem', marginTop: '1rem', borderRadius: '12px', fontSize: '1rem' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeView, setActiveView] = useState(VIEWS.DASHBOARD);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('other');
  const [status, setStatus] = useState('paid');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // New Features State
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('installments'); // 'installments' or 'permanent'
  const [recurrenceCount, setRecurrenceCount] = useState(12);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Custom Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('✨');

  // Report State
  const [reportType, setReportType] = useState('expense');

  // --- API ---
  const fetchTransactions = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/transactions`);
      if (response.ok) {
        const data = await response.json();
        const parsedData = data.map(t => ({
          ...t,
          amount: parseFloat(t.amount),
          date: t.date.split('T')[0]
        }));
        setTransactions(parsedData);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const customCats = await res.json();
        // Merge custom cats into defaults
        const newCats = { ...DEFAULT_CATEGORIES };
        customCats.forEach(c => {
          if (newCats[c.type]) {
            newCats[c.type].push(c);
          }
        });
        setCategories(newCats);
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchCategories();
    }
  }, [token]);

  // --- Derived State ---
  const generalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.status !== 'paid') return acc;
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date + 'T12:00:00');
      try {
        return tDate.getMonth() === currentDate.getMonth() &&
          tDate.getFullYear() === currentDate.getFullYear();
      } catch (e) { return false; }
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, currentDate]);

  const monthlyStats = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthlyTransactions]);

  const chartData = useMemo(() => {
    const dataMap = {};
    const relevantType = reportType;

    monthlyTransactions
      .filter(t => t.type === relevantType)
      .forEach(t => {
        dataMap[t.category] = (dataMap[t.category] || 0) + t.amount;
      });

    const relevantCategories = categories[relevantType] || [];

    return Object.entries(dataMap).map(([key, value]) => {
      const catDef = relevantCategories.find(c => c.id === key) || { label: 'Outros', color: '#888' };
      return { name: catDef.label, value: value, color: catDef.color };
    });
  }, [monthlyTransactions, reportType, categories]);


  // --- Handlers ---
  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTransactions([]);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const newTransaction = {
      description,
      amount: parseFloat(amount),
      type,
      category,
      status,
      date,
      isRecurrent,
      recurrenceType,
      recurrenceCount: recurrenceType === 'installments' ? recurrenceCount : null
    };

    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });

      if (response.ok) {
        await fetchTransactions();
        setIsFormOpen(false);
        // Reset
        setDescription('');
        setAmount('');
        setStatus('paid');
        setDate(new Date().toISOString().split('T')[0]);
        setIsRecurrent(false);
        setRecurrenceCount(12);
        setRecurrenceType('installments');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const newId = newCatName.toLowerCase().replace(/ /g, '_') + '_' + Date.now();
    const newCat = {
      id: newId,
      label: newCatName,
      icon: newCatIcon,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
      type: type
    };

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });

      if (res.ok) {
        setCategories(prev => ({
          ...prev,
          [type]: [...prev[type], newCat]
        }));
        setCategory(newId); // Select it
        setIsCategoryModalOpen(false);
        setNewCatName('');
      }
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    setTransactions(transactions.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      await fetch(`${API_BASE}/transactions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      fetchTransactions();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;

    const originalTransactions = [...transactions];
    setTransactions(transactions.filter(t => t.id !== id));

    try {
      await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      setTransactions(originalTransactions);
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const formattedMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

  // --- Views ---

  if (!token) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderDashboard = () => (
    <div className="view-container">
      {/* Header with Logout */}
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <img src="/icon.svg" alt="logo" width="28" height="28" />
          <h1 className="text-lg font-bold">Finance</h1>
        </div>
        <button onClick={handleLogout} className="btn-icon">
          <LogOut size={18} />
        </button>
      </div>

      {/* General Balance Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e1e1e 0%, #000 100%)' }}>
        <p className="card-title">Saldo Geral (Caixa)</p>
        <h2 className="text-3xl">{formatCurrency(generalBalance)}</h2>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
          <span className="text-xs" style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', color: '#fff' }}>
            Atual
          </span>
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

      {/* Quick Actions */}
      <div className="flex-between">
        <h3 className="text-lg">Atalhos</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button className="card flex-center" style={{ height: '100px', flexDirection: 'column', gap: '10px', cursor: 'pointer' }} onClick={() => setIsFormOpen(true)}>
          <div style={{ background: '#fff', padding: '10px', borderRadius: '50%' }}>
            <Plus color="black" size={24} />
          </div>
          <span className="text-sm font-medium">Nova Transação</span>
        </button>
        <button className="card flex-center" style={{ height: '100px', flexDirection: 'column', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveView(VIEWS.REPORTS)}>
          <div style={{ background: '#333', padding: '10px', borderRadius: '50%' }}>
            <PieChartIcon color="white" size={24} />
          </div>
          <span className="text-sm font-medium">Relatórios</span>
        </button>
      </div>
    </div>
  );

  const renderExtract = () => (
    <div className="view-container">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h2 className="text-2xl">Extrato</h2>
        <div className="flex-center" style={{ gap: '1rem', color: 'var(--text-secondary)' }}>
          <span className="text-sm" style={{ textTransform: 'capitalize' }}>{formattedMonth}</span>
        </div>
      </div>

      {/* Date Navigation Mini */}
      <div className="flex-between" style={{ marginBottom: '1rem', padding: '0.5rem', background: '#1e1e1e', borderRadius: '8px' }}>
        <button className="btn-icon" onClick={() => changeMonth(-1)}><ChevronLeft size={16} /></button>
        <span className="text-xs font-medium" style={{ textTransform: 'capitalize' }}>{formattedMonth}</span>
        <button className="btn-icon" onClick={() => changeMonth(1)}><ChevronRight size={16} /></button>
      </div>

      <div className="transactions-list" style={{ paddingBottom: '80px' }}>
        {monthlyTransactions.length === 0 ? (
          <div className="card flex-center" style={{ padding: '3rem', flexDirection: 'column' }}>
            <Wallet size={48} className="text-secondary" style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p className="text-secondary text-sm">Nada por aqui ainda.</p>
          </div>
        ) : (
          monthlyTransactions.map((t) => {
            const relevantCats = categories[t.type] || [];
            const cat = relevantCats.find(c => c.id === t.category) || { icon: '❓', label: 'Desconhecido' };

            return (
              <div key={t.id} className="list-item" onClick={() => toggleStatus(t.id, t.status)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '12px',
                    background: '#1e1e1e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {cat.icon}
                  </div>
                  <div className="flex-col">
                    <p className="font-medium" style={{ marginBottom: '2px' }}>{t.description}</p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={`status-dot ${t.status === 'paid' ? 'status-paid' : 'status-pending'}`}></span>
                      <span className="text-xs text-secondary">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                    <span className="font-bold" style={{ color: t.type === 'income' ? '#fff' : '#a1a1a1' }}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                    <span className="text-xs text-secondary" style={{ marginTop: '2px' }}>
                      {t.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                  <button
                    className="btn-icon"
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                    style={{ opacity: 0.5, marginLeft: '4px' }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        className="btn btn-primary"
        style={{ position: 'fixed', bottom: '80px', right: '1.5rem', borderRadius: '50px', padding: '0.75rem 1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
        onClick={() => setIsFormOpen(true)}
      >
        <Plus size={20} /> Nova
      </button>
    </div>
  );

  const renderReports = () => (
    <div className="view-container">
      <div className="flex-between">
        <h2 className="text-2xl">Relatórios</h2>
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

  return (
    <>
      <div className="app-container">
        {activeView === VIEWS.DASHBOARD && renderDashboard()}
        {activeView === VIEWS.EXTRACT && renderExtract()}
        {activeView === VIEWS.REPORTS && renderReports()}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeView === VIEWS.DASHBOARD ? 'active' : ''}`}
          onClick={() => setActiveView(VIEWS.DASHBOARD)}
        >
          <LayoutDashboard size={24} />
          Início
        </button>
        <button
          className={`nav-item ${activeView === VIEWS.EXTRACT ? 'active' : ''}`}
          onClick={() => setActiveView(VIEWS.EXTRACT)}
        >
          <List size={24} />
          Extrato
        </button>
        <button
          className={`nav-item ${activeView === VIEWS.REPORTS ? 'active' : ''}`}
          onClick={() => setActiveView(VIEWS.REPORTS)}
        >
          <PieChartIcon size={24} />
          Relatórios
        </button>
      </nav>

      {/* Modal Transaction */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="card animate-fade-in" style={{
            width: '100%', maxWidth: '500px',
            borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
            paddingBottom: '2rem', maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>

            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3>Nova Transação</h3>
              <button className="btn-icon" onClick={() => setIsFormOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleAddTransaction} className="flex-col gap-4">
              {/* Type Switcher */}
              <div style={{ background: '#1e1e1e', padding: '4px', borderRadius: '12px', display: 'flex' }}>
                <button type="button" className="btn"
                  style={{ flex: 1, background: type === 'income' ? '#333' : 'transparent', border: 'none' }}
                  onClick={() => setType('income')}
                >Entrada</button>
                <button type="button" className="btn"
                  style={{ flex: 1, background: type === 'expense' ? '#333' : 'transparent', border: 'none' }}
                  onClick={() => setType('expense')}
                >Saída</button>
              </div>

              <div className="input-group">
                <label className="text-xs text-secondary">Valor</label>
                <input
                  type="number" step="0.01" placeholder="0,00"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: '2rem', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', background: 'transparent', border: 'none', borderBottom: '1px solid #333' }}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="text-xs text-secondary">Descrição</label>
                <input type="text" placeholder="Ex: Aluguel" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {/* Status & Date & Recurrence */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, minWidth: '140px' }}>
                  <label className="text-xs text-secondary">Data</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{ width: '100%', paddingLeft: '2.5rem' }}
                    />
                    <Calendar size={16} className="text-secondary" style={{ position: 'absolute', left: '1rem' }} />
                  </div>
                </div>

                <div className="input-group" style={{ flex: 1, minWidth: '140px' }}>
                  <label className="text-xs text-secondary">Status</label>
                  <div
                    style={{
                      height: '52px', background: '#000', border: '1px solid #333', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem'
                    }}
                  >
                    <span className="text-sm" style={{ paddingLeft: '0.5rem' }}>{status === 'paid' ? (type === 'income' ? 'Recebido' : 'Pago') : 'Pendente'}</span>
                    {/* Standardized Toggle */}
                    <div
                      className={`custom-toggle ${status === 'paid' ? 'checked' : ''}`}
                      onClick={() => setStatus(status === 'paid' ? 'pending' : 'paid')}
                    />
                  </div>
                </div>
              </div>

              {/* Recurrence Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#1e1e1e', borderRadius: '8px' }}>
                <span className="text-sm">Repetir movimentação</span>
                {/* Standardized Toggle */}
                <div
                  className={`custom-toggle ${isRecurrent === true ? 'checked' : ''}`}
                  onClick={() => setIsRecurrent(!isRecurrent)}
                />
              </div>

              {isRecurrent && (
                <div className="animate-fade-in" style={{ padding: '0 4px' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setRecurrenceType('installments')}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #333',
                        background: recurrenceType === 'installments' ? '#333' : 'transparent', color: '#fff'
                      }}
                    >
                      Parcelado
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurrenceType('permanent')}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #333',
                        background: recurrenceType === 'permanent' ? '#333' : 'transparent', color: '#fff'
                      }}
                    >
                      Fixo/Mensal
                    </button>
                  </div>

                  {recurrenceType === 'installments' ? (
                    <div className="input-group" style={{ marginTop: '0.5rem' }}>
                      <label className="text-xs text-secondary">Número de parcelas (Meses)</label>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#000', borderRadius: '8px', padding: '0.5rem', border: '1px solid #333' }}>
                        <Repeat size={16} className="text-secondary" style={{ marginRight: '0.5rem' }} />
                        <input
                          type="number" min="2" max="100"
                          value={recurrenceCount}
                          onChange={(e) => setRecurrenceCount(Number(e.target.value))}
                          style={{ background: 'transparent', width: '100%', color: '#fff', border: 'none' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#3332', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <InfinityIcon size={16} className="text-secondary" />
                      <span className="text-xs text-secondary">
                        Será gerado automaticamente pelos próximos 5 anos.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="input-group">
                <label className="text-xs text-secondary">Categoria</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {(categories[type] || []).map(cat => (
                    <button key={cat.id} type="button" className="btn flex-col flex-center"
                      style={{
                        gap: '4px', height: 'auto', padding: '0.75rem',
                        background: category === cat.id ? '#fff' : '#1e1e1e',
                        color: category === cat.id ? '#000' : '#888'
                      }}
                      onClick={() => setCategory(cat.id)}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                      <span style={{ fontSize: '0.7rem' }}>{cat.label}</span>
                    </button>
                  ))}
                  {/* Add Category Button */}
                  <button type="button" className="btn flex-col flex-center"
                    style={{
                      gap: '4px', height: 'auto', padding: '0.75rem',
                      background: '#1e1e1e', color: '#888', border: '1px dashed #444'
                    }}
                    onClick={() => setIsCategoryModalOpen(true)}
                  >
                    <Plus size={20} />
                    <span style={{ fontSize: '0.7rem' }}>Nova</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
                Salvar
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Modal New Category */}
      {isCategoryModalOpen && (
        <div className="modal-overlay" style={{ alignItems: 'center' }} onClick={() => setIsCategoryModalOpen(false)}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '350px' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ marginBottom: '1rem' }}>Nova Categoria</h3>
            <form onSubmit={handleAddCategory} className="flex-col gap-4">
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
              <button className="btn btn-primary" type="submit">Criar Categoria</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
