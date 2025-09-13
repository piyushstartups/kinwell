import React, { useState } from 'react';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Card } from './ui/Card.tsx';
import { Logo } from './Logo.tsx';
import { User } from '../types.ts';
import { MOCK_USER } from '../constants.ts';

interface LoginViewProps {
  onLogin: (user: User) => void;
  onNavigateToLanding: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onNavigateToLanding }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(MOCK_USER);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full text-center mb-8">
            <Logo className="h-16 w-16 text-primary-600 mx-auto"/>
            <h1 className="text-4xl font-bold text-slate-800 mt-4">Kinwell</h1>
            <p className="text-slate-600 mt-2">Your family's secure health hub.</p>
        </div>
      
      <Card className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && <Input label="Full Name" type="text" placeholder="John Doe" />}
          <Input label="Email Address" type="email" placeholder="you@example.com" defaultValue="demo@kinwell.app"/>
          <Input label="Password" type="password" placeholder="••••••••" defaultValue="password"/>
          <Button type="submit" className="w-full">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-6 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-primary-600 hover:underline">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
        </div>
      </Card>
      <div className="mt-8 text-center">
        <button onClick={onNavigateToLanding} className="text-sm text-slate-500 hover:underline">
            &larr; Back to Home
        </button>
        <p className="text-xs text-slate-400 mt-4 text-center">For demo purposes, you can sign in with any credentials.</p>
      </div>
    </div>
  );
};

export default LoginView;