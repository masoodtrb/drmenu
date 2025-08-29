# Subscription System Design Document

## Overview

This document outlines the design and implementation plan for adding a subscription-based monetization system to drMenu. The system will allow restaurant owners to create stores and publish their menus after subscribing to a plan, with dynamic subscription plan management by super admins.

## Business Requirements

### Market Focus

- **Primary Market**: Iran (Iranian culture and business practices)
- **Multi-Currency Support**: IRR (Iranian Rial), USD, EUR, and other currencies
- **Multi-Language Support**: Persian (Farsi), English, Arabic, and other languages
- **Local Payment Methods**: Iranian payment gateways and local banking systems

### User Journey

1. **Signup**: User creates an account (free)
2. **Store Creation**: User creates a store (free)
3. **Branch Creation**: User creates at least one branch for the store (free)
4. **Menu Building**: User builds menu for the branch (free)
5. **Menu Publishing**: User must subscribe to publish the menu (paid)
6. **Public Access**: Published menus are visible to public users
7. **Plan Management**: Super admins can create/modify subscription plans

### Key Features

- **Free Tier**: Users can create stores, branches, and build menus without payment
- **Subscription Required**: Publishing menus requires an active subscription
- **Menu-Level Publishing**: Each branch's menu can be published independently
- **Dynamic Plans**: Super admins can create/modify subscription plans
- **Iranian Payment Integration**: Support for Iranian payment gateways
- **Multi-Currency Pricing**: Plans can be priced in different currencies
- **Multi-Language Support**: Interface and content in multiple languages
- **Subscription Management**: Users can upgrade/downgrade/cancel subscriptions
- **Usage Tracking**: Track subscription usage and limits per branch

## System Architecture

### Database Schema Design

#### New Models

**1. SubscriptionPlan**

```prisma
model SubscriptionPlan {
  id          String   @id @default(cuid())
  name        String   // e.g., "Basic", "Professional", "Enterprise"
  nameFa      String?  @map("name_fa") // Persian name
  description String   @db.Text
  descriptionFa String? @map("description_fa") @db.Text // Persian description
  price       Decimal  @db.Decimal(10, 2)
  currency    String   @default("IRR") // Default to Iranian Rial
  interval    SubscriptionInterval // MONTHLY, YEARLY
  features    Json     // Feature flags and limits
  active      Boolean  @default(true)
  isDefault   Boolean  @default(false) // Default plan for new users
  maxStores   Int      @default(1) // Maximum stores allowed
  maxBranches Int      @default(1) // Maximum branches per store
  maxPublishedMenus Int @default(1) @map("max_published_menus") // Maximum published menus
  maxItems    Int      @default(50) // Maximum menu items per branch
  maxImages   Int      @default(100) // Maximum images per branch
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  subscriptions Subscription[]

  @@map("subscription_plan")
}
```

**2. Subscription**

```prisma
model Subscription {
  id                String            @id @default(cuid())
  userId            String
  planId            String
  status            SubscriptionStatus // ACTIVE, CANCELLED, EXPIRED, PAST_DUE
  startDate         DateTime          @map("start_date")
  endDate           DateTime          @map("end_date")
  trialEndDate      DateTime?         @map("trial_end_date")
  cancelAtPeriodEnd Boolean           @default(false) @map("cancel_at_period_end")
  paymentProvider   String            // "stripe", "paypal", etc.
  paymentProviderId String?           @map("payment_provider_id") // External payment ID
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")
  cancelledAt       DateTime?         @map("cancelled_at")

  user              User              @relation(fields: [userId], references: [id])
  plan              SubscriptionPlan  @relation(fields: [planId], references: [id])
  payments          Payment[]

  @@map("subscription")
}
```

**3. Payment**

```prisma
model Payment {
  id                String        @id @default(cuid())
  subscriptionId    String
  amount            Decimal       @db.Decimal(10, 2)
  currency          String        @default("USD")
  status            PaymentStatus // PENDING, COMPLETED, FAILED, REFUNDED
  paymentProvider   String        @map("payment_provider")
  paymentProviderId String?       @map("payment_provider_id")
  paymentMethod     String?       @map("payment_method") // "card", "bank_transfer", etc.
  description       String?
  metadata          Json?         // Additional payment data
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  subscription      Subscription  @relation(fields: [subscriptionId], references: [id])

  @@map("payment")
}
```

**4. BranchMenuSubscription (Junction Table)**

```prisma
model BranchMenuSubscription {
  id             String      @id @default(cuid())
  storeBranchId  String      @map("store_branch_id")
  subscriptionId String
  isActive       Boolean     @default(true) @map("is_active")
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  storeBranch    StoreBranch @relation(fields: [storeBranchId], references: [id])
  subscription   Subscription @relation(fields: [subscriptionId], references: [id])

  @@unique([storeBranchId, subscriptionId])
  @@map("branch_menu_subscription")
}
```

#### Updated Models

**1. User Model Updates**

```prisma
model User {
  // ... existing fields ...
  subscriptions Subscription[]
  // ... existing relations ...
}
```

**2. StoreBranch Model Updates**

```prisma
model StoreBranch {
  // ... existing fields ...
  menuPublished     Boolean   @default(false) @map("menu_published") // New field
  menuPublishedAt   DateTime? @map("menu_published_at") // New field
  branchMenuSubscriptions BranchMenuSubscription[]
  // ... existing relations ...
}
```

#### New Enums

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

### API Design

#### Subscription Plan Management (Admin Only)

**1. Create Subscription Plan**

```
POST /api/trpc/subscription.createPlan
```

- **Access**: Admin only
- **Input**: Plan details (name, price, features, limits)
- **Validation**: Unique name, valid pricing, feature limits

**2. List Subscription Plans**

```
GET /api/trpc/subscription.listPlans
```

- **Access**: Public (for plan display)
- **Features**: Filtering by active status, pagination

**3. Update Subscription Plan**

```
PUT /api/trpc/subscription.updatePlan
```

- **Access**: Admin only
- **Input**: Plan ID and updated details
- **Validation**: Cannot modify active subscriptions' plans

**4. Delete Subscription Plan**

```
DELETE /api/trpc/subscription.deletePlan
```

- **Access**: Admin only
- **Validation**: Cannot delete if active subscriptions exist

#### Subscription Management (Store Admins)

**1. Subscribe to Plan**

```
POST /api/trpc/subscription.subscribe
```

- **Access**: Authenticated users
- **Input**: Plan ID, payment method
- **Process**: Create subscription, process payment, activate stores

**2. Get User Subscription**

```
GET /api/trpc/subscription.getUserSubscription
```

- **Access**: Authenticated users
- **Returns**: Current subscription status, plan details, usage

**3. Cancel Subscription**

```
POST /api/trpc/subscription.cancel
```

- **Access**: Authenticated users
- **Process**: Cancel at period end, deactivate stores

**4. Upgrade/Downgrade Subscription**

```
POST /api/trpc/subscription.changePlan
```

- **Access**: Authenticated users
- **Process**: Prorate billing, update limits

#### Menu Publishing

**1. Publish Branch Menu**

```
POST /api/trpc/storeBranch.publishMenu
```

- **Access**: Store owners
- **Validation**: Active subscription required, branch must exist
- **Process**: Check subscription limits, publish menu for specific branch

**2. Unpublish Branch Menu**

```
POST /api/trpc/storeBranch.unpublishMenu
```

- **Access**: Store owners
- **Process**: Hide menu from public view for specific branch

**3. Get Published Menus**

```
GET /api/trpc/storeBranch.getPublishedMenus
```

- **Access**: Public
- **Returns**: List of published menus with store and branch information

### Business Logic

#### Subscription Validation Rules

**1. Menu Publishing**

- User must have active subscription
- Published menu count within plan limits
- Branch must exist and belong to user's store
- Item count within plan limits per branch
- Image count within plan limits per branch

**2. Feature Access**

- Image uploads limited by plan per branch
- Advanced features (analytics, custom domains) by plan
- API access limits by plan
- Multi-language support by plan

**3. Payment Processing**

- Automatic renewal handling
- Failed payment retry logic
- Grace period for payment issues
- Proration for plan changes
- Iranian payment gateway integration

#### Usage Tracking

**1. Store & Branch Limits**

- Track number of stores per user
- Track number of branches per store
- Track number of published menus per subscription
- Prevent creation beyond plan limits
- Allow upgrades to increase limits

**2. Content Limits**

- Track menu items per branch
- Track images per branch
- Track published menus per subscription

**3. Feature Limits**

- Track API usage per subscription
- Track custom domain usage
- Track advanced feature usage
- Track multi-language content

### Payment Integration

#### Supported Providers (Iranian Market)

- **Iranian Payment Gateways**:
  - ZarinPal (زرین‌پال)
  - Mellat Bank (بانک ملت)
  - Parsian Bank (بانک پارسیان)
  - Saman Bank (بانک سامان)
  - Pasargad Bank (بانک پاسارگاد)
- **International Payment**:
  - Stripe (for international users)
  - PayPal (for international users)
- **Local Payment Methods**:
  - Bank transfers
  - Cash on delivery
  - Digital wallets

#### Payment Flow

1. **Subscription Creation**: User selects plan
2. **Payment Processing**: Process payment through Iranian gateway
3. **Subscription Activation**: Activate subscription on success
4. **Menu Publishing**: Enable menu publishing for specific branch
5. **Recurring Billing**: Handle automatic renewals

### Admin Dashboard Features

#### Subscription Plan Management

- Create/edit/delete subscription plans
- Set pricing and features
- Manage plan visibility
- View plan statistics

#### Subscription Monitoring

- View all active subscriptions
- Monitor payment status
- Handle failed payments
- Manage customer support

#### Analytics & Reporting

- Revenue tracking
- Subscription metrics
- User growth analysis
- Plan popularity analysis

### Iranian Market Specific Features

#### Localization

- **Persian (Farsi) Interface**: Primary language support
- **RTL Layout**: Right-to-left text direction support
- **Persian Calendar**: Jalali calendar integration
- **Local Currency**: IRR (Iranian Rial) as default
- **Local Timezone**: Iran Standard Time (IRST)

#### Cultural Considerations

- **Business Hours**: Support for Iranian business practices
- **Holiday Calendar**: Iranian national holidays
- **Local Business Types**: Restaurant, café, fast food, traditional food
- **Payment Preferences**: Cash, bank transfer, digital wallets

### Security Considerations

#### Payment Security

- PCI compliance for payment data
- Secure payment token handling
- Webhook signature verification
- Fraud detection measures
- Iranian banking security standards

#### Access Control

- Subscription-based feature access
- Plan limit enforcement
- Graceful degradation for expired subscriptions
- Secure admin access
- Local compliance requirements

### Implementation Phases

#### Phase 1: Core Subscription System

1. Database schema implementation
2. Basic subscription plan CRUD
3. User subscription management
4. Menu publishing validation
5. Multi-language support for plans

#### Phase 2: Payment Integration

1. Iranian payment gateway integration (ZarinPal, Mellat, etc.)
2. Payment processing
3. Subscription lifecycle management
4. Failed payment handling
5. Multi-currency support

#### Phase 3: Advanced Features

1. Usage tracking and limits
2. Plan upgrade/downgrade
3. Admin analytics dashboard
4. Advanced payment providers

#### Phase 4: Optimization

1. Performance optimization
2. Caching strategies
3. Advanced analytics
4. Customer support tools

### Technical Considerations

#### Performance

- Efficient subscription validation queries
- Caching for plan data
- Optimized usage tracking
- Background job processing

#### Scalability

- Horizontal scaling for payment processing
- Database optimization for subscription queries
- CDN for plan feature delivery
- Microservice architecture for payment handling

#### Monitoring

- Payment success/failure rates
- Subscription conversion metrics
- System performance monitoring
- Error tracking and alerting

### Migration Strategy

#### Data Migration

1. Create new subscription tables
2. Migrate existing stores to unpublished state
3. Create default subscription plans
4. Update existing APIs to check subscriptions

#### Feature Rollout

1. Deploy subscription system in staging
2. Test with sample data
3. Gradual rollout to production
4. Monitor and adjust based on feedback

### Success Metrics

#### Business Metrics

- Subscription conversion rate
- Monthly recurring revenue (MRR)
- Customer lifetime value (CLV)
- Churn rate

#### Technical Metrics

- Payment success rate
- API response times
- System uptime
- Error rates

This design provides a comprehensive foundation for implementing a subscription-based monetization system in drMenu while maintaining the existing functionality and ensuring a smooth user experience.
