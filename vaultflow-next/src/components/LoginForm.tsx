'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth';

export default function LoginForm() {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'internal' | 'wholesale'>('internal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, loginType);
  };

  return (
    <div className="login-container">
      <div className="login-card">
                     <div className="login-header">
               <div className="login-logo">
                 <img src="/logo.png" alt="GoldMine Distro" className="login-brand-logo" />
               </div>
               <h1>GoldMine Distro</h1>
               <p>Choose your access type</p>
             </div>
        
        <div className="login-tabs">
          <button
            className={`tab ${loginType === 'internal' ? 'active' : ''}`}
            onClick={() => setLoginType('internal')}
          >
            Internal Access
          </button>
          <button
            className={`tab ${loginType === 'wholesale' ? 'active' : ''}`}
            onClick={() => setLoginType('wholesale')}
          >
            Wholesale Portal
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : `Sign In to ${loginType === 'internal' ? 'Internal System' : 'Wholesale Portal'}`}
          </button>
        </form>
        
        <div className="login-footer">
          {loginType === 'internal' ? (
            <p>Internal access for inventory management</p>
          ) : (
            <p>Wholesale portal for viewing inventory and placing orders</p>
          )}
        </div>
      </div>
    </div>
  );
} 