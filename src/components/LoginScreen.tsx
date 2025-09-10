import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Crown, Gem, Lock, User, Mail } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';

interface User {
  id: string;
  name: string;
  role: 'cashier' | 'admin' | 'manager';
}

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

// Mock users for demo
const mockUsers: User[] = [
  { id: '1', name: 'Олена Касир', role: 'cashier' },
  { id: '2', name: 'Петро Касир', role: 'cashier' },
  { id: '3', name: 'Анна Менеджер', role: 'manager' },
  { id: '4', name: 'Сергій Адмін', role: 'admin' },
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loginMode, setLoginMode] = useState<'demo' | 'real'>('demo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = getSupabaseClient();

  const handleLogin = async () => {
    if (loginMode === 'demo') {
      const user = mockUsers.find(u => u.id === selectedUserId);
      if (user && password) {
        onLogin(user);
      }
      return;
    }

    if (!email || !password) {
      setError('Будь ласка, введіть email та пароль');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Користувач',
          role: data.user.user_metadata?.role || 'cashier'
        };
        onLogin(user);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Помилка входу в систему');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Вхід в систему
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            🏆 Преміум система управління ювелірним магазином
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">Режим входу</Label>
            <Select value={loginMode} onValueChange={(value) => setLoginMode(value as 'demo' | 'real')}>
              <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:border-purple-300 focus:ring-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo">✨ Демо режим</SelectItem>
                <SelectItem value="real">🔐 Реальні користувачі</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loginMode === 'demo' ? (
            <>
              <div className="space-y-3">
                <Label htmlFor="user" className="text-slate-700 font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Користувач
                </Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:border-blue-300 focus:ring-blue-200">
                    <SelectValue placeholder="👤 Оберіть користувача" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.role === 'admin' ? 'bg-red-500' : 
                            user.role === 'manager' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          {user.name} • {user.role === 'admin' ? 'Адмін' : user.role === 'manager' ? 'Менеджер' : 'Касир'}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-700 font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  Пароль
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="🔑 Введіть будь-який пароль"
                    className="h-12 bg-slate-50 border-slate-200 focus:border-green-300 focus:ring-green-200 pl-4"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="📧 user@example.com"
                  className="h-12 bg-slate-50 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-700 font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="🔑 Введіть пароль"
                  className="h-12 bg-slate-50 border-slate-200 focus:border-green-300 focus:ring-green-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 text-center font-medium">⚠️ {error}</p>
            </div>
          )}
          
          <Button 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleLogin}
            disabled={loading || (loginMode === 'demo' ? (!selectedUserId || !password) : (!email || !password))}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Авторизація...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Gem className="h-4 w-4" />
                Увійти до системи
              </div>
            )}
          </Button>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-slate-600 text-center">
              {loginMode === 'demo' 
                ? '✨ Демо режим: використайте будь-який пароль для входу' 
                : '🔐 Використайте зареєстрований аккаунт для входу'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}