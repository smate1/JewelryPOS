import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Search, User, Plus, Phone, Percent } from 'lucide-react';
import { customersApi } from '../utils/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  discount: number;
  totalPurchases: number;
}

interface CustomerSearchProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
}

// Mock customers data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Іван Петренко',
    phone: '+380501234567',
    discount: 5,
    totalPurchases: 45000
  },
  {
    id: '2',
    name: 'Марія Коваленко',
    phone: '+380679876543',
    discount: 10,
    totalPurchases: 120000
  },
  {
    id: '3',
    name: 'Олександр Сидоренко',
    phone: '+380631111222',
    discount: 3,
    totalPurchases: 25000
  },
  {
    id: '4',
    name: 'Анна Мельник',
    phone: '+380502223344',
    discount: 15,
    totalPurchases: 200000
  }
];

export function CustomerSearch({ selectedCustomer, onCustomerSelect }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [loading, setLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    discount: 0
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getAll();
      if (response.customers && response.customers.length > 0) {
        setCustomers(response.customers);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      // Keep using mock data on error
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.phone) {
      try {
        const customerData = {
          name: newCustomer.name,
          phone: newCustomer.phone,
          discount: newCustomer.discount,
          totalPurchases: 0
        };
        
        const response = await customersApi.create(customerData);
        const customer = response.customer;
        
        setCustomers([customer, ...customers]);
        onCustomerSelect(customer);
        setNewCustomer({ name: '', phone: '', discount: 0 });
        setShowAddDialog(false);
      } catch (error) {
        console.error('Failed to create customer:', error);
        // Fallback to local creation
        const customer: Customer = {
          id: `new-${Date.now()}`,
          name: newCustomer.name,
          phone: newCustomer.phone,
          discount: newCustomer.discount,
          totalPurchases: 0
        };
        
        onCustomerSelect(customer);
        setNewCustomer({ name: '', phone: '', discount: 0 });
        setShowAddDialog(false);
      }
    }
  };

  const getDiscountBadgeVariant = (discount: number) => {
    if (discount >= 10) return 'default';
    if (discount >= 5) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Пошук клієнтів
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Новий клієнт
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Додати нового клієнта</DialogTitle>
                  <DialogDescription>
                    Створіть новий профіль клієнта з контактними даними та знижкою
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ім'я</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="Ім'я клієнта"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      placeholder="+380501234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Знижка (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="50"
                      value={newCustomer.discount}
                      onChange={(e) => setNewCustomer({ ...newCustomer, discount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddCustomer} className="flex-1">
                      Додати
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddDialog(false)}
                      className="flex-1"
                    >
                      Скасувати
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Пошук за ім'ям або телефоном..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCustomer && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Обраний клієнт</h4>
                <p>{selectedCustomer.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {selectedCustomer.phone}
                </p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant={getDiscountBadgeVariant(selectedCustomer.discount)}>
                  <Percent className="h-3 w-3 mr-1" />
                  {selectedCustomer.discount}% знижка
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Покупок на {selectedCustomer.totalPurchases.toLocaleString()} грн
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => onCustomerSelect(null)}
            >
              Скасувати вибір
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCustomers.map(customer => (
          <Card 
            key={customer.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedCustomer?.id === customer.id ? 'border-primary' : ''
            }`}
            onClick={() => onCustomerSelect(customer)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{customer.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={getDiscountBadgeVariant(customer.discount)}>
                    <Percent className="h-3 w-3 mr-1" />
                    {customer.discount}%
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {customer.totalPurchases.toLocaleString()} грн
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredCustomers.length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Клієнтів не знайдено</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}