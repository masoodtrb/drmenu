'use client';

import {
  ChevronRight,
  Eye,
  FolderOpen,
  Plus,
  Store,
  Utensils,
} from 'lucide-react';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenuApi } from '@/hooks/useMenuApi';
import { useMenuStore } from '@/lib/store/menuStore';

export default function MenuManagementPage() {
  const router = useRouter();
  const {
    selectedStoreId,
    selectedBranchId,
    stores,
    setSelectedStore,
    setSelectedBranch,
    setStores,
    getSelectedStore,
  } = useMenuStore();

  const { getMyStores } = useMenuApi();

  // Get stores from API
  const { data: storesData, isLoading: loading } = getMyStores();

  // Load stores on component mount
  useEffect(() => {
    if (storesData?.stores) {
      setStores(storesData.stores as any);

      // Auto-select the first store and its first branch if none selected
      if (!selectedStoreId && storesData.stores.length > 0) {
        const firstStore = storesData.stores[0];
        setSelectedStore(firstStore.id);
        if (firstStore.StoreBranch && firstStore.StoreBranch.length > 0) {
          setSelectedBranch(firstStore.StoreBranch[0].id);
        }
      }
    }
  }, [
    storesData,
    setStores,
    selectedStoreId,
    setSelectedStore,
    setSelectedBranch,
  ]);

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
    // Auto-select the first branch of the store
    const store = stores.find(s => s.id === storeId);
    if (store && store.StoreBranch && store.StoreBranch.length > 0) {
      setSelectedBranch(store.StoreBranch[0].id);
    }
  };

  const handleManageCategories = () => {
    if (selectedBranchId) {
      router.push(`/store/menu/categories?branch=${selectedBranchId}`);
    }
  };

  const handleManageItems = () => {
    if (selectedBranchId) {
      router.push(`/store/menu/items?branch=${selectedBranchId}`);
    }
  };

  const handleCreateCategory = () => {
    if (selectedBranchId) {
      router.push(`/store/menu/categories/create?branch=${selectedBranchId}`);
    }
  };

  const handleCreateItem = () => {
    if (selectedBranchId) {
      router.push(`/store/menu/items/create?branch=${selectedBranchId}`);
    }
  };

  const handlePreviewMenu = () => {
    if (selectedBranchId) {
      router.push(`/store/menu/preview?branch=${selectedBranchId}`);
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
            منوها
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            مدیریت منوهای فروشگاه‌های شما
          </p>
        </div>
        <Button
          onClick={() => router.push('/store/dashboard')}
          variant="outline"
          size="sm"
        >
          بازگشت به داشبورد
        </Button>
      </div>

      {/* Store Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              فروشگاه‌های شما
            </CardTitle>
            <Button
              onClick={() => router.push('/store/menu/create-store')}
              size="sm"
            >
              <Plus className="w-4 h-4 ml-2" />
              فروشگاه جدید
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map(store => (
              <div
                key={store.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedStoreId === store.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-green-300'
                }`}
                onClick={() => handleStoreSelect(store.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {store.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {store.storeType.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={store.active ? 'default' : 'secondary'}
                      className={
                        store.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : ''
                      }
                    >
                      {store.active ? 'فعال' : 'غیرفعال'}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {store.StoreBranch?.length || 0}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">شعبه</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {store.StoreBranch?.reduce(
                        (acc, branch) => acc + (branch.Category?.length || 0),
                        0
                      ) || 0}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      دسته‌بندی
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {store.StoreBranch?.reduce(
                        (acc, branch) =>
                          acc +
                          (branch.Category?.reduce(
                            (itemAcc, category) =>
                              itemAcc + (category.Item?.length || 0),
                            0
                          ) || 0),
                        0
                      ) || 0}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">آیتم</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Menu Management Actions */}
      {selectedStoreId && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              مدیریت منو - {getSelectedStore()?.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categories Management */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                  دسته‌بندی‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  ایجاد، ویرایش و مدیریت دسته‌بندی‌های منو
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleManageCategories}
                    className="flex-1"
                    variant="outline"
                  >
                    <FolderOpen className="w-4 h-4 ml-2" />
                    مشاهده
                  </Button>
                  <Button
                    onClick={handleCreateCategory}
                    size="sm"
                    className="px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items Management */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-green-600" />
                  آیتم‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  اضافه کردن، ویرایش و مدیریت آیتم‌های منو
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleManageItems}
                    className="flex-1"
                    variant="outline"
                  >
                    <Utensils className="w-4 h-4 ml-2" />
                    مشاهده
                  </Button>
                  <Button onClick={handleCreateItem} size="sm" className="px-3">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Menu Preview */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  پیش‌نمایش
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  مشاهده منو به صورت مشتری
                </p>
                <Button
                  onClick={handlePreviewMenu}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 ml-2" />
                  پیش‌نمایش منو
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stores.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Store className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                هنوز فروشگاهی ایجاد نکرده‌اید
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                برای شروع، ابتدا یک فروشگاه ایجاد کنید
              </p>
              <Button onClick={() => router.push('/store/dashboard')}>
                بازگشت به داشبورد
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
