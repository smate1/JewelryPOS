import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar, Download, TrendingUp, DollarSign, Package, Users, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { reportsApi, metalApi } from '../utils/api';
import { getSupabaseClient } from '../utils/supabase/client';

// Mock data for charts
const salesData = [
  { date: '2024-01-01', sales: 45000, transactions: 12 },
  { date: '2024-01-02', sales: 52000, transactions: 15 },
  { date: '2024-01-03', sales: 38000, transactions: 9 },
  { date: '2024-01-04', sales: 61000, transactions: 18 },
  { date: '2024-01-05', sales: 48000, transactions: 14 },
  { date: '2024-01-06', sales: 55000, transactions: 16 },
  { date: '2024-01-07', sales: 47000, transactions: 13 }
];

const categoryData = [
  { name: 'Каблучки', value: 45, sales: 180000 },
  { name: 'Ланцюжки', value: 25, sales: 95000 },
  { name: 'Сережки', value: 20, sales: 78000 },
  { name: 'Браслети', value: 10, sales: 42000 }
];

const metalData = [
  { metal: 'Золото', weight: 245.6, value: 4912000, avg_price: 2000 },
  { metal: 'Срібло', weight: 1850.2, value: 462550, avg_price: 25 },
  { metal: 'Платина', weight: 45.8, value: 549600, avg_price: 1200 }
];

const topProducts = [
  { id: '1', name: 'Золота каблучка з діамантом', sold: 8, revenue: 200000 },
  { id: '2', name: 'Срібний ланцюжок', sold: 15, revenue: 18000 },
  { id: '3', name: 'Сережки з перлами', sold: 6, revenue: 51000 },
  { id: '4', name: 'Браслет золотий', sold: 4, revenue: 84000 },
  { id: '5', name: 'Підвіска з сапфіром', sold: 3, revenue: 45000 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function Reports() {
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-01-07');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('UAH');
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [metalSummary, setMetalSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    loadReports();
  }, [dateFrom, dateTo]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (accessToken) {
        const [salesResponse, metalResponse] = await Promise.all([
          reportsApi.getSalesSummary(dateFrom, dateTo, accessToken),
          metalApi.getSummary(accessToken)
        ]);

        setSalesSummary(salesResponse.summary);
        setMetalSummary(metalResponse.metalSummary);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const stores = [
    { value: 'all', label: 'Всі магазини' },
    { value: 'main', label: 'Головний магазин' },
    { value: 'branch1', label: 'Філія 1' },
    { value: 'branch2', label: 'Філія 2' }
  ];

  const currencies = [
    { value: 'UAH', label: 'Гривня (UAH)' },
    { value: 'USD', label: 'Долар (USD)' },
    { value: 'EUR', label: 'Євро (EUR)' }
  ];

  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalTransactions = salesData.reduce((sum, day) => sum + day.transactions, 0);
  const avgTransactionValue = totalSales / totalTransactions;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Звіти та аналітика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <Label>Період з</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>По</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Магазин</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.value} value={store.value}>
                      {store.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Валюта</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Експорт
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Загальні продажі</p>
                <p className="text-2xl font-semibold">{totalSales.toLocaleString()} грн</p>
                <p className="text-sm text-green-600">+12% від минулого тижня</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Кількість транзакцій</p>
                <p className="text-2xl font-semibold">{totalTransactions}</p>
                <p className="text-sm text-blue-600">+8% від минулого тижня</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Середній чек</p>
                <p className="text-2xl font-semibold">{avgTransactionValue.toFixed(0)} грн</p>
                <p className="text-sm text-orange-600">+3% від минулого тижня</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Унікальних клієнтів</p>
                <p className="text-2xl font-semibold">89</p>
                <p className="text-sm text-purple-600">+15% від минулого тижня</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Продажі</TabsTrigger>
          <TabsTrigger value="products">Товари</TabsTrigger>
          <TabsTrigger value="metals">Метали</TabsTrigger>
          <TabsTrigger value="financial">Фінанси</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Динаміка продажів</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Продажі за категоріями</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ товарів</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead>Продано</TableHead>
                      <TableHead>Дохід</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sold}</TableCell>
                        <TableCell>{product.revenue.toLocaleString()} грн</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Аналіз товарів</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Аналіз металів</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Метал</TableHead>
                    <TableHead>Загальна вага (г)</TableHead>
                    <TableHead>Середня ціна за грам</TableHead>
                    <TableHead>Загальна вартість</TableHead>
                    <TableHead>Частка в портфелі</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metalData.map((metal) => (
                    <TableRow key={metal.metal}>
                      <TableCell>
                        <Badge className={
                          metal.metal === 'Золото' ? 'bg-yellow-500' :
                          metal.metal === 'Срібло' ? 'bg-gray-400' : 'bg-blue-400'
                        }>
                          {metal.metal}
                        </Badge>
                      </TableCell>
                      <TableCell>{metal.weight.toFixed(1)} г</TableCell>
                      <TableCell>{metal.avg_price.toLocaleString()} грн</TableCell>
                      <TableCell>{metal.value.toLocaleString()} грн</TableCell>
                      <TableCell>
                        {((metal.value / metalData.reduce((sum, m) => sum + m.value, 0)) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Інкасація каси</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Готівка в касі:</span>
                    <span className="font-semibold">23,450 грн</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Картковий оборот:</span>
                    <span className="font-semibold">156,780 грн</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Загальний оборот:</span>
                    <span className="font-semibold">180,230 грн</span>
                  </div>
                </div>
                <Button className="w-full">
                  Провести інкасацію
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Витрати по точці</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Заробітна плата:</span>
                    <span>45,000 грн</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Оренда:</span>
                    <span>25,000 грн</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Комунальні послуги:</span>
                    <span>8,500 грн</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Інше:</span>
                    <span>5,200 грн</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Загальні витрати:</span>
                    <span>83,700 грн</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}