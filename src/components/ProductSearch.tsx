import React, { useState, useMemo, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Package, MapPin, Filter, Gem, Star, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { productsApi } from '../utils/api';

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

interface ProductSearchProps {
  onProductSelect: (product: Product, quantity?: number) => void;
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
    storeLocation: 'Основний зал'
  },
  {
    id: '2',
    name: 'Срібний ланцюжок',
    price: 1200,
    category: 'chains',
    weight: 15.5,
    metal: 'silver',
    inStock: 5,
    storeLocation: 'Вітрина 1'
  },
  {
    id: '3',
    name: 'Сережки з перлами',
    price: 8500,
    category: 'earrings',
    weight: 2.1,
    metal: 'gold',
    inStock: 3,
    storeLocation: 'Вітрина 2'
  },
  {
    id: '4',
    name: 'Підвіска з сапфіром',
    price: 15000,
    category: 'pendants',
    weight: 4.0,
    metal: 'gold',
    inStock: 1,
    storeLocation: 'Сейф'
  },
  {
    id: '5',
    name: 'Браслет срібний',
    price: 2800,
    category: 'bracelets',
    weight: 12.3,
    metal: 'silver',
    inStock: 4,
    storeLocation: 'Основний зал'
  },
  {
    id: '6',
    name: 'Обручка платинова',
    price: 45000,
    category: 'rings',
    weight: 5.1,
    metal: 'platinum',
    inStock: 1,
    storeLocation: 'Сейф'
  }
];

const categories = [
  { value: 'all', label: 'Всі категорії' },
  { value: 'rings', label: 'Каблучки' },
  { value: 'chains', label: 'Ланцюжки' },
  { value: 'earrings', label: 'Сережки' },
  { value: 'pendants', label: 'Підвіски' },
  { value: 'bracelets', label: 'Браслети' }
];

const metals = [
  { value: 'all', label: 'Всі метали' },
  { value: 'gold', label: 'Золото' },
  { value: 'silver', label: 'Срібло' },
  { value: 'platinum', label: 'Платина' }
];

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMetal, setSelectedMetal] = useState('all');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);

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
      // Keep using mock data on error
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.id.includes(searchTerm);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesMetal = selectedMetal === 'all' || product.metal === selectedMetal;
      
      return matchesSearch && matchesCategory && matchesMetal;
    });
  }, [searchTerm, selectedCategory, selectedMetal]);

  const getMetalBadgeColor = (metal?: string) => {
    switch (metal) {
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      case 'platinum': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            Каталог товарів
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="🔍 Пошук за назвою або артикулом..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Категорія</span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-300">
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
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Gem className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Метал</span>
              </div>
              <Select value={selectedMetal} onValueChange={setSelectedMetal}>
                <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metals.map(metal => (
                    <SelectItem key={metal.value} value={metal.value}>
                      {metal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 overflow-hidden group">
            <CardContent className="p-0">
              {/* Product Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-sm text-slate-500">
                      Артикул: <span className="font-mono">{product.id}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full">
                      <p className="font-bold text-lg">{product.price.toLocaleString()} грн</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.metal && (
                    <Badge className={`${getMetalBadgeColor(product.metal)} text-white border-0 shadow-sm`}>
                      <Gem className="h-3 w-3 mr-1" />
                      {product.metal === 'gold' ? 'Золото' : 
                       product.metal === 'silver' ? 'Срібло' : 'Платина'}
                    </Badge>
                  )}
                  {product.weight && (
                    <Badge variant="outline" className="border-slate-300 text-slate-600">
                      ⚖️ {product.weight}г
                    </Badge>
                  )}
                  <Badge 
                    className={product.inStock > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}
                  >
                    📦 {product.inStock} шт
                  </Badge>
                </div>
                
                {product.storeLocation && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{product.storeLocation}</span>
                  </div>
                )}
                
                <Button
                  className={`w-full h-12 transition-all duration-200 ${
                    product.inStock === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl'
                  }`}
                  disabled={product.inStock === 0}
                  onClick={() => onProductSelect(product)}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    {product.inStock === 0 ? 'Немає в наявності' : 'Додати в кошик'}
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Товарів не знайдено</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}