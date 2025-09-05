# Query Builder System Documentation

## Overview

The Query Builder system provides a flexible, reusable way to handle list endpoints with search, filtering, and pagination for any entity in the application. It follows the existing coding patterns and provides a consistent API across all entities.

## Architecture

### Core Components

1. **QueryBuilder** - Base class for building database queries
2. **ListEndpointBuilder** - Higher-level builder for creating list endpoints
3. **Entity-specific builders** - Predefined builders for common entities
4. **QueryUtils** - Utility functions for common query patterns

## QueryBuilder Class

### Basic Usage

```typescript
import { QueryBuilder } from '@/trpc/server/helper/queryBuilder';

// Create a query builder with legacy string search
const queryBuilder = new QueryBuilder(db.store, {
  limit: 20,
  offset: 0,
  search: 'restaurant',
  searchFields: ['title'],
  filters: { active: true },
  include: {
    storeType: true,
    user: { select: { id: true, username: true } },
  },
});

// Execute the query
const result = await queryBuilder.execute();
```

### Advanced Search Usage

```typescript
import { QueryBuilder, SearchFilter } from '@/trpc/server/helper/queryBuilder';

// Create advanced search filters
const advancedFilters: SearchFilter[] = [
  { field: 'title', value: 'restaurant', operation: 'contains' },
  { field: 'active', value: true, operation: 'eq' },
  {
    field: 'createdAt',
    value: [new Date('2024-01-01'), new Date('2024-12-31')],
    operation: 'between',
  },
  { field: 'role', value: 'ADMIN', operation: 'eq', relation: 'user' },
];

// Create a query builder with advanced search
const queryBuilder = new QueryBuilder(db.store, {
  limit: 20,
  offset: 0,
  search: advancedFilters, // Array of search filters
  include: {
    storeType: true,
    user: { select: { id: true, username: true } },
  },
});

// Execute the query
const result = await queryBuilder.execute();
```

### Methods

#### `search(filters: SearchFilter[])`

Adds advanced search functionality with array of filter objects.

```typescript
const filters: SearchFilter[] = [
  { field: 'title', value: 'restaurant', operation: 'contains' },
  { field: 'active', value: true, operation: 'eq' },
  { field: 'createdAt', value: [startDate, endDate], operation: 'between' },
];
queryBuilder.search(filters);
```

#### `searchText(searchTerm: string, searchFields: string[])`

Adds legacy string search functionality across specified fields.

```typescript
queryBuilder.searchText('restaurant', ['title', 'description']);
```

#### `paginate(limit?: number, offset?: number)`

Sets pagination parameters.

```typescript
queryBuilder.paginate(20, 40); // 20 items, skip first 40
```

#### `filter(filters: Record<string, any>)`

Adds custom filters to the query.

```typescript
queryBuilder.filter({ active: true, storeTypeId: 'restaurant-type' });
```

#### `orderBy(orderBy: Record<string, "asc" | "desc">)`

Sets the ordering of results.

```typescript
queryBuilder.orderBy({ title: 'asc', createdAt: 'desc' });
```

#### `include(include: Record<string, any>)`

Specifies relations to include in the query.

```typescript
queryBuilder.include({
  storeType: true,
  user: { select: { id: true, username: true } },
});
```

#### `select(select: Record<string, any>)`

Specifies specific fields to select (alternative to include).

```typescript
queryBuilder.select({
  id: true,
  title: true,
  active: true,
});
```

### Response Format

```typescript
interface QueryBuilderResult<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}
```

## Entity-Specific Builders

### StoreQueryBuilder

```typescript
import { StoreQueryBuilder } from '@/trpc/server/helper/queryBuilder';

// Legacy string search
const queryBuilder = new StoreQueryBuilder()
  .paginate(10, 0)
  .searchStores('restaurant')
  .byActiveStatus(true)
  .byStoreType('restaurant-type-id')
  .byUser('user-id')
  .withRelations();

const result = await queryBuilder.execute();

// Advanced search with filters
const advancedFilters: SearchFilter[] = [
  { field: 'title', value: 'restaurant', operation: 'contains' },
  { field: 'active', value: true, operation: 'eq' },
  { field: 'createdAt', value: [startDate, endDate], operation: 'between' },
];

const advancedQueryBuilder = new StoreQueryBuilder()
  .paginate(10, 0)
  .searchStoresAdvanced(advancedFilters)
  .withRelations();

const advancedResult = await advancedQueryBuilder.execute();
```

### UserQueryBuilder

```typescript
import { UserQueryBuilder } from '@/trpc/server/helper/queryBuilder';

const queryBuilder = new UserQueryBuilder()
  .paginate(15, 0)
  .searchUsers('admin')
  .byRole('ADMIN')
  .byActiveStatus(true)
  .withProfile();

const result = await queryBuilder.execute();
```

### FileQueryBuilder

```typescript
import { FileQueryBuilder } from '@/trpc/server/helper/queryBuilder';

const queryBuilder = new FileQueryBuilder()
  .paginate(20, 0)
  .searchFiles('document')
  .byPublishedStatus(true)
  .byStorageType('local')
  .byOwner('user-id')
  .withOwner();

const result = await queryBuilder.execute();
```

## ListEndpointBuilder

### Creating List Endpoints

```typescript
import {
  createListEndpoint,
  ListEndpointConfig,
} from '@/trpc/server/helper/listEndpointBuilder';

const config: ListEndpointConfig<Store> = {
  model: db.store,
  searchFields: ['title'],
  defaultFilters: { deletedAt: null },
  defaultIncludes: {
    storeType: true,
    user: { select: { id: true, username: true } },
  },
  defaultOrderBy: { createdAt: 'desc' as const },
  customFilters: (input: any) => {
    const filters: Record<string, any> = {};
    if (input.active !== undefined) filters.active = input.active;
    if (input.storeTypeId) filters.storeTypeId = input.storeTypeId;
    return filters;
  },
  validateAccess: async (ctx: any) => {
    return ctx.user?.role === 'ADMIN';
  },
  transformData: (data: Store[]) => {
    return data.map(store => ({
      ...store,
      displayName: `${store.title} (${store.storeType?.title})`,
    }));
  },
};

const listEndpoint = createListEndpoint(config);
```

### Predefined Configurations

```typescript
import { ListEndpointConfigs } from '@/trpc/server/helper/listEndpointBuilder';

// Store configuration
const storeConfig = {
  ...ListEndpointConfigs.store,
  model: db.store,
};

// User configuration
const userConfig = {
  ...ListEndpointConfigs.user,
  model: db.user,
};

// File configuration
const fileConfig = {
  ...ListEndpointConfigs.file,
  model: db.file,
};
```

## QueryUtils

### Quick Query Functions

```typescript
import { QueryUtils } from '@/trpc/server/helper/queryBuilder';

// Basic list query
const basicResult = await QueryUtils.createListQuery(db.store, {
  limit: 10,
  include: { storeType: true },
});

// Search query
const searchResult = await QueryUtils.createSearchQuery(
  db.store,
  'restaurant',
  ['title'],
  { limit: 20 }
);

// Filtered query
const filteredResult = await QueryUtils.createFilteredQuery(
  db.store,
  { active: true, storeTypeId: 'restaurant-type' },
  { limit: 15 }
);
```

## Integration with tRPC Routers

### Example: Store Router

```typescript
import { StoreQueryBuilder } from '@/trpc/server/helper/queryBuilder';

export const storeRouter = createTRPCRouter({
  list: requireRoles([Role.ADMIN])
    .input(listStoresSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { limit, offset, search, active, storeTypeId } = input;

        const queryBuilder = new StoreQueryBuilder()
          .paginate(limit, offset)
          .withRelations();

        if (search) {
          queryBuilder.searchStores(search);
        }

        if (active !== undefined) {
          queryBuilder.byActiveStatus(active);
        }

        if (storeTypeId) {
          queryBuilder.byStoreType(storeTypeId);
        }

        const result = await queryBuilder.execute();

        return {
          stores: result.data,
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
        };
      } catch (err: unknown) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch stores',
        });
      }
    }),
});
```

### Example: Generic List Endpoint

```typescript
import { createListEndpoint } from '@/trpc/server/helper/listEndpointBuilder';

function createGenericListEndpoint<T>(
  db: any,
  modelName: string,
  searchFields: string[],
  defaultIncludes?: Record<string, any>
) {
  const config: ListEndpointConfig<T> = {
    model: db[modelName],
    searchFields,
    defaultFilters: { deletedAt: null },
    defaultIncludes,
    defaultOrderBy: { createdAt: 'desc' as const },
  };

  return createListEndpoint(config);
}

// Usage
const storeListEndpoint = createGenericListEndpoint(db, 'store', ['title'], {
  storeType: true,
  user: { select: { id: true, username: true } },
});
```

### Client-Side Usage with Advanced Search

```typescript
import { api } from "@/trpc/react";

// Basic search (legacy)
const { data } = api.store.list.useQuery({
  limit: 20,
  offset: 0,
  search: "restaurant",
  active: true,
});

// Advanced search with filters
const { data } = api.store.list.useQuery({
  limit: 20,
  offset: 0,
  advancedSearch: [
    { field: "title", value: "restaurant", operation: "contains" },
    { field: "active", value: true, operation: "eq" },
    {
      field: "createdAt",
      value: [new Date("2024-01-01"), new Date("2024-12-31")],
      operation: "between",
    },
    { field: "role", value: "ADMIN", operation: "eq", relation: "user" },
  ],
});

// Complex search with multiple conditions
const { data } = api.store.list.useQuery({
  limit: 20,
  offset: 0,
  advancedSearch: [
    { field: "title", value: "restaurant", operation: "contains" },
    { field: "storeTypeId", value: ["type1", "type2"], operation: "in" },
    { field: "createdAt", value: new Date("2024-01-01"), operation: "gte" },
    { field: "active", value: true, operation: "eq" },
  ],
});
```

## Advanced Search Operations

### Supported Operations

The advanced search system supports the following operations:

#### Comparison Operations

- `eq` - Equals
- `ne` - Not equals
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal

#### Array Operations

- `in` - In array
- `notIn` - Not in array

#### String Operations

- `contains` - Contains (case-insensitive by default)
- `notContains` - Does not contain
- `startsWith` - Starts with
- `endsWith` - Ends with
- `regex` - Regex pattern
- `search` - Full-text search

#### Null Operations

- `isNull` - Is null
- `isNotNull` - Is not null

#### Range Operations

- `between` - Between two values (requires array with exactly 2 values)

#### Relation Operations

- `has` - Has relation
- `hasNot` - Does not have relation
- `some` - Some relation matches
- `every` - Every relation matches
- `none` - No relation matches

### Advanced Search Examples

#### Basic Filters

```typescript
const filters: SearchFilter[] = [
  // Simple equality
  { field: 'title', value: 'restaurant', operation: 'eq' },

  // Contains search
  { field: 'title', value: 'restaurant', operation: 'contains' },

  // Date range
  { field: 'createdAt', value: [startDate, endDate], operation: 'between' },

  // Multiple values
  { field: 'storeTypeId', value: ['type1', 'type2'], operation: 'in' },

  // Null check
  { field: 'description', value: null, operation: 'isNull' },
];
```

#### Nested Relations

```typescript
const filters: SearchFilter[] = [
  // Search in related user's role
  { field: 'role', value: 'ADMIN', operation: 'eq', relation: 'user' },

  // Search in store type name
  {
    field: 'title',
    value: 'restaurant',
    operation: 'contains',
    relation: 'storeType',
  },

  // Search in user's profile
  {
    field: 'firstName',
    value: 'John',
    operation: 'contains',
    relation: 'user.Profile',
  },
];
```

#### Complex Conditions

```typescript
const filters: SearchFilter[] = [
  // Active stores created in 2024
  { field: 'active', value: true, operation: 'eq' },
  {
    field: 'createdAt',
    value: [new Date('2024-01-01'), new Date('2024-12-31')],
    operation: 'between',
  },

  // Stores with specific title pattern
  { field: 'title', value: 'restaurant', operation: 'contains' },

  // Stores owned by admin users
  { field: 'role', value: 'ADMIN', operation: 'eq', relation: 'user' },
];
```

#### Case-Sensitive Search

```typescript
const filters: SearchFilter[] = [
  { field: 'title', value: 'Restaurant', operation: 'eq', caseSensitive: true },
];
```

### Custom Filters

```typescript
const queryBuilder = new StoreQueryBuilder().filter({
  active: true,
  storeTypeId: { in: ['restaurant-type', 'cafe-type'] },
  createdAt: {
    gte: new Date('2024-01-01'),
    lte: new Date('2024-12-31'),
  },
  user: {
    role: 'STORE_ADMIN',
  },
});
```

### Complex Search

```typescript
const queryBuilder = new StoreQueryBuilder()
  .search('restaurant', ['title', 'description'])
  .filter({
    OR: [{ active: true }, { storeType: { title: { contains: 'food' } } }],
  });
```

### Data Transformation

```typescript
const config: ListEndpointConfig<Store> = {
  // ... other config
  transformData: (data: Store[]) => {
    return data.map(store => ({
      ...store,
      displayName: `${store.title} (${store.storeType?.title})`,
      isActive: store.active,
      branchCount: store._count?.StoreBranch || 0,
    }));
  },
};
```

### Access Validation

```typescript
const config: ListEndpointConfig<Store> = {
  // ... other config
  validateAccess: async (ctx: any) => {
    // Custom access validation logic
    if (ctx.user.role === 'ADMIN') return true;
    if (ctx.user.role === 'STORE_ADMIN') {
      // Only allow access to own stores
      return true; // Additional logic needed
    }
    return false;
  },
};
```

## Best Practices

### 1. Use Entity-Specific Builders

```typescript
// Good
const queryBuilder = new StoreQueryBuilder()
  .searchStores("restaurant")
  .byActiveStatus(true);

// Avoid
const queryBuilder = new QueryBuilder(db.store)
  .search("restaurant", ["title"])
  .filter({ active: true });
```

### 2. Leverage Predefined Configurations

```typescript
// Good
const config = {
  ...ListEndpointConfigs.store,
  model: db.store,
};

// Avoid
const config = {
  model: db.store,
  searchFields: ["title"],
  defaultFilters: { deletedAt: null },
  // ... manually defining everything
};
```

### 3. Use QueryUtils for Simple Queries

```typescript
// Good
const result = await QueryUtils.createListQuery(db.store, {
  limit: 10,
  include: { storeType: true },
});

// Avoid
const queryBuilder = new QueryBuilder(db.store, {
  limit: 10,
  include: { storeType: true },
});
const result = await queryBuilder.execute();
```

### 4. Implement Proper Error Handling

```typescript
try {
  const result = await queryBuilder.execute();
  return result;
} catch (err: unknown) {
  console.error(err);
  if (err instanceof TRPCError) {
    throw err;
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to fetch data",
  });
}
```

### 5. Use Type Safety

```typescript
// Good
const result = await queryBuilder.execute<Store>();

// Avoid
const result = await queryBuilder.execute();
```

## Performance Considerations

### 1. Limit Query Results

```typescript
// Always set reasonable limits
queryBuilder.paginate(20, 0); // Max 20 items
```

### 2. Selective Includes

```typescript
// Only include necessary relations
queryBuilder.include({
  storeType: { select: { id: true, title: true } },
  user: { select: { id: true, username: true } },
});
```

### 3. Use Indexes

Ensure database indexes exist on frequently searched fields:

```sql
CREATE INDEX idx_store_title ON store(title);
CREATE INDEX idx_store_active ON store(active);
CREATE INDEX idx_store_user_id ON store(user_id);
```

### 4. Cache Frequently Accessed Data

```typescript
// Consider caching for frequently accessed data
const cacheKey = `stores:${JSON.stringify(input)}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;

const result = await queryBuilder.execute();
await cache.set(cacheKey, result, 300); // 5 minutes
return result;
```

## Migration Guide

### From Manual Queries

**Before:**

```typescript
const stores = await ctx.db.store.findMany({
  where: {
    deletedAt: null,
    title: { contains: search, mode: 'insensitive' },
    active: true,
  },
  include: { storeType: true },
  orderBy: { createdAt: 'desc' },
  take: limit,
  skip: offset,
});
```

**After:**

```typescript
const queryBuilder = new StoreQueryBuilder()
  .paginate(limit, offset)
  .searchStores(search)
  .byActiveStatus(true)
  .withRelations();

const result = await queryBuilder.execute();
```

## Conclusion

The Query Builder system provides a powerful, flexible, and consistent way to handle list endpoints across all entities in the application. It follows existing patterns, provides type safety, and enables rapid development of new list endpoints while maintaining consistency and performance.
