import { useState, useMemo, useEffect } from 'react';
import { Plus, LayoutDashboard, Menu as MenuIcon } from 'lucide-react';

import './App.css';

import { LoginScreen } from './components/LoginScreen';
import { TransactionModal } from './components/TransactionModal';
import { Dashboard } from './views/Dashboard';
import { Extract } from './views/Extract';
import { Reports } from './views/Reports';
import { Budgets } from './views/Budgets';
import { Subscriptions } from './views/Subscriptions';
import { Cards } from './views/Cards';
import { Menu } from './views/Menu';
import { VIEWS, DEFAULT_CATEGORIES, API_BASE } from './constants';
import { formatCurrency } from './utils';

// ... (rest of imports)

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

  // Report State
  const [reportType, setReportType] = useState('expense');

  // Notification State
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Profile State
  const [profileName, setProfileName] = useState(() => localStorage.getItem('username') || 'Usuário');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfileName, setTempProfileName] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (tempProfileName.trim()) {
      localStorage.setItem('username', tempProfileName);
      setProfileName(tempProfileName);
    }
    setIsEditingProfile(false);
  };

  // New Features State: Budgets (check localStorage)
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem('finance_budgets');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Error parsing finance_budgets', e);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Credit Cards State
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem('finance_cards');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing finance_cards', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('finance_cards', JSON.stringify(cards));
  }, [cards]);

  // Register Service Worker and setup notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado:', registration);
        })
        .catch(err => console.error('Erro ao registrar Service Worker:', err));

      // Check current permission
      setNotificationPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Check for bills due today (runs daily)
  useEffect(() => {
    if (!token || !notificationsEnabled) return;

    const checkBillsDueToday = () => {
      const today = new Date().toISOString().split('T')[0];
      const billsDueToday = transactions.filter(t =>
        t.type === 'expense' &&
        t.status === 'pending' &&
        t.date === today
      );

      if (billsDueToday.length > 0) {
        const totalAmount = billsDueToday.reduce((sum, t) => sum + t.amount, 0);
        const message = billsDueToday.length === 1
          ? `${billsDueToday[0].description} - ${formatCurrency(billsDueToday[0].amount)}`
          : `${billsDueToday.length} contas - Total: ${formatCurrency(totalAmount)}`;

        showNotification('Contas Vencendo Hoje! 📅', message);
      }
    };

    // Check immediately
    checkBillsDueToday();

    // Check daily at 9 AM
    const now = new Date();
    const next9AM = new Date(now);
    next9AM.setHours(9, 0, 0, 0);
    if (next9AM <= now) {
      next9AM.setDate(next9AM.getDate() + 1);
    }
    const timeUntil9AM = next9AM - now;

    const dailyCheck = setTimeout(() => {
      checkBillsDueToday();
      // Then repeat every 24 hours
      setInterval(checkBillsDueToday, 24 * 60 * 60 * 1000);
    }, timeUntil9AM);

    return () => clearTimeout(dailyCheck);
  }, [token, transactions, notificationsEnabled]);

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

  // --- New Logic: Insights ---
  const insights = useMemo(() => {
    const tips = [];
    // 1. Check Spending vs Income
    if (monthlyStats.expense > monthlyStats.income && monthlyStats.income > 0) {
      tips.push({
        type: 'critical',
        icon: <AlertTriangle color="#ef4444" size={20} />,
        title: 'Atenção aos Gastos',
        message: 'Você gastou mais do que recebeu este mês.'
      });
    }

    // 2. Rising Category
    const sortedCategories = [... (categories.expense || [])].map(cat => {
      const spent = monthlyTransactions
        .filter(t => t.category === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, spent };
    }).sort((a, b) => b.spent - a.spent);

    if (sortedCategories.length > 0 && sortedCategories[0].spent > 0) {
      tips.push({
        type: 'info',
        icon: <TrendingUp color="#3b82f6" size={20} />,
        title: 'Maior Gasto',
        message: `Seus gastos com ${sortedCategories[0].label} estão altos (${formatCurrency(sortedCategories[0].spent)}).`
      });
    }

    // 3. Budget Alerts
    Object.entries(budgets).forEach(([catId, limit]) => {
      const spent = monthlyTransactions
        .filter(t => t.category === catId && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      if (spent > limit) {
        const catName = categories.expense.find(c => c.id === catId)?.label || 'Categoria';
        tips.push({
          type: 'warning',
          icon: <AlertTriangle color="#facc15" size={20} />,
          title: 'Limite Excedido',
          message: `Você estourou o orçamento de ${catName}.`
        });
      }
    });

    return tips;
  }, [monthlyStats, monthlyTransactions, categories, budgets]);

  // --- New Logic: Subscriptions (Heuristic) ---
  const possibleSubscriptions = useMemo(() => {
    // Group expenses by description that appear more than once in history
    const counts = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const desc = t.description.toLowerCase().trim();
      if (!counts[desc]) counts[desc] = { count: 0, amount: t.amount, lastDate: t.date, original: t };
      counts[desc].count++;
      // Keep most recent amount
      if (new Date(t.date) > new Date(counts[desc].lastDate)) {
        counts[desc].amount = t.amount;
        counts[desc].lastDate = t.date;
      }
    });

    return Object.values(counts)
      .filter(item => item.count >= 2) // Appears at least twice
      .map(item => ({
        ...item.original,
        amount: item.amount // Use most recent amount
      }));
  }, [transactions]);


  // --- Handlers ---
  const handleLogin = (newToken, user = 'Usuário') => {
    localStorage.setItem('token', newToken);
    if (user) {
      localStorage.setItem('username', user);
      setProfileName(user);
    }
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTransactions([]);
  };

  const handleCategoryCreated = (newCat) => {
    setCategories(prev => ({
      ...prev,
      [newCat.type]: [...prev[newCat.type], newCat]
    }));
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

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações');
      return;
    }

    try {
      let permission = Notification.permission;

      if (permission === 'denied') {
        alert('As notificações estão bloqueadas. Por favor, ative-as nas configurações do seu navegador (clique no ícone de cadeado/configurações na barra de endereço).');
        return;
      }

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      setNotificationPermission(permission);
      setNotificationsEnabled(permission === 'granted');

      if (permission === 'granted') {
        showNotification('Notificações Ativadas! 🔔', 'Você receberá lembretes sobre contas vencendo');
      } else if (permission === 'denied') {
        alert('Você negou as notificações. Para ativar, você precisará mudar nas configurações do navegador.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    }
  };

  const showNotification = (title, body) => {
    if (!notificationsEnabled) return;

    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [200, 100, 200],
          tag: 'bill-reminder',
          requireInteraction: true
        });
      });
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




  return (
    <>
      <div className="app-container">

        {activeView === VIEWS.DASHBOARD && <Dashboard
          setActiveView={setActiveView}
          generalBalance={generalBalance}
          changeMonth={changeMonth}
          formattedMonth={formattedMonth}
          monthlyStats={monthlyStats}
        />}
        {activeView === VIEWS.EXTRACT && <Extract
          monthlyTransactions={monthlyTransactions}
          categories={categories}
          toggleStatus={toggleStatus}
          handleDelete={handleDelete}
          changeMonth={changeMonth}
          formattedMonth={formattedMonth}
        />}
        {activeView === VIEWS.REPORTS && <Reports
          setActiveView={setActiveView}
          reportType={reportType}
          setReportType={setReportType}
          chartData={chartData}
          changeMonth={changeMonth}
          formattedMonth={formattedMonth}
        />}
        {activeView === VIEWS.BUDGETS && <Budgets
          setActiveView={setActiveView}
          categories={categories}
          budgets={budgets}
          setBudgets={setBudgets}
          monthlyTransactions={monthlyTransactions}
        />}
        {activeView === VIEWS.SUBSCRIPTIONS && <Subscriptions
          setActiveView={setActiveView}
          possibleSubscriptions={possibleSubscriptions}
        />}
        {activeView === VIEWS.CARDS && <Cards
          setActiveView={setActiveView}
          cards={cards}
          setCards={setCards}
        />}
        {activeView === VIEWS.MENU && <Menu
          activeView={activeView}
          setActiveView={setActiveView}
          profileName={profileName}
          isEditingProfile={isEditingProfile}
          setIsEditingProfile={setIsEditingProfile}
          tempProfileName={tempProfileName}
          setTempProfileName={setTempProfileName}
          handleSaveProfile={handleSaveProfile}
          notificationsEnabled={notificationsEnabled}
          requestNotificationPermission={requestNotificationPermission}
          handleLogout={handleLogout}
        />}
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


        <button className="nav-item" onClick={() => setIsFormOpen(true)} style={{ overflow: 'visible' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(-20px)',
            boxShadow: '0 8px 25px rgba(255, 255, 255, 0.4)',
            border: 'none'
          }}>
            <Plus size={28} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ marginTop: '-15px', fontWeight: 'bold' }}>Nova</span>
        </button>

        <button
          className={`nav-item ${activeView === VIEWS.MENU || activeView === VIEWS.REPORTS || activeView === VIEWS.BUDGETS || activeView === VIEWS.SUBSCRIPTIONS ? 'active' : ''}`}
          onClick={() => setActiveView(VIEWS.MENU)}
        >
          <MenuIcon size={24} />
          Menu
        </button>

      </nav>

      {/* 
      <TransactionModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchTransactions}
        categories={categories}
        cards={cards} 
        onCategoryCreated={handleCategoryCreated}
      /> 
      */}
    </>
  );
}
