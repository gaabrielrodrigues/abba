import { useState } from 'react';
import './App.css';

export default function App() {
    const [error, setError] = useState(null);

    try {
        return (
            <div style={{
                padding: '2rem',
                background: '#000',
                color: '#fff',
                minHeight: '100vh',
                fontFamily: 'system-ui'
            }}>
                <h1>App is Loading...</h1>
                <p>If you see this, React is working!</p>
                <button
                    onClick={() => {
                        console.log('Button clicked');
                        alert('React is working!');
                    }}
                    style={{
                        padding: '1rem 2rem',
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}
                >
                    Test Button
                </button>

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#1e1e1e', borderRadius: '8px' }}>
                    <h3>LocalStorage Check:</h3>
                    <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                        {JSON.stringify({
                            token: localStorage.getItem('token') ? 'exists' : 'missing',
                            username: localStorage.getItem('username'),
                            budgets: localStorage.getItem('finance_budgets'),
                            cards: localStorage.getItem('finance_cards')
                        }, null, 2)}
                    </pre>
                </div>

                {error && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#ef4444', borderRadius: '8px' }}>
                        <h3>Error:</h3>
                        <pre>{error.toString()}</pre>
                    </div>
                )}
            </div>
        );
    } catch (e) {
        return (
            <div style={{ padding: '2rem', background: '#ef4444', color: '#fff' }}>
                <h1>CRASH DETECTED</h1>
                <pre>{e.toString()}</pre>
                <pre>{e.stack}</pre>
            </div>
        );
    }
}
