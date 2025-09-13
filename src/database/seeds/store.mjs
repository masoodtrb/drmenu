import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

// Store type data
const storeTypes = [
  { title: 'رستوران' },
  { title: 'کافه' },
  { title: 'فروشگاه خرده‌فروشی' },
  { title: 'سوپرمارکت' },
  { title: 'داروخانه' },
  { title: 'فروشگاه لوازم الکترونیکی' },
  { title: 'فروشگاه پوشاک' },
  { title: 'کتابفروشی' },
  { title: 'فروشگاه ابزار' },
  { title: 'آرایشگاه' },
  { title: 'باشگاه ورزشی' },
  { title: 'نانوایی' },
  { title: 'فروشگاه جواهرات' },
  { title: 'فروشگاه اسباب‌بازی' },
  { title: 'فروشگاه حیوانات خانگی' },
];

// Store name templates for different types
const storeNameTemplates = {
  رستوران: [
    'رستوران طلایی',
    'باغ ادویه',
    'نمای اقیانوس',
    'آشپزخانه سنتی',
    'بیسترو شهری',
    'طعم خانه',
    'لذت ترکیبی',
    'آشپزی ساحلی',
    'نمای کوهستان',
    'چراغ‌های شهر',
  ],
  کافه: [
    'نوشیدنی صبح',
    'گوشه قهوه',
    'رویاهای شیرین',
    'کافه شهری',
    'قهوه هنری',
    'آسیاب روزانه',
    'جامعه کافه',
    'دانه‌ای آنجا',
    'بار اسپرسو',
    'درمان کافئین',
  ],
  'فروشگاه خرده‌فروشی': [
    'بوتیک شیک',
    'گوشه استایل',
    'مد پیشرو',
    'استایل شهری',
    'مجموعه شیک',
    'خرده‌فروشی مدرن',
    'مرکز استایل',
    'منطقه مد',
    'تنظیم‌کننده ترند',
    'گالری استایل',
  ],
  سوپرمارکت: [
    'بازار تازه',
    'خواربار روزانه',
    'غذاهای خانواده',
    'بازار محله',
    'تازه و آسان',
    'بازار همسایگی',
    'غذاهای باکیفیت',
    'انتخاب تازه',
    'محل بازار',
    'مارت غذا',
  ],
  داروخانه: [
    'سلامت اول',
    'داروخانه تندرستی',
    'داروخانه مراقبت',
    'سلامت پلاس',
    'مراقبت پزشکی',
    'گوشه تندرستی',
    'مارت سلامت',
    'مراقبت پلاس',
    'تندرستی اول',
    'گوشه سلامت',
  ],
  'فروشگاه لوازم الکترونیکی': [
    'مرکز فناوری',
    'دنیای دیجیتال',
    'الکترونیک پلاس',
    'مارت فناوری',
    'فروشگاه دیجیتال',
    'گوشه فناوری',
    'مرکز الکترونیک',
    'دیجیتال پلاس',
    'دنیای فناوری',
    'مارت الکترونیک',
  ],
  'فروشگاه پوشاک': [
    'مد پیشرو',
    'استودیو استایل',
    'نخ‌های شیک',
    'مرکز مد',
    'گوشه استایل',
    'مد شهری',
    'تنظیم‌کننده ترند',
    'گالری مد',
    'دنیای استایل',
    'مد پلاس',
  ],
  کتابفروشی: [
    'گوشه دانش',
    'پناهگاه کتاب',
    'مرکز ادبی',
    'اتاق مطالعه',
    'دنیای کتاب',
    'مرکز دانش',
    'گوشه ادبی',
    'پناهگاه مطالعه',
    'گوشه کتاب',
    'دنیای دانش',
  ],
  'فروشگاه ابزار': [
    'جعبه ابزار',
    'مرکز سخت‌افزار',
    'مرکز DIY',
    'مارت ابزار',
    'سخت‌افزار پلاس',
    'گوشه ابزار',
    'مرکز DIY',
    'دنیای سخت‌افزار',
    'ابزار پلاس',
    'مارت DIY',
  ],
  آرایشگاه: [
    'پناهگاه زیبایی',
    'استودیو جذابیت',
    'گوشه زیبایی',
    'سالن استایل',
    'مرکز جذابیت',
    'استودیو زیبایی',
    'گوشه استایل',
    'جذابیت پلاس',
    'دنیای زیبایی',
    'مرکز استایل',
  ],
  'باشگاه ورزشی': [
    'زندگی سالم',
    'باشگاه قدرت',
    'مرکز تناسب',
    'مرکز قدرت',
    'دنیای سالم',
    'مرکز قدرت',
    'گوشه تناسب',
    'قدرت پلاس',
    'گوشه سالم',
    'دنیای قدرت',
  ],
  نانوایی: [
    'رویاهای شیرین',
    'نانوایی هنری',
    'نان‌های تازه',
    'گوشه نان',
    'گوشه شیرین',
    'گوشه هنری',
    'نان‌های تازه',
    'دنیای نان',
    'دنیای شیرین',
    'هنری پلاس',
  ],
  'فروشگاه جواهرات': [
    'درخشش و براق',
    'گوشه جواهرات',
    'دنیای الماس',
    'مرکز درخشش',
    'جواهرات پلاس',
    'گوشه الماس',
    'دنیای درخشش',
    'دنیای جواهرات',
    'الماس پلاس',
    'گوشه درخشش',
  ],
  'فروشگاه اسباب‌بازی': [
    'دنیای سرگرمی',
    'گوشه اسباب‌بازی',
    'پناهگاه بازی',
    'گوشه سرگرمی',
    'دنیای اسباب‌بازی',
    'گوشه بازی',
    'مرکز سرگرمی',
    'پناهگاه اسباب‌بازی',
    'دنیای بازی',
    'سرگرمی پلاس',
  ],
  'فروشگاه حیوانات خانگی': [
    'بهشت حیوانات',
    'گوشه حیوانات',
    'دنیای حیوانات',
    'پناهگاه حیوانات',
    'گوشه حیوانات',
    'دنیای حیوانات',
    'پناهگاه حیوانات',
    'حیوانات پلاس',
    'دنیای حیوانات',
    'گوشه حیوانات',
  ],
};

export const storeSeed = async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Starting store seeding...');

    // First, create store types
    const createdStoreTypes = [];
    for (const storeType of storeTypes) {
      // Check if store type already exists
      let existingStoreType = await prisma.storeType.findFirst({
        where: { title: storeType.title },
      });

      if (!existingStoreType) {
        existingStoreType = await prisma.storeType.create({
          data: storeType,
        });
        console.log(`Created store type: ${existingStoreType.title}`);
      } else {
        console.log(`Store type already exists: ${existingStoreType.title}`);
      }

      createdStoreTypes.push(existingStoreType);
    }

    // Get all users to assign stores to
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, username: true },
    });

    if (users.length === 0) {
      console.log('No users found. Please run user seeder first.');
      await prisma.$disconnect();
      return;
    }

    console.log(`Found ${users.length} users to assign stores to`);

    // Create 100 fake stores
    const storesToCreate = [];
    for (let i = 0; i < 100; i++) {
      const randomStoreType =
        createdStoreTypes[Math.floor(Math.random() * createdStoreTypes.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const templates =
        storeNameTemplates[randomStoreType.title] ||
        storeNameTemplates['Retail Store'];
      const randomTemplate =
        templates[Math.floor(Math.random() * templates.length)];
      const storeNumber = Math.floor(Math.random() * 999) + 1;

      storesToCreate.push({
        title: `${randomTemplate} ${storeNumber}`,
        active: Math.random() > 0.3, // 70% chance of being active
        userId: randomUser.id,
        storeTypeId: randomStoreType.id,
      });
    }

    // Create stores in batches
    const batchSize = 10;
    for (let i = 0; i < storesToCreate.length; i += batchSize) {
      const batch = storesToCreate.slice(i, i + batchSize);
      await prisma.store.createMany({
        data: batch,
        skipDuplicates: true,
      });
      console.log(
        `Created batch ${Math.floor(i / batchSize) + 1} of stores (${batch.length} stores)`
      );
    }

    // Get final count
    const totalStores = await prisma.store.count({
      where: { deletedAt: null },
    });

    console.log(`✅ Store seeding completed! Created ${totalStores} stores`);
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error during store seeding:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
};
