'use client';

import {
  ArrowRight,
  Clock,
  Download,
  Eye,
  Globe,
  MapPin,
  Phone,
  Printer,
  Share2,
  Star,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenuStore } from '@/lib/store/menuStore';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  icon: string;
  images: string[];
  categoryTitle: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: MenuItem[];
}

interface StoreInfo {
  title: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  workingHours: string;
}

export default function MenuPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store');

  const { getSelectedStore } = useMenuStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedStore = getSelectedStore();

  // Mock data - در آینده از API دریافت خواهد شد
  const mockStoreInfo: StoreInfo = {
    title: 'رستوران سنتی',
    type: 'رستوران',
    description: 'رستوران سنتی با غذاهای اصیل ایرانی',
    address: 'تهران، خیابان ولیعصر، پلاک 123',
    phone: '021-12345678',
    website: 'www.restaurant.com',
    workingHours: '12:00 - 23:00',
  };

  const mockCategories: Category[] = [
    {
      id: '1',
      title: 'پیش‌غذا',
      description: 'انواع پیش‌غذاهای سنتی و مدرن',
      icon: '🥗',
      items: [
        {
          id: '1',
          title: 'سالاد سزار',
          description: 'سالاد سزار با سس مخصوص و پنیر پارمزان',
          price: 180000,
          currency: 'IRR',
          icon: '🥗',
          images: ['/api/placeholder/300/200'],
          categoryTitle: 'پیش‌غذا',
        },
        {
          id: '2',
          title: 'ماست و خیار',
          description: 'ماست و خیار سنتی با نعنا و سیر',
          price: 85000,
          currency: 'IRR',
          icon: '🥒',
          images: ['/api/placeholder/300/200'],
          categoryTitle: 'پیش‌غذا',
        },
      ],
    },
    {
      id: '2',
      title: 'غذای اصلی',
      description: 'غذاهای اصلی رستوران',
      icon: '🍽️',
      items: [
        {
          id: '3',
          title: 'کباب کوبیده',
          description: 'کباب کوبیده سنتی با برنج و سبزیجات',
          price: 450000,
          currency: 'IRR',
          icon: '🍖',
          images: ['/api/placeholder/300/200'],
          categoryTitle: 'غذای اصلی',
        },
        {
          id: '4',
          title: 'قیمه نثار',
          description: 'قیمه نثار با لپه و سیب زمینی',
          price: 320000,
          currency: 'IRR',
          icon: '🍲',
          images: ['/api/placeholder/300/200'],
          categoryTitle: 'غذای اصلی',
        },
      ],
    },
    {
      id: '3',
      title: 'دسر',
      description: 'انواع دسرهای خوشمزه',
      icon: '🍰',
      items: [
        {
          id: '5',
          title: 'چیزکیک توت فرنگی',
          description: 'چیزکیک خامه‌ای با توت فرنگی تازه',
          price: 120000,
          currency: 'IRR',
          icon: '🍰',
          images: ['/api/placeholder/300/200'],
          categoryTitle: 'دسر',
        },
      ],
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStoreInfo(mockStoreInfo);
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'IRR') {
      return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${storeInfo?.title} - منو`,
        text: `منوی ${storeInfo?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('لینک منو کپی شد!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              در حال بارگذاری منو...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:max-w-none print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            پیش‌نمایش منو
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {storeInfo?.title} - مشاهده منو به صورت مشتری‌پسند
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
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="w-4 h-4 ml-2" />
            اشتراک‌گذاری
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 ml-2" />
            چاپ
          </Button>
        </div>
      </div>

      {/* Store Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {storeInfo?.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            {storeInfo?.description}
          </p>
          <Badge variant="outline" className="bg-white dark:bg-slate-800">
            {storeInfo?.type}
          </Badge>
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            اطلاعات تماس
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  آدرس
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {storeInfo?.address}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  تلفن
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {storeInfo?.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  ساعات کاری
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {storeInfo?.workingHours}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  وب‌سایت
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {storeInfo?.website}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Categories */}
      {categories.map(category => (
        <Card key={category.id} className="overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-800">
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {category.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                  {category.description}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {category.items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">{item.icon}</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-left flex-shrink-0">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatPrice(item.price, item.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Footer */}
      <Card className="bg-slate-50 dark:bg-slate-800">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            با تشکر از انتخاب شما 🌟
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            {new Date().toLocaleDateString('fa-IR')}
          </p>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:space-y-4 > * + * {
            margin-top: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
