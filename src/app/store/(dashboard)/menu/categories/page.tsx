'use client';

import {
  ArrowRight,
  Edit,
  Eye,
  EyeOff,
  FolderOpen,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMenuApi } from '@/hooks/useMenuApi';
import { useMenuStore } from '@/lib/store/menuStore';

interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  active: boolean;
  itemsCount: number;
  createdAt: string;
}

export default function CategoriesManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('branch');

  const { getSelectedStore } = useMenuStore();
  const { listCategories, deleteCategory } = useMenuApi();
  const [searchTerm, setSearchTerm] = useState('');

  // Get categories from API
  const {
    data: categoriesData,
    isLoading: loading,
    refetch,
  } = listCategories({
    storeBranchId: storeId || '', // Assuming storeId is actually storeBranchId
    limit: 100,
  });

  const categories = categoriesData?.categories || [];

  const selectedStore = getSelectedStore();

  const filteredCategories = categories.filter(
    category =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = () => {
    router.push(`/store/menu/categories/create?store=${storeId}`);
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/store/menu/categories/${categoryId}/edit?store=${storeId}`);
  };

  const handleViewItems = (categoryId: string) => {
    router.push(`/store/menu/items?store=${storeId}&category=${categoryId}`);
  };

  const handleToggleActive = async (categoryId: string) => {
    // TODO: Implement toggle active API call
    console.log('Toggle active for category:', categoryId);
    refetch();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      try {
        await deleteCategory.mutateAsync({ id: categoryId });
        refetch();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('خطا در حذف دسته‌بندی');
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
            مدیریت دسته‌بندی‌ها
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {selectedStore?.title} - مدیریت دسته‌بندی‌های منو
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
          <Button onClick={handleCreateCategory} size="sm">
            <Plus className="w-4 h-4 ml-2" />
            دسته‌بندی جدید
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              جستجو در دسته‌بندی‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="جستجو در نام یا توضیحات دسته‌بندی..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
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
                  کل دسته‌بندی‌ها:
                </span>
                <span className="font-semibold">{categories.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  فعال:
                </span>
                <span className="font-semibold text-green-600">
                  {categories.filter(c => c.active).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  غیرفعال:
                </span>
                <span className="font-semibold text-red-600">
                  {categories.filter(c => !c.active).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map(category => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <Badge
                      variant={category.active ? 'default' : 'secondary'}
                      className={
                        category.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }
                    >
                      {category.active ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {category.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <FolderOpen className="w-4 h-4" />
                  <span>{category.Item?.length || 0} آیتم</span>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(category.createdAt).toLocaleDateString('fa-IR')}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleViewItems(category.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 ml-2" />
                  مشاهده آیتم‌ها
                </Button>
                <Button
                  onClick={() => handleEditCategory(category.id)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleToggleActive(category.id)}
                  variant="outline"
                  size="sm"
                  className={
                    category.active
                      ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                      : 'text-green-600 border-green-200 hover:bg-green-50'
                  }
                >
                  {category.active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => handleDeleteCategory(category.id)}
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
      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {searchTerm
                  ? 'دسته‌بندی‌ای یافت نشد'
                  : 'هنوز دسته‌بندی‌ای ایجاد نکرده‌اید'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchTerm
                  ? 'لطفاً عبارت جستجوی خود را تغییر دهید'
                  : 'برای شروع، اولین دسته‌بندی منوی خود را ایجاد کنید'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateCategory}>
                  <Plus className="w-4 h-4 ml-2" />
                  ایجاد دسته‌بندی جدید
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
