'use client';

import { Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/trpc/client';

export default function AdminSubscriptionPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const {
    data: plansData,
    isLoading,
    refetch,
  } = trpc.subscription.listPlans.useQuery({
    limit: 100,
  });

  const { data: statsData } = trpc.subscription.getStats.useQuery();

  const createPlanMutation = trpc.subscription.createPlan.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreateForm(false);
    },
  });

  const updatePlanMutation = trpc.subscription.updatePlan.useMutation({
    onSuccess: () => {
      refetch();
      setEditingPlan(null);
    },
  });

  const deletePlanMutation = trpc.subscription.deletePlan.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const plans = plansData?.plans || [];

  const formatPrice = (price: any, currency: string) => {
    if (currency === 'IRR') {
      return new Intl.NumberFormat('fa-IR').format(Number(price)) + ' تومان';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Number(price));
  };

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createPlanMutation.mutate({
      name: formData.get('name') as string,
      nameFa: formData.get('nameFa') as string,
      description: formData.get('description') as string,
      descriptionFa: formData.get('descriptionFa') as string,
      price: Number(formData.get('price')),
      currency: formData.get('currency') as string,
      interval: formData.get('interval') as 'MONTHLY' | 'YEARLY',
      features: {
        analytics: formData.get('analytics') === 'on',
        customDomain: formData.get('customDomain') === 'on',
        prioritySupport: formData.get('prioritySupport') === 'on',
        advancedFeatures: formData.get('advancedFeatures') === 'on',
      },
      active: formData.get('active') === 'on',
      isDefault: formData.get('isDefault') === 'on',
      maxStores: Number(formData.get('maxStores')),
      maxBranches: Number(formData.get('maxBranches')),
      maxPublishedMenus: Number(formData.get('maxPublishedMenus')),
      maxItems: Number(formData.get('maxItems')),
      maxImages: Number(formData.get('maxImages')),
    });
  };

  const handleUpdatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    updatePlanMutation.mutate({
      id: editingPlan.id,
      name: formData.get('name') as string,
      nameFa: formData.get('nameFa') as string,
      description: formData.get('description') as string,
      descriptionFa: formData.get('descriptionFa') as string,
      price: Number(formData.get('price')),
      currency: formData.get('currency') as string,
      interval: formData.get('interval') as 'MONTHLY' | 'YEARLY',
      features: {
        analytics: formData.get('analytics') === 'on',
        customDomain: formData.get('customDomain') === 'on',
        prioritySupport: formData.get('prioritySupport') === 'on',
        advancedFeatures: formData.get('advancedFeatures') === 'on',
      },
      active: formData.get('active') === 'on',
      isDefault: formData.get('isDefault') === 'on',
      maxStores: Number(formData.get('maxStores')),
      maxBranches: Number(formData.get('maxBranches')),
      maxPublishedMenus: Number(formData.get('maxPublishedMenus')),
      maxItems: Number(formData.get('maxItems')),
      maxImages: Number(formData.get('maxImages')),
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            مدیریت طرح‌های اشتراک
          </h1>
          <p className="text-gray-600 mt-2">ایجاد و مدیریت طرح‌های اشتراک</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          ایجاد طرح جدید
        </Button>
      </div>

      {/* Statistics */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                کل طرح‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.plans.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                طرح‌های فعال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.plans.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                اشتراک‌های فعال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsData.subscriptions.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                درآمد ماهانه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('fa-IR').format(
                  statsData.revenue.monthly
                )}{' '}
                تومان
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingPlan) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingPlan ? 'ویرایش طرح' : 'ایجاد طرح جدید'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام (انگلیسی)
                  </label>
                  <Input
                    name="name"
                    defaultValue={editingPlan?.name}
                    required
                    placeholder="Basic Plan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام (فارسی)
                  </label>
                  <Input
                    name="nameFa"
                    defaultValue={editingPlan?.nameFa}
                    placeholder="طرح پایه"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات (انگلیسی)
                  </label>
                  <Textarea
                    name="description"
                    defaultValue={editingPlan?.description}
                    required
                    placeholder="Perfect for small restaurants"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات (فارسی)
                  </label>
                  <Textarea
                    name="descriptionFa"
                    defaultValue={editingPlan?.descriptionFa}
                    placeholder="مناسب برای رستوران‌های کوچک"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قیمت
                  </label>
                  <Input
                    name="price"
                    type="number"
                    defaultValue={editingPlan?.price}
                    required
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    واحد پول
                  </label>
                  <select
                    name="currency"
                    defaultValue={editingPlan?.currency || 'IRR'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="IRR">تومان (IRR)</option>
                    <option value="USD">دلار (USD)</option>
                    <option value="EUR">یورو (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    دوره
                  </label>
                  <select
                    name="interval"
                    defaultValue={editingPlan?.interval || 'MONTHLY'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="MONTHLY">ماهانه</option>
                    <option value="YEARLY">سالانه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حداکثر فروشگاه
                  </label>
                  <Input
                    name="maxStores"
                    type="number"
                    defaultValue={editingPlan?.maxStores || 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حداکثر شعبه
                  </label>
                  <Input
                    name="maxBranches"
                    type="number"
                    defaultValue={editingPlan?.maxBranches || 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حداکثر منوی منتشر شده
                  </label>
                  <Input
                    name="maxPublishedMenus"
                    type="number"
                    defaultValue={editingPlan?.maxPublishedMenus || 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حداکثر آیتم منو
                  </label>
                  <Input
                    name="maxItems"
                    type="number"
                    defaultValue={editingPlan?.maxItems || 50}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حداکثر تصویر
                  </label>
                  <Input
                    name="maxImages"
                    type="number"
                    defaultValue={editingPlan?.maxImages || 100}
                    required
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ویژگی‌ها
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="analytics"
                      defaultChecked={editingPlan?.features?.analytics}
                      className="mr-2"
                    />
                    تحلیل و آمار
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="customDomain"
                      defaultChecked={editingPlan?.features?.customDomain}
                      className="mr-2"
                    />
                    دامنه سفارشی
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="prioritySupport"
                      defaultChecked={editingPlan?.features?.prioritySupport}
                      className="mr-2"
                    />
                    پشتیبانی اولویت‌دار
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="advancedFeatures"
                      defaultChecked={editingPlan?.features?.advancedFeatures}
                      className="mr-2"
                    />
                    ویژگی‌های پیشرفته
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editingPlan?.active !== false}
                    className="mr-2"
                  />
                  فعال
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    defaultChecked={editingPlan?.isDefault}
                    className="mr-2"
                  />
                  طرح پیش‌فرض
                </label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPlan ? 'بروزرسانی' : 'ایجاد'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPlan(null);
                  }}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans List */}
      <div className="grid gap-6">
        {plans.map((plan: any) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.nameFa && (
                      <span className="text-sm text-gray-500">
                        ({plan.nameFa})
                      </span>
                    )}
                    {plan.isDefault && (
                      <Badge className="bg-blue-500">پیش‌فرض</Badge>
                    )}
                    {!plan.active && <Badge variant="secondary">غیرفعال</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {plan.description}
                    {plan.descriptionFa && (
                      <div className="text-sm text-gray-500 mt-1">
                        {plan.descriptionFa}
                      </div>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePlanMutation.mutate({ id: plan.id })}
                    disabled={plan.isDefault}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="font-medium">قیمت:</span>
                  <div>{formatPrice(plan.price, plan.currency)}</div>
                  <div className="text-gray-500">
                    {plan.interval === 'MONTHLY' ? 'ماهانه' : 'سالانه'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">فروشگاه:</span>
                  <div>{plan.maxStores}</div>
                </div>
                <div>
                  <span className="font-medium">شعبه:</span>
                  <div>{plan.maxBranches}</div>
                </div>
                <div>
                  <span className="font-medium">منوی منتشر شده:</span>
                  <div>{plan.maxPublishedMenus}</div>
                </div>
                <div>
                  <span className="font-medium">آیتم منو:</span>
                  <div>{plan.maxItems}</div>
                </div>
                <div>
                  <span className="font-medium">تصویر:</span>
                  <div>{plan.maxImages}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
