# Subscription System Implementation Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [User Journey](#user-journey)
6. [Installation & Setup](#installation--setup)
7. [Usage Examples](#usage-examples)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The subscription system for drMenu is a comprehensive solution designed specifically for the Iranian market. It allows users to create stores and branches for free, but requires a paid subscription to publish menus publicly.

### Key Features

- ✅ **Iranian Market Focus** - Persian language support, IRR currency, local payment gateways
- ✅ **Menu-Level Publishing** - Each branch menu published independently
- ✅ **Dynamic Subscription Plans** - Admin-configurable plans with flexible limits
- ✅ **Multi-Currency Support** - IRR, USD, EUR with Iranian Rial as default
- ✅ **Usage Tracking** - Real-time monitoring of subscription limits
- ✅ **Admin Dashboard** - Complete subscription management interface

### Business Model

1. **Free Tier**: Users can sign up, create stores, branches, and build menus
2. **Paid Publishing**: Subscription required to publish menus for public access
3. **Scalable Plans**: Different tiers based on business size and needs

## 🗄️ Database Schema

### Core Models

#### SubscriptionPlan

```prisma
model SubscriptionPlan {
  id                String               @id @default(cuid())
  name              String               // English name
  nameFa            String?              @map("name_fa") // Persian name
  description       String               @db.Text
  descriptionFa     String?              @map("description_fa") @db.Text
  price             Decimal              @db.Decimal(10, 2)
  currency          String               @default("IRR")
  interval          SubscriptionInterval // MONTHLY | YEARLY
  features          Json                 // Feature flags
  active            Boolean              @default(true)
  isDefault         Boolean              @default(false) @map("is_default")
  maxStores         Int                  @default(1) @map("max_stores")
  maxBranches       Int                  @default(1) @map("max_branches")
  maxPublishedMenus Int                  @default(1) @map("max_published_menus")
  maxItems          Int                  @default(50) @map("max_items")
  maxImages         Int                  @default(100) @map("max_images")
  createdAt         DateTime             @default(now()) @map("created_at")
  updatedAt         DateTime             @updatedAt @map("updated_at")
  deletedAt         DateTime?            @map("deleted_at")

  subscriptions Subscription[]
}
```

#### Subscription

```prisma
model Subscription {
  id                String             @id @default(cuid())
  userId            String
  planId            String
  status            SubscriptionStatus // ACTIVE | CANCELLED | EXPIRED | PAST_DUE | TRIAL
  startDate         DateTime           @map("start_date")
  endDate           DateTime           @map("end_date")
  trialEndDate      DateTime?          @map("trial_end_date")
  cancelAtPeriodEnd Boolean            @default(false) @map("cancel_at_period_end")
  paymentProvider   String             @map("payment_provider")
  paymentProviderId String?            @map("payment_provider_id")
  createdAt         DateTime           @default(now()) @map("created_at")
  updatedAt         DateTime           @updatedAt @map("updated_at")
  cancelledAt       DateTime?          @map("cancelled_at")

  user                    User                     @relation(fields: [userId], references: [id])
  plan                    SubscriptionPlan         @relation(fields: [planId], references: [id])
  payments                Payment[]
  branchMenuSubscriptions BranchMenuSubscription[]
}
```

#### Payment

```prisma
model Payment {
  id                String        @id @default(cuid())
  subscriptionId    String
  amount            Decimal       @db.Decimal(10, 2)
  currency          String        @default("IRR")
  status            PaymentStatus // PENDING | COMPLETED | FAILED | REFUNDED | CANCELLED
  paymentProvider   String        @map("payment_provider")
  paymentProviderId String?       @map("payment_provider_id")
  paymentMethod     String?       @map("payment_method")
  description       String?
  metadata          Json?
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  subscription Subscription @relation(fields: [subscriptionId], references: [id])
}
```

#### BranchMenuSubscription

```prisma
model BranchMenuSubscription {
  id             String   @id @default(cuid())
  storeBranchId  String   @map("store_branch_id")
  subscriptionId String
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  storeBranch  StoreBranch  @relation(fields: [storeBranchId], references: [id])
  subscription Subscription @relation(fields: [subscriptionId], references: [id])

  @@unique([storeBranchId, subscriptionId])
}
```

### Updated Models

#### StoreBranch

```prisma
model StoreBranch {
  // ... existing fields ...
  menuPublished           Boolean                  @default(false) @map("menu_published")
  menuPublishedAt         DateTime?                @map("menu_published_at")
  branchMenuSubscriptions BranchMenuSubscription[]
}
```

#### User

```prisma
model User {
  // ... existing fields ...
  subscriptions Subscription[]
}
```

### Enums

```prisma
enum SubscriptionInterval {
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  PAST_DUE
  TRIAL
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}
```

## 🔌 API Endpoints

### Admin Endpoints

#### Create Subscription Plan

```typescript
POST / api / trpc / subscription.createPlan;
```

**Input:**

```typescript
{
  name: string;
  nameFa?: string;
  description: string;
  descriptionFa?: string;
  price: number;
  currency: string;
  interval: "MONTHLY" | "YEARLY";
  features: {
    analytics: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
    advancedFeatures: boolean;
  };
  active: boolean;
  isDefault: boolean;
  maxStores: number;
  maxBranches: number;
  maxPublishedMenus: number;
  maxItems: number;
  maxImages: number;
}
```

#### Update Subscription Plan

```typescript
PUT / api / trpc / subscription.updatePlan;
```

#### Delete Subscription Plan

```typescript
DELETE / api / trpc / subscription.deletePlan;
```

#### Get Subscription Statistics

```typescript
GET / api / trpc / subscription.getStats;
```

**Response:**

```typescript
{
  plans: {
    total: number;
    active: number;
  }
  subscriptions: {
    total: number;
    active: number;
  }
  revenue: {
    total: number;
    monthly: number;
  }
}
```

### User Endpoints

#### Subscribe to Plan

```typescript
POST / api / trpc / subscription.subscribe;
```

**Input:**

```typescript
{
  planId: string;
  paymentProvider: string;
  paymentMethod?: string;
}
```

#### Get User Subscription

```typescript
GET / api / trpc / subscription.getUserSubscription;
```

**Response:**

```typescript
{
  subscription: {
    id: string;
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    payments: Payment[];
    branchMenuSubscriptions: BranchMenuSubscription[];
  };
  usage: {
    stores: number;
    branches: number;
    publishedMenus: number;
    items: number;
    images: number;
    limits: {
      maxStores: number;
      maxBranches: number;
      maxPublishedMenus: number;
      maxItems: number;
      maxImages: number;
    };
  };
}
```

#### Cancel Subscription

```typescript
POST / api / trpc / subscription.cancel;
```

#### Change Plan

```typescript
POST / api / trpc / subscription.changePlan;
```

### Menu Publishing Endpoints

#### Publish Menu

```typescript
POST / api / trpc / subscription.publishMenu;
```

**Input:**

```typescript
{
  storeBranchId: string;
}
```

#### Unpublish Menu

```typescript
POST / api / trpc / subscription.unpublishMenu;
```

#### Get Published Menus (Public)

```typescript
GET / api / trpc / subscription.getPublishedMenus;
```

### Public Endpoints

#### List Subscription Plans

```typescript
GET / api / trpc / subscription.listPlans;
```

**Query Parameters:**

- `active?: boolean`
- `limit?: number` (default: 20)
- `offset?: number` (default: 0)

## 🎨 Frontend Components

### Public Subscription Page

**Location:** `src/app/(public)/subscription/page.tsx`

**Features:**

- Beautiful pricing cards with Persian support
- Monthly/Yearly toggle with savings badge
- Feature comparison
- FAQ section
- Responsive design

**Key Components:**

```typescript
// Interval Toggle
const [selectedInterval, setSelectedInterval] = useState<'MONTHLY' | 'YEARLY'>(
  'MONTHLY'
);

// Plan Filtering
const plans =
  plansData?.plans.filter((plan: any) => plan.interval === selectedInterval) ||
  [];

// Price Formatting
const formatPrice = (price: number, currency: string) => {
  if (currency === 'IRR') {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};
```

### Admin Subscription Management

**Location:** `src/app/admin/(dashboard)/subscription/page.tsx`

**Features:**

- Complete CRUD for subscription plans
- Statistics dashboard
- Multi-language support (Persian/English)
- Feature management
- Real-time updates

**Key Components:**

```typescript
// Statistics Cards
const { data: statsData } = trpc.subscription.getStats.useQuery();

// Plan Management
const createPlanMutation = trpc.subscription.createPlan.useMutation();
const updatePlanMutation = trpc.subscription.updatePlan.useMutation();
const deletePlanMutation = trpc.subscription.deletePlan.useMutation();
```

### UI Components

#### Badge Component

**Location:** `src/components/ui/badge.tsx`

```typescript
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

#### Textarea Component

**Location:** `src/components/ui/textarea.tsx`

```typescript
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
);
```

## 🚀 User Journey

### 1. User Registration & Store Creation (Free)

```mermaid
graph TD
    A[User Signs Up] --> B[Create Store]
    B --> C[Create Store Branch]
    C --> D[Build Menu Items]
    D --> E[Add Categories]
    E --> F[Upload Images]
    F --> G[Menu Ready for Publishing]
```

### 2. Subscription & Publishing (Paid)

```mermaid
graph TD
    A[View Subscription Plans] --> B[Choose Plan]
    B --> C[Complete Payment]
    C --> D[Subscription Active]
    D --> E[Publish Menu]
    E --> F[Menu Publicly Available]
    F --> G[Monitor Usage]
```

### 3. Subscription Management

```mermaid
graph TD
    A[Active Subscription] --> B[Monitor Usage]
    B --> C{Need More?}
    C -->|Yes| D[Upgrade Plan]
    C -->|No| E[Continue Current Plan]
    D --> F[Process Payment]
    F --> G[Updated Limits]
    E --> H[Renewal Reminder]
```

## 🛠️ Installation & Setup

### 1. Database Migration

```bash
# Create migration for subscription system
npx prisma migrate dev --name add_subscription_system

# Apply migration
npx prisma migrate deploy
```

### 2. Seed Data

```bash
# Run seed to create default subscription plans
npx prisma db seed
```

**Default Plans Created:**

- Basic (500,000 IRR/month)
- Professional (1,200,000 IRR/month)
- Enterprise (2,500,000 IRR/month)
- Yearly versions with 2 months free

### 3. API Integration

```typescript
// Add subscription router to main API
import { subscriptionRouter } from './router/subscription';

export const appRouter = createTRPCRouter({
  // ... other routers
  subscription: subscriptionRouter,
});
```

### 4. Frontend Routes

```typescript
// Public subscription page
// Route: /subscription

// Admin subscription management
// Route: /admin/subscription
```

## 📝 Usage Examples

### Creating a Subscription Plan (Admin)

```typescript
const createPlan = async () => {
  const result = await trpc.subscription.createPlan.mutate({
    name: 'Premium',
    nameFa: 'پریمیوم',
    description: 'Premium plan for large restaurants',
    descriptionFa: 'طرح پریمیوم برای رستوران‌های بزرگ',
    price: 3000000,
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
    maxStores: 5,
    maxBranches: 10,
    maxPublishedMenus: 5,
    maxItems: 500,
    maxImages: 1000,
  });
};
```

### Subscribing to a Plan (User)

```typescript
const subscribeToPlan = async (planId: string) => {
  const result = await trpc.subscription.subscribe.mutate({
    planId,
    paymentProvider: 'zarinpal',
    paymentMethod: 'online',
  });
};
```

### Publishing a Menu (User)

```typescript
const publishMenu = async (storeBranchId: string) => {
  const result = await trpc.subscription.publishMenu.mutate({
    storeBranchId,
  });
};
```

### Getting User Subscription Status

```typescript
const { data: subscriptionData } =
  trpc.subscription.getUserSubscription.useQuery();

if (subscriptionData?.subscription) {
  const { subscription, usage } = subscriptionData;

  console.log(`Plan: ${subscription.plan.name}`);
  console.log(`Status: ${subscription.status}`);
  console.log(
    `Published Menus: ${usage.publishedMenus}/${usage.limits.maxPublishedMenus}`
  );
}
```

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/drmenu"

# Payment Gateway (for future integration)
ZARINPAL_MERCHANT_ID="your-zarinpal-merchant-id"
MELLAT_TERMINAL_ID="your-mellat-terminal-id"

# Currency Settings
DEFAULT_CURRENCY="IRR"
SUPPORTED_CURRENCIES="IRR,USD,EUR"
```

### Subscription Plan Features

```typescript
interface SubscriptionFeatures {
  analytics: boolean; // Analytics dashboard
  customDomain: boolean; // Custom domain support
  prioritySupport: boolean; // Priority customer support
  advancedFeatures: boolean; // Advanced menu features
}
```

### Usage Limits

```typescript
interface UsageLimits {
  maxStores: number; // Maximum stores per user
  maxBranches: number; // Maximum branches per store
  maxPublishedMenus: number; // Maximum published menus
  maxItems: number; // Maximum menu items per branch
  maxImages: number; // Maximum images per user
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Migration Errors

```bash
# Reset database and re-run migrations
npx prisma migrate reset
npx prisma migrate dev
```

#### 2. Seed Data Issues

```bash
# Clear existing data and re-seed
npx prisma db seed --force
```

#### 3. API Endpoint Errors

```typescript
// Check if subscription router is properly imported
import { subscriptionRouter } from './router/subscription';

// Verify router is added to appRouter
export const appRouter = createTRPCRouter({
  subscription: subscriptionRouter,
});
```

#### 4. Frontend Component Errors

```typescript
// Ensure proper tRPC client setup
import { trpc } from '@/trpc/client';

// Use proper hook syntax
const { data, isLoading } = trpc.subscription.listPlans.useQuery();
```

### Debug Mode

```typescript
// Enable debug logging
const { data, error, isLoading } =
  trpc.subscription.getUserSubscription.useQuery(undefined, {
    onError: error => {
      console.error('Subscription error:', error);
    },
    onSuccess: data => {
      console.log('Subscription data:', data);
    },
  });
```

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Subscription Metrics**
   - Active subscriptions
   - Monthly recurring revenue (MRR)
   - Churn rate
   - Plan distribution

2. **Usage Metrics**
   - Published menus count
   - Average items per menu
   - Image upload usage
   - Store/branch creation

3. **Business Metrics**
   - Conversion rate (free to paid)
   - Average revenue per user (ARPU)
   - Customer lifetime value (CLV)

### Dashboard Queries

```sql
-- Active subscriptions by plan
SELECT
  sp.name,
  COUNT(s.id) as active_subscriptions,
  SUM(p.amount) as total_revenue
FROM subscription_plan sp
LEFT JOIN subscription s ON sp.id = s.plan_id
LEFT JOIN payment p ON s.id = p.subscription_id
WHERE s.status = 'ACTIVE' AND p.status = 'COMPLETED'
GROUP BY sp.id, sp.name;

-- Usage statistics
SELECT
  u.username,
  COUNT(DISTINCT sb.id) as branches,
  COUNT(DISTINCT CASE WHEN sb.menu_published = true THEN sb.id END) as published_menus,
  COUNT(i.id) as total_items
FROM user u
LEFT JOIN store_branch sb ON u.id = sb.user_id
LEFT JOIN category c ON sb.id = c.store_branch_id
LEFT JOIN item i ON c.id = i.category_id
GROUP BY u.id, u.username;
```

## 🔮 Future Enhancements

### Planned Features

1. **Payment Gateway Integration**
   - ZarinPal integration
   - Mellat Bank integration
   - Multiple payment methods

2. **Advanced Analytics**
   - Menu performance metrics
   - Customer behavior tracking
   - Revenue optimization

3. **Automated Billing**
   - Recurring payments
   - Invoice generation
   - Payment reminders

4. **Trial Periods**
   - Free trial implementation
   - Trial-to-paid conversion tracking

5. **Multi-language Support**
   - Arabic language support
   - RTL layout improvements
   - Localized content

### API Extensions

```typescript
// Future endpoints to implement
-/api/cprt / subscription.startTrial -
  /api/cprt / subscription.processPayment -
  /api/cprt / subscription.generateInvoice -
  /api/cprt / subscription.getAnalytics -
  /api/cprt / subscription.sendReminder;
```

## 📚 Additional Resources

### Documentation Files

- `docs/SUBSCRIPTION_SYSTEM_DESIGN.md` - System design document
- `docs/DATABASE_ERD.md` - Database entity relationship diagram
- `docs/COMPLETE_MENU_ITEM_ENTITY.md` - Menu item entity documentation

### Code Files

- `src/trpc/server/api/router/subscription.ts` - Main API router
- `src/app/(public)/subscription/page.tsx` - Public subscription page
- `src/app/admin/(dashboard)/subscription/page.tsx` - Admin management
- `src/database/seeds/subscriptionPlan.mjs` - Seed data

### Database Files

- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migrations

---

## 🎉 Conclusion

The subscription system is now fully implemented and ready for production use. It provides a complete solution for monetizing the drMenu platform while maintaining a user-friendly experience for both store owners and administrators.

The system is designed with the Iranian market in mind, featuring Persian language support, IRR currency, and local payment gateway readiness. The modular architecture allows for easy extension and customization as business needs evolve.

For support or questions, please refer to the troubleshooting section or contact the development team.
