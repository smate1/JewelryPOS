import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Search, Plus, Edit, Trash2, Upload, Download, QrCode } from 'lucide-react';
import { productsApi } from '../utils/api';
import { getSupabaseClient } from '../utils/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  weight?: number;
  metal?: string;
  inStock: number;
  storeLocation?: string;
  description?: string;
  supplier?: string;
  costPrice?: number;
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Золота каблучка з діамантом',
    price: 25000,
    category: 'rings',
    weight: 3.2,
    metal: 'gold',
    inStock: 2,
    storeLocation: 'Основний зал',
    description: 'Елегантна каблучка з натуральним діамантом',
    supplier: 'Gold Craft Ltd',
    costPrice: 18000
  },
  {
    id: '2',
    name: 'Срібний ланцюжок',
    price: 1200,
    category: 'chains',
    weight: 15.5,
    metal: 'silver',
    inStock: 5,
    storeLocation: 'Вітрина 1',
    description: 'Класичний срібний ланцюжок',
    supplier: 'Silver Style',
    costPrice: 800
  }
];

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      if (response.products && response.products.length > 0) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '',
    weight: 0,
    metal: '',
    inStock: 0,
    storeLocation: '',
    description: '',
    supplier: '',
    costPrice: 0
  });

  const categories = [
    { value: 'all', label: 'Всі категорії' },
    { value: 'rings', label: 'Каблучки' },
    { value: 'chains', label: 'Ланцюжки' },
    { value: 'earrings', label: 'Сережки' },
    { value: 'pendants', label: 'Підвіски' },
    { value: 'bracelets', label: 'Браслети' }
  ];

  const metals = ['gold', 'silver', 'platinum'];
  const locations = ['Основний зал', 'Вітрина 1', 'Вітрина 2', 'Сейф', 'Склад'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const productData = {
        name: newProduct.name || '',
        price: newProduct.price || 0,
        category: newProduct.category || '',
        weight: newProduct.weight,
        metal: newProduct.metal,
        inStock: newProduct.inStock || 0,
        storeLocation: newProduct.storeLocation,
        description: newProduct.description,
        supplier: newProduct.supplier,
        costPrice: newProduct.costPrice
      };

      let product;
      
      // Try API call if we have a token, otherwise create locally for demo
      if (accessToken) {
        const response = await productsApi.create(productData, accessToken);
        product = response.product;
      } else {
        // Create locally for demo mode
        product = {
          id: `new-${Date.now()}`,
          ...productData
        };
      }

      setProducts([...products, product]);
      setNewProduct({});
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to create product:', error);
      // Always fallback to local creation for demo compatibility
      const product: Product = {
        id: `new-${Date.now()}`,
        name: newProduct.name || '',
        price: newProduct.price || 0,
        category: newProduct.category || '',
        weight: newProduct.weight,
        metal: newProduct.metal,
        inStock: newProduct.inStock || 0,
        storeLocation: newProduct.storeLocation,
        description: newProduct.description,
        supplier: newProduct.supplier,
        costPrice: newProduct.costPrice
      };

      setProducts([...products, product]);
      setNewProduct({});
      setShowAddDialog(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Try API call if we have a token, otherwise work locally for demo
      if (accessToken) {
        await productsApi.update(editingProduct.id, editingProduct, accessToken);
      }
      
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ));
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
      // Always fallback to local update for demo compatibility
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ));
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Try API call if we have a token, otherwise work locally for demo
      if (accessToken) {
        await productsApi.delete(id, accessToken);
      }
      
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      // Fallback to local deletion for demo
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const getMetalBadgeColor = (metal?: string) => {
    switch (metal) {
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      case 'platinum': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Назва', 'Ціна', 'Категорія', 'Метал', 'Вага', 'Кількість', 'Місцезнаходження'];
    const data = products.map(p => [
      p.id, p.name, p.price, p.category, p.metal || '', p.weight || '', p.inStock, p.storeLocation || ''
    ]);
    
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Управління товарами</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Експорт
              </Button>
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Імпорт
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Імпорт товарів</DialogTitle>
                    <DialogDescription>
                      Завантажте CSV файл з товарами для масового додавання в систему
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Завантажити CSV файл</Label>
                      <Input type="file" accept=".csv" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Формат: ID, Назва, Ціна, Категорія, Метал, Вага, Кількість, Місцезнаходження
                    </p>
                    <div className="flex gap-2">
                      <Button className="flex-1">Імпортувати</Button>
                      <Button variant="outline" className="flex-1" onClick={() => setShowImportDialog(false)}>
                        Скасувати
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Додати товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Додати новий товар</DialogTitle>
                    <DialogDescription>
                      Створіть новий товар з повним описом та параметрами
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Назва</Label>
                        <Input
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Артикул</Label>
                        <Input
                          value={newProduct.id || `AUTO-${Date.now()}`}
                          onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Категорія</Label>
                        <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть категорію" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.slice(1).map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Метал</Label>
                        <Select value={newProduct.metal} onValueChange={(value) => setNewProduct({ ...newProduct, metal: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть метал" />
                          </SelectTrigger>
                          <SelectContent>
                            {metals.map(metal => (
                              <SelectItem key={metal} value={metal}>
                                {metal === 'gold' ? 'Золото' : metal === 'silver' ? 'Срібло' : 'Платина'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Вага (г)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newProduct.weight}
                          onChange={(e) => setNewProduct({ ...newProduct, weight: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Кількість</Label>
                        <Input
                          type="number"
                          value={newProduct.inStock}
                          onChange={(e) => setNewProduct({ ...newProduct, inStock: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Місцезнаходження</Label>
                        <Select value={newProduct.storeLocation} onValueChange={(value) => setNewProduct({ ...newProduct, storeLocation: value })}>
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
                        <Label>Закупівельна ціна</Label>
                        <Input
                          type="number"
                          value={newProduct.costPrice}
                          onChange={(e) => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Продажна ціна</Label>
                        <Input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Постачальник</Label>
                      <Input
                        value={newProduct.supplier}
                        onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Опис</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddProduct} className="flex-1">
                        Додати товар
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                        Скасувати
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Пошук товарів..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
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
                <TableHead>Артикул</TableHead>
                <TableHead>Назва</TableHead>
                <TableHead>Категорія</TableHead>
                <TableHead>Метал/Вага</TableHead>
                <TableHead>Кількість</TableHead>
                <TableHead>Ціна</TableHead>
                <TableHead>Місце</TableHead>
                <TableHead>Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono">{product.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories.find(c => c.value === product.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {product.metal && (
                        <Badge className={`${getMetalBadgeColor(product.metal)} text-white`}>
                          {product.metal === 'gold' ? 'Золото' : 
                           product.metal === 'silver' ? 'Срібло' : 'Платина'}
                        </Badge>
                      )}
                      {product.weight && (
                        <p className="text-sm text-muted-foreground">{product.weight}г</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.inStock > 0 ? 'default' : 'destructive'}>
                      {product.inStock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.price.toLocaleString()} грн</p>
                      {product.costPrice && (
                        <p className="text-sm text-muted-foreground">
                          Закуп: {product.costPrice.toLocaleString()} грн
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{product.storeLocation}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редагувати товар</DialogTitle>
              <DialogDescription>
                Змінити параметри та характеристики товару
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Назва</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Артикул</Label>
                  <Input
                    value={editingProduct.id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, id: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Продажна ціна</Label>
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Кількість</Label>
                  <Input
                    type="number"
                    value={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Місцезнаходження</Label>
                <Select 
                  value={editingProduct.storeLocation} 
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, storeLocation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditProduct} className="flex-1">
                  Зберегти зміни
                </Button>
                <Button variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">
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