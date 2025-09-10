import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Settings as SettingsIcon, Users, CreditCard, Globe, Printer, Database, Plus, Edit, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'online';
  enabled: boolean;
  settings?: any;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Сергій Адмін',
    email: 'admin@jewelry.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15 14:30'
  },
  {
    id: '2',
    name: 'Анна Менеджер',
    email: 'manager@jewelry.com',
    role: 'manager',
    status: 'active',
    lastLogin: '2024-01-15 12:15'
  },
  {
    id: '3',
    name: 'Олена Касир',
    email: 'cashier1@jewelry.com',
    role: 'cashier',
    status: 'active',
    lastLogin: '2024-01-15 09:45'
  }
];

const mockPaymentMethods: PaymentMethod[] = [
  { id: '1', name: 'Готівка', type: 'cash', enabled: true },
  { id: '2', name: 'Банківська картка', type: 'card', enabled: true },
  { id: '3', name: 'Приймання металу', type: 'cash', enabled: true },
  { id: '4', name: 'Безготівковий розрахунок', type: 'online', enabled: false }
];

export function Settings() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'cashier' as const,
    password: ''
  });

  // System settings
  const [fiscalSettings, setFiscalSettings] = useState({
    checkboxEnabled: true,
    taxRate: 20,
    companyName: 'ТОВ "Ювелірний світ"',
    companyAddress: 'м. Київ, вул. Хрещатик, 1',
    taxNumber: '12345678'
  });

  const [currencySettings, setCurrencySettings] = useState({
    baseCurrency: 'UAH',
    exchangeRates: {
      USD: 37.5,
      EUR: 40.2
    },
    autoUpdateRates: true
  });

  const [printerSettings, setPrinterSettings] = useState({
    receiptPrinter: 'Epson TM-T20II',
    labelPrinter: 'Zebra ZD220',
    autoprint: true
  });

  const handleAddUser = () => {
    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active'
    };
    
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'cashier', password: '' });
    setShowAddUserDialog(false);
  };

  const handleEditUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } 
        : u
    ));
  };

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(m => 
        m.id === id ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Адміністратор</Badge>;
      case 'manager':
        return <Badge variant="default">Менеджер</Badge>;
      case 'cashier':
        return <Badge variant="secondary">Касир</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="default">Активний</Badge>
      : <Badge variant="outline">Неактивний</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Налаштування системи
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Користувачі</TabsTrigger>
          <TabsTrigger value="payments">Платежі</TabsTrigger>
          <TabsTrigger value="fiscal">Фіскалізація</TabsTrigger>
          <TabsTrigger value="currency">Валюти</TabsTrigger>
          <TabsTrigger value="printing">Друк</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Управління користувачами
                </div>
                <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Додати користувача
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Додати нового користувача</DialogTitle>
                      <DialogDescription>
                        Створіть новий акаунт користувача з правами доступу
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Ім'я</Label>
                        <Input
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Роль</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cashier">Касир</SelectItem>
                            <SelectItem value="manager">Менеджер</SelectItem>
                            <SelectItem value="admin">Адміністратор</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Пароль</Label>
                        <Input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleAddUser} className="flex-1">
                          Додати
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddUserDialog(false)} className="flex-1">
                          Скасувати
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ім'я</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Останній вхід</TableHead>
                    <TableHead>Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin || 'Ніколи'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === 'active' ? 'Деактивувати' : 'Активувати'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Методи оплати
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map(method => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{method.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Тип: {method.type === 'cash' ? 'Готівка' : method.type === 'card' ? 'Картка' : 'Онлайн'}
                    </p>
                  </div>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => togglePaymentMethod(method.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Фіскальні налаштування</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Інтеграція з Checkbox ППРО</Label>
                  <p className="text-sm text-muted-foreground">
                    Автоматична фіскалізація чеків
                  </p>
                </div>
                <Switch
                  checked={fiscalSettings.checkboxEnabled}
                  onCheckedChange={(enabled) => 
                    setFiscalSettings({ ...fiscalSettings, checkboxEnabled: enabled })
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Назва компанії</Label>
                  <Input
                    value={fiscalSettings.companyName}
                    onChange={(e) => 
                      setFiscalSettings({ ...fiscalSettings, companyName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Податковий номер</Label>
                  <Input
                    value={fiscalSettings.taxNumber}
                    onChange={(e) => 
                      setFiscalSettings({ ...fiscalSettings, taxNumber: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div>
                <Label>Адреса</Label>
                <Input
                  value={fiscalSettings.companyAddress}
                  onChange={(e) => 
                    setFiscalSettings({ ...fiscalSettings, companyAddress: e.target.value })
                  }
                />
              </div>
              
              <div>
                <Label>Ставка ПДВ (%)</Label>
                <Input
                  type="number"
                  value={fiscalSettings.taxRate}
                  onChange={(e) => 
                    setFiscalSettings({ ...fiscalSettings, taxRate: Number(e.target.value) })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Налаштування валют
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Базова валюта</Label>
                <Select 
                  value={currencySettings.baseCurrency} 
                  onValueChange={(value) => 
                    setCurrencySettings({ ...currencySettings, baseCurrency: value })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UAH">Гривня (UAH)</SelectItem>
                    <SelectItem value="USD">Долар США (USD)</SelectItem>
                    <SelectItem value="EUR">Євро (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Автоматичне оновлення курсів</Label>
                  <p className="text-sm text-muted-foreground">
                    Оновлення курсів валют раз на годину
                  </p>
                </div>
                <Switch
                  checked={currencySettings.autoUpdateRates}
                  onCheckedChange={(enabled) => 
                    setCurrencySettings({ ...currencySettings, autoUpdateRates: enabled })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Обмінні курси</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">USD</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currencySettings.exchangeRates.USD}
                      onChange={(e) => 
                        setCurrencySettings({
                          ...currencySettings,
                          exchangeRates: {
                            ...currencySettings.exchangeRates,
                            USD: Number(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">EUR</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currencySettings.exchangeRates.EUR}
                      onChange={(e) => 
                        setCurrencySettings({
                          ...currencySettings,
                          exchangeRates: {
                            ...currencySettings.exchangeRates,
                            EUR: Number(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Налаштування друку
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Принтер чеків</Label>
                <Select value={printerSettings.receiptPrinter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Epson TM-T20II">Epson TM-T20II</SelectItem>
                    <SelectItem value="Zebra ZD220">Zebra ZD220</SelectItem>
                    <SelectItem value="Custom Printer">Інший принтер</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Принтер етикеток</Label>
                <Select value={printerSettings.labelPrinter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zebra ZD220">Zebra ZD220</SelectItem>
                    <SelectItem value="Brother QL-1110NWB">Brother QL-1110NWB</SelectItem>
                    <SelectItem value="Dymo LabelWriter">Dymo LabelWriter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Автоматичний друк чеків</Label>
                  <p className="text-sm text-muted-foreground">
                    Друкувати чек автоматично після оплати
                  </p>
                </div>
                <Switch
                  checked={printerSettings.autoprint}
                  onCheckedChange={(enabled) => 
                    setPrinterSettings({ ...printerSettings, autoprint: enabled })
                  }
                />
              </div>
              
              <div className="pt-4">
                <Button>Тестовий друк</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редагувати користувача</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Ім'я</Label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Роль</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Касир</SelectItem>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="admin">Адміністратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditUser} className="flex-1">
                  Зберегти
                </Button>
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                  Скасувати
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}