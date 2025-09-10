import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { CashierWorkplace } from './components/CashierWorkplace';
import { AdminPanel } from './components/AdminPanel';
import { Sidebar } from './components/ui/sidebar';
import { Button } from './components/ui/button';
import { LogOut, Settings, ShoppingCart, Package, Gem, Crown } from 'lucide-react';

type UserRole = 'cashier' | 'admin' | 'manager';

interface User {
  id: string;
  name: string;
  role: UserRole;
}

type AppScreen = 'login' | 'cashier' | 'admin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentScreen(user.role === 'admin' ? 'admin' : 'cashier');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-white to-slate-50 border-r border-slate-200/60 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg shadow-sm">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Ювелірний</h2>
              <p className="text-xs text-amber-600 font-medium">Premium Store</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 p-2 bg-white/70 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-slate-700 font-medium">{currentUser?.name}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-3">
          <Button
            variant={currentScreen === 'cashier' ? 'default' : 'ghost'}
            className={`w-full justify-start h-12 transition-all duration-200 ${
              currentScreen === 'cashier' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg' 
                : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
            onClick={() => setCurrentScreen('cashier')}
          >
            <div className={`p-1.5 rounded-md mr-3 ${
              currentScreen === 'cashier' ? 'bg-white/20' : 'bg-blue-100'
            }`}>
              <ShoppingCart className={`h-4 w-4 ${
                currentScreen === 'cashier' ? 'text-white' : 'text-blue-600'
              }`} />
            </div>
            Касове місце
          </Button>
          
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <Button
              variant={currentScreen === 'admin' ? 'default' : 'ghost'}
              className={`w-full justify-start h-12 transition-all duration-200 ${
                currentScreen === 'admin' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
              onClick={() => setCurrentScreen('admin')}
            >
              <div className={`p-1.5 rounded-md mr-3 ${
                currentScreen === 'admin' ? 'bg-white/20' : 'bg-purple-100'
              }`}>
                <Package className={`h-4 w-4 ${
                  currentScreen === 'admin' ? 'text-white' : 'text-purple-600'
                }`} />
              </div>
              Адміністрування
            </Button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50">
          <Button
            variant="ghost"
            className="w-full justify-start h-11 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            onClick={handleLogout}
          >
            <div className="p-1.5 rounded-md mr-3 bg-slate-100 group-hover:bg-red-100">
              <LogOut className="h-4 w-4" />
            </div>
            Вийти з системи
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-white to-slate-50">
        <div className="h-full p-6">
          {currentScreen === 'cashier' && (
            <div className="h-full">
              <CashierWorkplace currentUser={currentUser!} />
            </div>
          )}
          {currentScreen === 'admin' && (
            <div className="h-full">
              <AdminPanel currentUser={currentUser!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}