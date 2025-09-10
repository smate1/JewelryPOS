import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Trash2, Plus, Minus, Receipt as ReceiptIcon, User, Star, Percent } from 'lucide-react';

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

interface ReceiptProps {
  items: ReceiptItem[];
  customer: Customer | null;
  receiptDiscount: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateItemDiscount: (productId: string, discount: number) => void;
  onUpdateReceiptDiscount: (discount: number) => void;
  onClear: () => void;
}

export function Receipt({
  items,
  customer,
  receiptDiscount,
  onUpdateQuantity,
  onUpdateItemDiscount,
  onUpdateReceiptDiscount,
  onClear
}: ReceiptProps) {
  const getItemTotal = (item: ReceiptItem) => {
    const subtotal = item.price * item.quantity;
    const discountAmount = (subtotal * item.discount) / 100;
    return subtotal - discountAmount;
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  const getCustomerDiscount = () => {
    return customer ? (getSubtotal() * customer.discount) / 100 : 0;
  };

  const getReceiptDiscountAmount = () => {
    return (getSubtotal() * receiptDiscount) / 100;
  };

  const getTotal = () => {
    return getSubtotal() - getCustomerDiscount() - getReceiptDiscountAmount();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ReceiptIcon className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-800">Кошик</h3>
        </div>
        {items.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {customer && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-800">{customer.name}</p>
                <p className="text-sm text-emerald-600">{customer.phone}</p>
              </div>
              <Badge className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-1">
                <Star className="h-3 w-3" />
                {customer.discount}%
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${item.product.id}-${index}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="mb-3">
                <h4 className="font-medium text-slate-800 mb-1">{item.product.name}</h4>
                <p className="text-sm text-slate-500">
                  {item.price.toLocaleString()} грн за шт.
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-red-200 hover:border-red-300 hover:bg-red-50"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3 text-red-600" />
                  </Button>
                  <div className="w-12 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium">{item.quantity}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-green-200 hover:border-green-300 hover:bg-green-50"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3 text-green-600" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">
                    {getItemTotal(item).toFixed(2)} грн
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <div className="p-1 bg-orange-100 rounded">
                  <Percent className="h-3 w-3 text-orange-600" />
                </div>
                <Label htmlFor={`discount-${item.product.id}`} className="text-xs text-slate-600">
                  Знижка:
                </Label>
                <Input
                  id={`discount-${item.product.id}`}
                  type="number"
                  min="0"
                  max="50"
                  value={item.discount}
                  onChange={(e) => onUpdateItemDiscount(item.product.id, Number(e.target.value))}
                  className="h-7 w-16 text-xs bg-orange-50 border-orange-200 focus:border-orange-300"
                />
                <span className="text-xs text-slate-500">%</span>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="p-6 bg-slate-50 rounded-2xl inline-block mb-4">
              <ReceiptIcon className="h-12 w-12 mx-auto text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Кошик порожній</p>
            <p className="text-sm text-slate-400 mt-1">Додайте товари для створення чеку</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Percent className="h-4 w-4 text-amber-600" />
              </div>
              <Label htmlFor="receipt-discount" className="font-medium text-amber-800">
                Додаткова знижка на чек:
              </Label>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Input
                id="receipt-discount"
                type="number"
                min="0"
                max="30"
                value={receiptDiscount}
                onChange={(e) => onUpdateReceiptDiscount(Number(e.target.value))}
                className="h-10 w-24 bg-white border-amber-200 focus:border-amber-300"
              />
              <span className="text-amber-700 font-medium">%</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Проміжний підсумок:</span>
                <span className="font-medium">{getSubtotal().toFixed(2)} грн</span>
              </div>
              
              {customer && customer.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Знижка клієнта ({customer.discount}%):</span>
                  <span className="font-medium">-{getCustomerDiscount().toFixed(2)} грн</span>
                </div>
              )}
              
              {receiptDiscount > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Знижка на чек ({receiptDiscount}%):</span>
                  <span className="font-medium">-{getReceiptDiscountAmount().toFixed(2)} грн</span>
                </div>
              )}
              
              <div className="h-px bg-amber-200 my-2"></div>
              <div className="flex justify-between text-lg font-bold text-slate-800">
                <span>До сплати:</span>
                <span className="text-green-600">{getTotal().toFixed(2)} грн</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}