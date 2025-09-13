'use client';

import { MapPin, Navigation } from 'lucide-react';

interface GeolocationMapFallbackProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

export function GeolocationMapFallback({
  latitude,
  longitude,
  onLocationChange,
  height = '300px',
}: GeolocationMapFallbackProps) {
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          onLocationChange(latitude, longitude);
        },
        error => {
          console.error('Error getting location:', error);
          alert(
            'خطا در دریافت موقعیت فعلی. لطفاً دسترسی به موقعیت مکانی را فعال کنید.'
          );
        }
      );
    } else {
      alert('مرورگر شما از موقعیت جغرافیایی پشتیبانی نمی‌کند.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          انتخاب موقعیت جغرافیایی
        </h3>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          <Navigation className="w-3 h-3" />
          موقعیت فعلی
        </button>
      </div>

      <div
        className="border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            نقشه تعاملی در دسترس نیست
          </p>
          <p className="text-sm text-slate-500">
            برای نصب react-leaflet، دستور زیر را اجرا کنید:
          </p>
          <code className="block mt-2 p-2 bg-slate-200 dark:bg-slate-700 rounded text-xs">
            pnpm add react-leaflet leaflet @types/leaflet
          </code>
          <p className="text-xs text-slate-500 mt-4">
            یا از دکمه "موقعیت فعلی" برای دریافت مختصات استفاده کنید
          </p>
        </div>
      </div>

      {latitude && longitude && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            موقعیت انتخاب شده:
          </p>
          <p className="text-xs text-green-600 dark:text-green-300">
            عرض: {latitude.toFixed(6)}, طول: {longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
