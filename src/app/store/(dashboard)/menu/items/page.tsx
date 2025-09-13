'use client';

import {
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Filter,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Utensils,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMenuApi } from '@/hooks/useMenuApi';
import { useMenuStore } from '@/lib/store/menuStore';

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  icon: string;
  active: boolean;
  categoryId: string;
  categoryTitle: string;
  imagesCount: number;
  createdAt: string;
}

export default function ItemsManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');
  const categoryId = searchParams.get('category');

  const { getSelectedStore } = useMenuStore();
  const { listItems, deleteItem } = useMenuApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  // Get items from API
  const {
    data: itemsData,
    isLoading: loading,
    refetch,
  } = listItems({
    categoryId: categoryId || undefined,
    limit: 100,
  });

  const items = itemsData?.items || [];
  const selectedStore = getSelectedStore();

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !categoryId || item.categoryId === categoryId;

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && item.active) ||
      (filterActive === 'inactive' && !item.active);

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'IRR') {
      return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleCreateItem = () => {
    const url = categoryId
      ? `/store/menu/items/create?branch=${branchId}&category=${categoryId}`
      : `/store/menu/items/create?branch=${branchId}`;
    router.push(url);
  };

  const handleEditItem = (itemId: string) => {
    router.push(`/store/menu/items/${itemId}/edit?branch=${branchId}`);
  };

  const handleToggleActive = async (itemId: string) => {
    // TODO: Implement toggle active API call
    console.log('Toggle active for item:', itemId);
    refetch();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
      try {
        await deleteItem.mutateAsync({ id: itemId });
        refetch();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('خطا در حذف آیتم');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              در حال بارگذاری...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            مدیریت آیتم‌های منو
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {selectedStore?.title} -{' '}
            {categoryId ? 'آیتم‌های دسته‌بندی انتخاب شده' : 'تمام آیتم‌های منو'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/store/menu')}
            variant="outline"
            size="sm"
          >
            بازگشت
          </Button>
          <Button onClick={handleCreateItem} size="sm">
            <Plus className="w-4 h-4 ml-2" />
            آیتم جدید
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              جستجو در آیتم‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="جستجو در نام یا توضیحات آیتم..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              فیلتر وضعیت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'همه' },
                { value: 'active', label: 'فعال' },
                { value: 'inactive', label: 'غیرفعال' },
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setFilterActive(filter.value as any)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all ${
                    filterActive === filter.value
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">آمار کلی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  کل آیتم‌ها:
                </span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  فعال:
                </span>
                <span className="font-semibold text-green-600">
                  {items.filter(i => i.active).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  غیرفعال:
                </span>
                <span className="font-semibold text-red-600">
                  {items.filter(i => !i.active).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge
                      variant={item.active ? 'default' : 'secondary'}
                      className={
                        item.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }
                    >
                      {item.active ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {item.description}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4" />
                    <span>قیمت:</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatPrice(Number(item.price), item.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Utensils className="w-4 h-4" />
                    <span>دسته‌بندی:</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.category?.title || 'نامشخص'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                    <span>تصاویر:</span>
                  </div>
                  <span className="text-sm">
                    {item.images?.length || 0} تصویر
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleEditItem(item.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 ml-2" />
                  ویرایش
                </Button>
                <Button
                  onClick={() => handleToggleActive(item.id)}
                  variant="outline"
                  size="sm"
                  className={
                    item.active
                      ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                      : 'text-green-600 border-green-200 hover:bg-green-50'
                  }
                >
                  {item.active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => handleDeleteItem(item.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {searchTerm || filterActive !== 'all'
                  ? 'آیتمی یافت نشد'
                  : 'هنوز آیتمی ایجاد نکرده‌اید'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchTerm || filterActive !== 'all'
                  ? 'لطفاً فیلترهای جستجو را تغییر دهید'
                  : 'برای شروع، اولین آیتم منوی خود را ایجاد کنید'}
              </p>
              {!searchTerm && filterActive === 'all' && (
                <Button onClick={handleCreateItem}>
                  <Plus className="w-4 h-4 ml-2" />
                  ایجاد آیتم جدید
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
