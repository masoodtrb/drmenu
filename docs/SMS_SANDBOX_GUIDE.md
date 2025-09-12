# SMS Sandbox Mode - راهنمای سریع

## فعال‌سازی حالت Sandbox

برای استفاده از حالت Sandbox در محیط توسعه، متغیرهای زیر را در فایل `.env` تنظیم کنید:

```env
# SMS.ir configuration SANDBOX
SMS_API_KEY=CNp3YcZgR6pme9r8pGmLxdgdUCIZlM0x0W58UNcMK4ppWU0J
SMS_LINE_NUMBER=10008663
SMS_SANDBOX_MODE=true
```

## مزایای حالت Sandbox

✅ **بدون هزینه** - هیچ پیامک واقعی ارسال نمی‌شود  
✅ **تست کامل** - تمام قابلیت‌ها قابل تست هستند  
✅ **لاگ مفصل** - محتوای پیامک‌ها در کنسول نمایش داده می‌شود  
✅ **ایمن** - هیچ پیامک واقعی به شماره‌های تست ارسال نمی‌شود

## نحوه کارکرد

### در حالت Sandbox:

- پیامک‌ها در کنسول لاگ می‌شوند
- هیچ پیامک واقعی ارسال نمی‌شود
- تمام عملیات OTP شبیه‌سازی می‌شود

### در حالت Production:

- پیامک‌های واقعی ارسال می‌شوند
- هزینه پیامک محاسبه می‌شود
- از API key و شماره خط واقعی استفاده می‌شود

## مثال خروجی Sandbox

```
🔧 SANDBOX MODE - SMS would be sent:
📱 To: 09123456789
📝 OTP: 123456
📋 Type: SIGNUP
✅ SMS simulation completed (no actual SMS sent)
```

## تست سیستم

### 1. تست API

```bash
curl http://localhost:3000/api/test-sms
```

### 2. تست در مرورگر

- به صفحه ثبت نام بروید
- شماره موبایل وارد کنید
- کد OTP را در کنسول مشاهده کنید

### 3. تست کامل جریان

1. ثبت نام با شماره موبایل
2. مشاهده لاگ OTP در کنسول
3. وارد کردن کد OTP
4. تکمیل فرآیند

## تغییر به حالت Production

برای استفاده در محیط تولید:

```env
# SMS.ir configuration PRODUCTION
SMS_API_KEY=your_real_api_key_here
SMS_LINE_NUMBER=your_real_line_number_here
SMS_SANDBOX_MODE=false
```

## نکات مهم

⚠️ **هشدار**: در حالت Production، پیامک‌های واقعی ارسال می‌شوند و هزینه دارند  
🔧 **توسعه**: همیشه در محیط توسعه از حالت Sandbox استفاده کنید  
📱 **تست**: شماره‌های موبایل تست در حالت Sandbox کار می‌کنند  
🚀 **استقرار**: قبل از استقرار، حتماً حالت Production را تست کنید

## عیب‌یابی

### مشکل: لاگ Sandbox نمایش داده نمی‌شود

**راه حل**: مطمئن شوید `SMS_SANDBOX_MODE=true` تنظیم شده است

### مشکل: پیامک واقعی ارسال می‌شود

**راه حل**: `SMS_SANDBOX_MODE` را روی `true` تنظیم کنید

### مشکل: خطای API Key

**راه حل**: از API Key و Line Number صحیح استفاده کنید
