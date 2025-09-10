import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Plus, Minus, ShoppingCart, User, CreditCard, Banknote, Gem, Settings, Crown, Clock } from 'lucide-react';
import { ProductSearch } from './ProductSearch';
import { CustomerSearch } from './CustomerSearch';
import { Receipt } from './Receipt';
import { PaymentModal } from './PaymentModal';

interface User {
  id: string;
  name: string;
  role: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  weight?: number;
  metal?: string;
  inStock: number;
  storeLocation?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  discount: number;
  totalPurchases: number;
}

interface ReceiptItem {
  product: Product;
  quantity: number;
  discount: number;
  price: number;
}

interface CashierWorkplaceProps {
  currentUser: User;
}

export function CashierWorkplace({ currentUser }: CashierWorkplaceProps) {
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [receiptDiscount, setReceiptDiscount] = useState(0);

  const addToReceipt = (product: Product, quantity: number = 1) => {
    const existingItem = receiptItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setReceiptItems(receiptItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setReceiptItems([...receiptItems, {
        product,
        quantity,
        discount: 0,
        price: product.price
      }]);
    }
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setReceiptItems(receiptItems.filter(item => item.product.id !== productId));
    } else {
      setReceiptItems(receiptItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    setReceiptItems(receiptItems.map(item =>
      item.product.id === productId
        ? { ...item, discount: Math.max(0, Math.min(100, discount)) }
        : item
    ));
  };

  const getSubtotal = () => {
    return receiptItems.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = (itemTotal * item.discount) / 100;
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const receiptDiscountAmount = (subtotal * receiptDiscount) / 100;
    const customerDiscountAmount = selectedCustomer 
      ? (subtotal * selectedCustomer.discount) / 100 
      : 0;
    
    return subtotal - receiptDiscountAmount - customerDiscountAmount;
  };

  const clearReceipt = () => {
    setReceiptItems([]);
    setSelectedCustomer(null);
    setReceiptDiscount(0);
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-white to-slate-50">
      {/* Left Side - Products and Search */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Касове місце</h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Касир: {currentUser.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleTimeString('uk-UA')}
            </div>
          </div>
        </div>

        <div className="p-6">

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl h-14">
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 h-12 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Gem className="h-4 w-4" />
              Товари
            </TabsTrigger>
            <TabsTrigger 
              value="customers"
              className="flex items-center gap-2 h-12 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <User className="h-4 w-4" />
              Клієнти
            </TabsTrigger>
            <TabsTrigger 
              value="services"
              className="flex items-center gap-2 h-12 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              Послуги
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-4">
            <ProductSearch onProductSelect={addToReceipt} />
          </TabsContent>
          
          <TabsContent value="customers" className="mt-4">
            <CustomerSearch
              selectedCustomer={selectedCustomer}
              onCustomerSelect={setSelectedCustomer}
            />
          </TabsContent>
          
          <TabsContent value="services" className="mt-6">
            <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Settings className="h-5 w-5" />
                  Додаткові послуги
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                    onClick={() => addToReceipt({
                      id: 'repair-1',
                      name: 'Ремонт прикрас',
                      price: 500,
                      category: 'service',
                      inStock: 1
                    })}
                  >
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-center">
                      <span className="font-medium">Ремонт</span>
                      <p className="text-sm text-orange-600 font-medium">500 грн</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                    onClick={() => addToReceipt({
                      id: 'resize-1',
                      name: 'Зміна розміру',
                      price: 300,
                      category: 'service',
                      inStock: 1
                    })}
                  >
                    <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                      <Crown className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <span className="font-medium">Зміна розміру</span>
                      <p className="text-sm text-emerald-600 font-medium">300 грн</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Right Side - Receipt */}
      <div className="w-96 bg-gradient-to-b from-white to-slate-50 border-l border-slate-200/60 flex flex-col shadow-xl">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">Чек #{Math.floor(Math.random() * 10000)}</h3>
              <p className="text-slate-300 text-sm">
                {receiptItems.length} позицій
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <Receipt
            items={receiptItems}
            customer={selectedCustomer}
            receiptDiscount={receiptDiscount}
            onUpdateQuantity={updateItemQuantity}
            onUpdateItemDiscount={updateItemDiscount}
            onUpdateReceiptDiscount={setReceiptDiscount}
            onClear={clearReceipt}
          />
        </div>
        
        {/* Summary Section */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Проміжний підсумок:</span>
                  <span className="font-medium">{getSubtotal().toFixed(2)} грн</span>
                </div>
                {selectedCustomer && (
                  <div className="flex justify-between text-green-600">
                    <span>Знижка клієнта ({selectedCustomer.discount}%):</span>
                    <span>-{(getSubtotal() * selectedCustomer.discount / 100).toFixed(2)} грн</span>
                  </div>
                )}
                {receiptDiscount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Знижка на чек ({receiptDiscount}%):</span>
                    <span>-{(getSubtotal() * receiptDiscount / 100).toFixed(2)} грн</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 my-2"></div>
                <div className="flex justify-between text-lg font-bold text-slate-800">
                  <span>До сплати:</span>
                  <span className="text-green-600">{getTotal().toFixed(2)} грн</span>
                </div>
              </div>
            </div>
            
            <Button
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={receiptItems.length === 0}
              onClick={() => setShowPayment(true)}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                Перейти до оплати
              </div>
            </Button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={getTotal()}
          items={receiptItems}
          customer={selectedCustomer}
          onClose={() => setShowPayment(false)}
          onPaymentComplete={clearReceipt}
        />
      )}
    </div>
  );
}