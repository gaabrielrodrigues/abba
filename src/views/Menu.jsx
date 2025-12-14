import React from 'react';
import { Settings, X, ChevronRight, PieChart as PieChartIcon, Target, CreditCard, Bell, LogOut } from 'lucide-react';
import { VIEWS } from '../constants';

export function Menu({
    activeView,
    setActiveView,
    profileName,
    isEditingProfile,
    setIsEditingProfile,
    tempProfileName,
    setTempProfileName,
    handleSaveProfile,
    notificationsEnabled,
    requestNotificationPermission,
    handleLogout
}) {
    return (
        <div className="view-container no-scroll" style={{ gap: '1rem' }}>
            <h2 className="text-2xl font-bold" style={{ marginBottom: '0.5rem' }}>Menu</h2>

            {/* Profile Card - Compact Horizontal */}
            <div className="card" style={{ padding: '1rem', border: '1px solid #333' }}>
                {!isEditingProfile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '56px', height: '56px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 'bold', color: '#fff',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            flexShrink: 0
                        }}>
                            {profileName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <h3 className="text-lg font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profileName}</h3>
                            <p className="text-secondary text-xs">Membro Pro</p>
                        </div>
                        <button
                            className="btn-icon"
                            onClick={() => {
                                setTempProfileName(profileName);
                                setIsEditingProfile(true);
                            }}
                            style={{ background: '#333', color: '#fff' }}
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSaveProfile} className="flex-between" style={{ gap: '8px' }}>
                        <input
                            type="text"
                            value={tempProfileName}
                            onChange={e => setTempProfileName(e.target.value)}
                            autoFocus
                            className="input-field"
                            style={{ background: '#000', border: '1px solid #333', padding: '0.5rem', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>OK</button>
                        <button type="button" className="btn" onClick={() => setIsEditingProfile(false)} style={{ padding: '0.5rem', color: '#888' }}><X size={18} /></button>
                    </form>
                )}
            </div>

            {/* Menu Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>

                {/* Gestão */}
                <div>
                    <h3 className="text-xs text-secondary" style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Gestão
                    </h3>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #333' }}>
                        {[
                            { label: 'Relatórios', icon: <PieChartIcon size={18} className="text-blue-400" />, action: () => setActiveView(VIEWS.REPORTS) },
                            { label: 'Metas', icon: <Target size={18} className="text-red-400" />, action: () => setActiveView(VIEWS.BUDGETS) },
                            { label: 'Assinaturas', icon: <CreditCard size={18} className="text-purple-400" />, action: () => setActiveView(VIEWS.SUBSCRIPTIONS) },
                            { label: 'Meus Cartões', icon: <CreditCard size={18} className="text-green-400" />, action: () => setActiveView(VIEWS.CARDS) }
                        ].map((item, idx, arr) => (

                            <button
                                key={idx}
                                className="list-item touch-effect"
                                onClick={item.action}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    borderBottom: idx < arr.length - 1 ? '1px solid #222' : 'none',
                                    background: 'transparent',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    border: 'none',
                                    color: '#fff'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px', color: '#fff' }}>
                                        {item.icon}
                                    </div>
                                    <span className="font-medium" style={{ fontSize: '0.95rem' }}>{item.label}</span>
                                </div>
                                <ChevronRight size={14} className="text-secondary" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conta */}
                <div style={{ marginTop: '0.5rem' }}>
                    <h3 className="text-xs text-secondary" style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Conta
                    </h3>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #333' }}>
                        <div className="list-item" style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>
                                    <Bell size={18} className="text-yellow-400" />
                                </div>
                                <span className="font-medium" style={{ fontSize: '0.95rem', color: '#fff' }}>Notificações</span>
                            </div>

                            <div
                                className={`custom-toggle ${notificationsEnabled ? 'checked' : ''}`}
                                onClick={requestNotificationPermission}
                                style={{ transform: 'scale(0.9)' }}
                            />
                        </div>

                        <button
                            className="list-item touch-effect"
                            onClick={handleLogout}
                            style={{ width: '100%', padding: '0.8rem 1rem', background: 'transparent', justifyContent: 'space-between', border: 'none', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '6px' }}>
                                    <LogOut size={18} className="text-error" />
                                </div>
                                <span className="font-medium text-error" style={{ fontSize: '0.95rem' }}>Sair da Conta</span>
                            </div>
                        </button>
                    </div>
                </div>

            </div>

            <p className="text-xs text-secondary" style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.3 }}>
                v1.4.1
            </p>
        </div>
    );
}
