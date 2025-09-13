'use client';

import { Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UploadedImage {
  id: string;
  file: File | null; // Can be null for existing images
  preview: string;
  isPrimary?: boolean;
  uploadedFileId?: string; // ID from the database after upload
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = [];

    Array.from(files).forEach(file => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        alert(
          `نوع فایل ${file.name} پشتیبانی نمی‌شود. لطفاً از فرمت‌های JPEG، PNG یا WebP استفاده کنید.`
        );
        return;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`حجم فایل ${file.name} بیش از ${maxSize} مگابایت است.`);
        return;
      }

      // Check max images limit
      if (images.length + newImages.length >= maxImages) {
        alert(`حداکثر ${maxImages} تصویر می‌توانید آپلود کنید.`);
        return;
      }

      const imageId = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);

      newImages.push({
        id: imageId,
        file,
        preview,
        isPrimary: images.length === 0 && newImages.length === 0, // First image is primary
      });
    });

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);

    // If we removed the primary image, make the first remaining image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }

    onImagesChange(updatedImages);
  };

  const setPrimaryImage = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    onImagesChange(updatedImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-green-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-gray-600 dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              آپلود تصاویر
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              تصاویر را اینجا بکشید یا کلیک کنید تا انتخاب کنید
            </p>
            <p className="text-xs text-slate-500 mb-4">
              حداکثر {maxImages} تصویر، هر کدام تا {maxSize} مگابایت
            </p>
            <Button
              onClick={openFileDialog}
              disabled={images.length >= maxImages}
              variant="outline"
              type="button"
            >
              <Upload className="w-4 h-4 ml-2" />
              انتخاب فایل
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-2">
                <div className="relative">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-1 left-1">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        اصلی
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-1 right-1">
                    <div className="flex gap-1">
                      {!image.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0"
                          onClick={() => setPrimaryImage(image.id)}
                          title="تنظیم به عنوان تصویر اصلی"
                        >
                          <ImageIcon className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                        onClick={() => removeImage(image.id)}
                        title="حذف تصویر"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {image.file?.name || 'Existing Image'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {image.file?.size
                      ? `${(image.file.size / 1024 / 1024).toFixed(1)} MB`
                      : 'Existing file'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>• فرمت‌های پشتیبانی شده: JPEG، PNG، WebP</p>
        <p>• حداکثر حجم هر فایل: {maxSize} مگابایت</p>
        <p>• حداکثر تعداد تصاویر: {maxImages}</p>
        <p>• اولین تصویر به عنوان تصویر اصلی در نظر گرفته می‌شود</p>
      </div>
    </div>
  );
}
