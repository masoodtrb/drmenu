'use client';

// import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { trpc } from '@/trpc/client';

export default function SubscriptionPage() {
  const [selectedInterval, setSelectedInterval] = useState<
    'MONTHLY' | 'YEARLY'
  >('MONTHLY');

  const { data: plansData, isLoading } = trpc.subscription.listPlans.useQuery({
    active: true,
    limit: 100,
  });

  const plans =
    plansData?.plans.filter(
      (plan: any) => plan.interval === selectedInterval
    ) || [];

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'IRR') {
      return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Enterprise'))
      return <Crown className="h-6 w-6 text-yellow-500" />;
    if (planName.includes('Professional'))
      return <Star className="h-6 w-6 text-blue-500" />;
    return <Zap className="h-6 w-6 text-green-500" />;
  };

  const getPlanFeatures = (plan: any) => {
    const features = [
      `${plan.maxStores} فروشگاه`,
      `${plan.maxBranches} شعبه`,
      `${plan.maxPublishedMenus} منوی منتشر شده`,
      `${plan.maxItems} آیتم منو`,
      `${plan.maxImages} تصویر`,
    ];

    if (plan.features.analytics) features.push('تحلیل و آمار');
    if (plan.features.customDomain) features.push('دامنه سفارشی');
    if (plan.features.prioritySupport) features.push('پشتیبانی اولویت‌دار');
    if (plan.features.advancedFeatures) features.push('ویژگی‌های پیشرفته');

    return features;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">در حال بارگذاری طرح‌های اشتراک...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            طرح‌های اشتراک
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            طرح مناسب کسب و کار خود را انتخاب کنید
          </p>

          {/* Interval Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setSelectedInterval('MONTHLY')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedInterval === 'MONTHLY'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ماهانه
              </button>
              <button
                onClick={() => setSelectedInterval('YEARLY')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedInterval === 'YEARLY'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                سالانه
                {selectedInterval === 'YEARLY' && (
                  <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    ۲ ماه رایگان
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan: any) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.isDefault
                  ? 'ring-2 ring-blue-500 scale-105'
                  : 'hover:scale-105'
              }`}
            >
              {plan.isDefault && (
                <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-medium">
                  پیشنهاد ویژه
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {plan.nameFa || plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.descriptionFa || plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price, plan.currency)}
                  </div>
                  <div className="text-gray-500">
                    {selectedInterval === 'MONTHLY' ? 'در ماه' : 'در سال'}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {getPlanFeatures(plan).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Subscribe Button */}
                <Button
                  className={`w-full py-3 text-lg font-semibold ${
                    plan.isDefault
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                  onClick={() => {
                    // TODO: Implement subscription flow
                    console.log('Subscribe to plan:', plan.id);
                  }}
                >
                  {plan.isDefault ? 'شروع کنید' : 'انتخاب کنید'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">سوالات متداول</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-3">
                آیا می‌توانم طرح خود را تغییر دهم؟
              </h3>
              <p className="text-gray-600">
                بله، شما می‌توانید در هر زمان طرح خود را ارتقا یا تنزل دهید.
                تغییرات بلافاصله اعمال می‌شود.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-3">
                آیا امکان لغو اشتراک وجود دارد؟
              </h3>
              <p className="text-gray-600">
                بله، شما می‌توانید در هر زمان اشتراک خود را لغو کنید. تا پایان
                دوره پرداخت شده، خدمات ادامه خواهد داشت.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-3">
                آیا پشتیبانی فنی ارائه می‌شود؟
              </h3>
              <p className="text-gray-600">
                بله، تمام طرح‌ها شامل پشتیبانی فنی هستند. طرح‌های حرفه‌ای و
                سازمانی شامل پشتیبانی اولویت‌دار می‌باشند.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-3">
                آیا امکان تست رایگان وجود دارد؟
              </h3>
              <p className="text-gray-600">
                بله، شما می‌توانید ۷ روز به صورت رایگان از تمام ویژگی‌ها استفاده
                کنید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
