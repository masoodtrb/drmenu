'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { GeolocationMapFallback } from './GeolocationMapFallback';

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
        در حال بارگذاری نقشه...
      </div>
    ),
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false,
});

const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false,
});

// Component to handle map clicks
const MapClickHandler = dynamic(
  () =>
    import('react-leaflet').then(mod => {
      const { useMapEvents } = mod;
      return function MapClickHandler({
        onMapClick,
      }: {
        onMapClick: (e: any) => void;
      }) {
        useMapEvents({
          click: onMapClick,
        });
        return null;
      };
    }),
  { ssr: false }
);

// Custom pin icon
const createCustomIcon = () => {
  if (typeof window === 'undefined') return null;

  return import('leaflet').then(L => {
    return L.icon({
      iconUrl: '/pin.svg',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      shadowUrl: undefined,
      shadowSize: undefined,
      shadowAnchor: undefined,
    });
  });
};

interface GeolocationMapProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

export function GeolocationMap({
  latitude,
  longitude,
  onLocationChange,
  height = '300px',
}: GeolocationMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    35.6892, 51.389,
  ]); // Tehran default
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null
  );
  const [hasLeaflet, setHasLeaflet] = useState<boolean | null>(null);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    // Check if react-leaflet is available
    import('react-leaflet')
      .then(() => setHasLeaflet(true))
      .catch(() => setHasLeaflet(false));
  }, []);

  useEffect(() => {
    // Create custom icon when component mounts
    if (hasLeaflet) {
      createCustomIcon()?.then(icon => {
        if (icon) setCustomIcon(icon);
      });
    }
  }, [hasLeaflet]);

  useEffect(() => {
    if (latitude && longitude) {
      const position: [number, number] = [latitude, longitude];
      setMapCenter(position);
      setMarkerPosition(position);
    }
  }, [latitude, longitude]);

  const handleMapClick = (e: any) => {
    console.log('Map clicked:', e); // Debug log
    const { lat, lng } = e.latlng;
    const position: [number, number] = [lat, lng];
    console.log('Setting position:', position); // Debug log
    setMarkerPosition(position);
    onLocationChange(lat, lng);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const pos: [number, number] = [latitude, longitude];
          setMapCenter(pos);
          setMarkerPosition(pos);
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

  // Show fallback if react-leaflet is not available
  if (hasLeaflet === false) {
    return (
      <GeolocationMapFallback
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
        height={height}
      />
    );
  }

  // Show loading while checking for react-leaflet
  if (hasLeaflet === null) {
    return (
      <div
        className="border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600 dark:text-slate-400">
            در حال بارگذاری...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          انتخاب موقعیت روی نقشه
        </h3>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          موقعیت فعلی
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  console.log('Marker clicked at:', markerPosition);
                },
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>موقعیت انتخاب شده</strong>
                  <br />
                  عرض: {markerPosition[0].toFixed(6)}
                  <br />
                  طول: {markerPosition[1].toFixed(6)}
                  <br />
                  <small className="text-gray-500">
                    برای تغییر موقعیت، روی نقشه کلیک کنید
                  </small>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500">
        روی نقشه کلیک کنید تا موقعیت را انتخاب کنید یا از دکمه "موقعیت فعلی"
        استفاده کنید
      </p>
    </div>
  );
}
