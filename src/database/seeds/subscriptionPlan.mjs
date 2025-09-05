import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  const plans = [
    {
      name: 'Basic',
      nameFa: 'پایه',
      description: 'Perfect for small restaurants and cafes',
      descriptionFa: 'مناسب برای رستوران‌ها و کافه‌های کوچک',
      price: 500000, // 500,000 IRR
      currency: 'IRR',
      interval: 'MONTHLY',
      features: {
        analytics: false,
        customDomain: false,
        prioritySupport: false,
        advancedFeatures: false,
      },
      active: true,
      isDefault: true,
      maxStores: 1,
      maxBranches: 1,
      maxPublishedMenus: 1,
      maxItems: 50,
      maxImages: 100,
    },
    {
      name: 'Professional',
      nameFa: 'حرفه‌ای',
      description: 'Ideal for growing restaurant chains',
      descriptionFa: 'مناسب برای زنجیره رستوران‌های در حال رشد',
      price: 1200000, // 1,200,000 IRR
      currency: 'IRR',
      interval: 'MONTHLY',
      features: {
        analytics: true,
        customDomain: false,
        prioritySupport: false,
        advancedFeatures: false,
      },
      active: true,
      isDefault: false,
      maxStores: 3,
      maxBranches: 5,
      maxPublishedMenus: 3,
      maxItems: 200,
      maxImages: 500,
    },
    {
      name: 'Enterprise',
      nameFa: 'سازمانی',
      description: 'For large restaurant chains and franchises',
      descriptionFa: 'مناسب برای زنجیره رستوران‌های بزرگ و فرانچایزها',
      price: 2500000, // 2,500,000 IRR
      currency: 'IRR',
      interval: 'MONTHLY',
      features: {
        analytics: true,
        customDomain: true,
        prioritySupport: true,
        advancedFeatures: true,
      },
      active: true,
      isDefault: false,
      maxStores: 10,
      maxBranches: 20,
      maxPublishedMenus: 10,
      maxItems: 1000,
      maxImages: 2000,
    },
    {
      name: 'Basic Yearly',
      nameFa: 'پایه سالانه',
      description: 'Basic plan with yearly billing (2 months free)',
      descriptionFa: 'طرح پایه با پرداخت سالانه (۲ ماه رایگان)',
      price: 5000000, // 5,000,000 IRR (10 months price)
      currency: 'IRR',
      interval: 'YEARLY',
      features: {
        analytics: false,
        customDomain: false,
        prioritySupport: false,
        advancedFeatures: false,
      },
      active: true,
      isDefault: false,
      maxStores: 1,
      maxBranches: 1,
      maxPublishedMenus: 1,
      maxItems: 50,
      maxImages: 100,
    },
    {
      name: 'Professional Yearly',
      nameFa: 'حرفه‌ای سالانه',
      description: 'Professional plan with yearly billing (2 months free)',
      descriptionFa: 'طرح حرفه‌ای با پرداخت سالانه (۲ ماه رایگان)',
      price: 12000000, // 12,000,000 IRR (10 months price)
      currency: 'IRR',
      interval: 'YEARLY',
      features: {
        analytics: true,
        customDomain: false,
        prioritySupport: false,
        advancedFeatures: false,
      },
      active: true,
      isDefault: false,
      maxStores: 3,
      maxBranches: 5,
      maxPublishedMenus: 3,
      maxItems: 200,
      maxImages: 500,
    },
    {
      name: 'Enterprise Yearly',
      nameFa: 'سازمانی سالانه',
      description: 'Enterprise plan with yearly billing (2 months free)',
      descriptionFa: 'طرح سازمانی با پرداخت سالانه (۲ ماه رایگان)',
      price: 25000000, // 25,000,000 IRR (10 months price)
      currency: 'IRR',
      interval: 'YEARLY',
      features: {
        analytics: true,
        customDomain: true,
        prioritySupport: true,
        advancedFeatures: true,
      },
      active: true,
      isDefault: false,
      maxStores: 10,
      maxBranches: 20,
      maxPublishedMenus: 10,
      maxItems: 1000,
      maxImages: 2000,
    },
  ];

  for (const planData of plans) {
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        name: planData.name,
        interval: planData.interval,
        deletedAt: null,
      },
    });

    if (!existingPlan) {
      await prisma.subscriptionPlan.create({
        data: planData,
      });
      console.log(`✅ Created subscription plan: ${planData.name}`);
    } else {
      console.log(`⏭️  Subscription plan already exists: ${planData.name}`);
    }
  }

  console.log('✅ Subscription plans seeded successfully!');
}
