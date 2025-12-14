import { useState } from 'react';
import { API_BASE } from '../constants';

export function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation for registration
        if (isRegistering) {
            if (username.length < 3) {
                setError('Usuário deve ter pelo menos 3 caracteres');
                return;
            }
            if (password.length < 6) {
                setError('Senha deve ter pelo menos 6 caracteres');
                return;
            }
            if (password !== confirmPassword) {
                setError('As senhas não coincidem');
                return;
            }
        }

        try {
            const endpoint = isRegistering ? '/register' : '/login';
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                onLogin(data.token, username);
            } else {
                setError(data.error || (isRegistering ? 'Erro ao criar conta' : 'Erro ao entrar'));
            }
        } catch (err) {
            setError('Erro de conexão');
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setConfirmPassword('');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
                    <div style={{ background: '#fff', padding: '12px', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(255,255,255,0.3)' }}>
                        <img src="/icon.svg" alt="logo" width="40" height="40" style={{ display: 'block' }} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Abba</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">
                        {isRegistering ? 'Crie sua conta' : 'Controle sua vida financeira'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    <div className="input-group">
                        <label className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Usuário</label>
                        <input
                            type="text"
                            value={username} onChange={e => setUsername(e.target.value)}
                            style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            placeholder={isRegistering ? "Escolha um usuário" : "admin"}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Senha</label>
                        <input
                            type="password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            placeholder="••••••"
                            required
                        />
                    </div>

                    {isRegistering && (
                        <div className="input-group animate-fade-in">
                            <label className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Confirmar Senha</label>
                            <input
                                type="password"
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                placeholder="••••••"
                                required
                            />
                        </div>
                    )}

                    {error && <p className="text-xs text-error" style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}

                    <button className="btn btn-primary" type="submit" style={{ padding: '1rem', marginTop: '1rem', borderRadius: '12px', fontSize: '1rem' }}>
                        {isRegistering ? 'Criar Conta' : 'Entrar'}
                    </button>

                    <button
                        type="button"
                        onClick={toggleMode}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: '0.5rem'
                        }}
                    >
                        {isRegistering ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar agora'}
                    </button>
                </form>
            </div>
        </div>
    );
}
