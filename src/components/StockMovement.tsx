import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowRightLeft, Plus, MapPin, Package, Calendar } from 'lucide-react';

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  reason: string;
  date: string;
  performedBy: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Mock stock movements data
const mockMovements: StockMovement[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Золота каблучка з діамантом',
    fromLocation: 'Склад',
    toLocation: 'Основний зал',
    quantity: 1,
    reason: 'Поповнення вітрини',
    date: '2024-01-15',
    performedBy: 'Анна Менеджер',
    status: 'completed'
  },
  {
    id: '2',
    productId: '2',
    productName: 'Срібний ланцюжок',
    fromLocation: 'Вітрина 1',
    toLocation: 'Склад',
    quantity: 2,
    reason: 'Переоцінка',
    date: '2024-01-14',
    performedBy: 'Сергій Адмін',
    status: 'completed'
  },
  {
    id: '3',
    productId: '3',
    productName: 'Сережки з перлами',
    fromLocation: 'Основний зал',
    toLocation: 'Сейф',
    quantity: 1,
    reason: 'Безпека',
    date: '2024-01-13',
    performedBy: 'Анна Менеджер',
    status: 'pending'
  }
];

const locations = ['Основний зал', 'Вітрина 1', 'Вітрина 2', 'Сейф', 'Склад', 'Філія 2', 'Ремонт'];
const reasons = [
  'Поповнення вітрини',
  'Переміщення між філіями',
  'Відправка на ремонт',
  'Повернення з ремонту',
  'Переоцінка',
  'Інвентаризація',
  'Безпека',
  'Продаж'
];

export function StockMovement() {
  const [movements, setMovements] = useState<StockMovement[]>(mockMovements);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newMovement, setNewMovement] = useState({
    productId: '',
    productName: '',
    fromLocation: '',
    toLocation: '',
    quantity: 1,
    reason: ''
  });

  const filteredMovements = movements.filter(movement => 
    selectedStatus === 'all' || movement.status === selectedStatus
  );

  const handleAddMovement = () => {
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      ...newMovement,
      date: new Date().toISOString().split('T')[0],
      performedBy: 'Поточний користувач',
      status: 'pending'
    };

    setMovements([movement, ...movements]);
    setNewMovement({
      productId: '',
      productName: '',
      fromLocation: '',
      toLocation: '',
      quantity: 1,
      reason: ''
    });
    setShowAddDialog(false);
  };

  const updateMovementStatus = (id: string, status: 'completed' | 'cancelled') => {
    setMovements(movements.map(m => 
      m.id === id ? { ...m, status } : m
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Виконано</Badge>;
      case 'pending':
        return <Badge variant="secondary">Очікує</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Скасовано</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Переміщення товарів
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Нове переміщення
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Створити переміщення товару</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Товар</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Артикул товару"
                        value={newMovement.productId}
                        onChange={(e) => setNewMovement({ ...newMovement, productId: e.target.value })}
                        className="w-1/3"
                      />
                      <Input
                        placeholder="Назва товару"
                        value={newMovement.productName}
                        onChange={(e) => setNewMovement({ ...newMovement, productName: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Звідки</Label>
                      <Select 
                        value={newMovement.fromLocation} 
                        onValueChange={(value) => setNewMovement({ ...newMovement, fromLocation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть місце" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Куди</Label>
                      <Select 
                        value={newMovement.toLocation} 
                        onValueChange={(value) => setNewMovement({ ...newMovement, toLocation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть місце" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Кількість</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newMovement.quantity}
                        onChange={(e) => setNewMovement({ ...newMovement, quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Причина</Label>
                      <Select 
                        value={newMovement.reason} 
                        onValueChange={(value) => setNewMovement({ ...newMovement, reason: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть причину" />
                        </SelectTrigger>
                        <SelectContent>
                          {reasons.map(reason => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddMovement} className="flex-1">
                      Створити переміщення
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                      Скасувати
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі статуси</SelectItem>
                <SelectItem value="pending">Очікують</SelectItem>
                <SelectItem value="completed">Виконані</SelectItem>
                <SelectItem value="cancelled">Скасовані</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Переміщення</TableHead>
                <TableHead>Кількість</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Виконавець</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map(movement => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(movement.date).toLocaleDateString('uk-UA')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{movement.productName}</p>
                      <p className="text-sm text-muted-foreground">{movement.productId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{movement.fromLocation}</span>
                      </div>
                      <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{movement.toLocation}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {movement.quantity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{movement.reason}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{movement.performedBy}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(movement.status)}
                  </TableCell>
                  <TableCell>
                    {movement.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateMovementStatus(movement.id, 'completed')}
                        >
                          Виконати
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateMovementStatus(movement.id, 'cancelled')}
                        >
                          Скасувати
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Масовий друк етикеток</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Друк етикеток для товарів
            </p>
            <Button variant="outline" className="w-full">
              Почати друк
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Переоцінка товарів</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Масова зміна цін товарів
            </p>
            <Button variant="outline" className="w-full">
              Почати переоцінку
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Звіт по місцезнаходженню</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Аналіз товарів по локаціях
            </p>
            <Button variant="outline" className="w-full">
              Переглянути звіт
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}