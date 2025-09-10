import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Package, Users, FileText, BarChart3, ArrowRightLeft, DollarSign } from 'lucide-react';
import { ProductManagement } from './ProductManagement';
import { StockMovement } from './StockMovement';
import { Reports } from './Reports';
import { Settings } from './Settings';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AdminPanelProps {
  currentUser: User;
}

export function AdminPanel({ currentUser }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('products');

  const adminStats = [
    {
      title: 'Товарів в наявності',
      value: '2,847',
      icon: Package,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Продажі за день',
      value: '₴45,230',
      icon: DollarSign,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Переміщення товару',
      value: '23',
      icon: ArrowRightLeft,
      change: '+3',
      changeType: 'neutral' as const
    },
    {
      title: 'Активних клієнтів',
      value: '1,234',
      icon: Users,
      change: '+15%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1>Панель адміністрування</h1>
          <p className="text-muted-foreground">Адміністратор: {currentUser.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'negative' ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      {stat.change} від вчора
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Товари
            </TabsTrigger>
            <TabsTrigger value="movement" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Переміщення
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Звіти
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Інвентаризація
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Налаштування
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="movement">
            <StockMovement />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Інвентаризація товару</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Інвентаризація</h3>
                    <p className="text-muted-foreground mb-4">
                      Проведіть інвентаризацію товару за допомогою сканера
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full max-w-xs">
                        Почати нову інвентаризацію
                      </Button>
                      <Button variant="outline" className="w-full max-w-xs">
                        Продовжити останню
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}