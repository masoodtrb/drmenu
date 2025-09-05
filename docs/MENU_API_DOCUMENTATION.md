# Menu API Documentation

This document describes the menu API endpoints for the drmenu restaurant management system.

## Overview

The menu API provides endpoints for managing categories and items in a restaurant's menu system. It includes both private endpoints (for restaurant owners/admins) and public endpoints (for customers viewing the menu).

## Database Schema Updates

### Item Model

- Added `price` field (Decimal with 10,2 precision) for item pricing
- Added `currency` field (defaults to "USD") for price currency
- Added many-to-many relationship with File model for image galleries

### ItemImage Model (New)

- Junction table for Item and File relationship
- Includes `order` field for image ordering
- Includes `isPrimary` field to mark primary image
- Cascade delete when item or file is deleted

## API Endpoints

### Private Endpoints (Require Authentication)

#### Category Management

**Create Category**

```
POST /api/trpc/menu.createCategory
```

- **Input**: `createCategorySchema`
- **Access**: Private (authenticated users)
- **Description**: Creates a new category in a store branch
- **Validation**:
  - Title must be unique within the branch
  - User must have access to the store branch

**Get Category by ID**

```
GET /api/trpc/menu.getCategoryById
```

- **Input**: `getCategoryByIdSchema`
- **Access**: Private (authenticated users)
- **Description**: Retrieves a specific category with its items and images
- **Includes**: Branch, store, and item details with images

**List Categories**

```
GET /api/trpc/menu.listCategories
```

- **Input**: `listCategoriesSchema`
- **Access**: Private (authenticated users)
- **Description**: Lists categories for a store branch with pagination
- **Features**: Search, filtering by active status, pagination

**Update Category**

```
PUT /api/trpc/menu.updateCategory
```

- **Input**: `updateCategorySchema`
- **Access**: Private (authenticated users)
- **Description**: Updates an existing category
- **Validation**: Title uniqueness check within branch

**Delete Category**

```
DELETE /api/trpc/menu.deleteCategory
```

- **Input**: `deleteCategorySchema`
- **Access**: Private (authenticated users)
- **Description**: Soft deletes a category
- **Validation**: Cannot delete if category has items

#### Item Management

**Create Item**

```
POST /api/trpc/menu.createItem
```

- **Input**: `createItemSchema`
- **Access**: Private (authenticated users)
- **Description**: Creates a new menu item with optional images
- **Features**:
  - Price and currency support
  - Image gallery support
  - Title uniqueness within category

**Get Item by ID**

```
GET /api/trpc/menu.getItemById
```

- **Input**: `getItemByIdSchema`
- **Access**: Private (authenticated users)
- **Description**: Retrieves a specific item with all details
- **Includes**: Category, branch, store, and image gallery

**List Items**

```
GET /api/trpc/menu.listItems
```

- **Input**: `listItemsSchema`
- **Access**: Private (authenticated users)
- **Description**: Lists items with advanced filtering
- **Features**:
  - Filter by category or store branch
  - Search by title/description
  - Price range filtering
  - Active status filtering
  - Pagination

**Update Item**

```
PUT /api/trpc/menu.updateItem
```

- **Input**: `updateItemSchema`
- **Access**: Private (authenticated users)
- **Description**: Updates an existing item
- **Features**:
  - Full image gallery management
  - Price and currency updates
  - Category reassignment

**Delete Item**

```
DELETE /api/trpc/menu.deleteItem
```

- **Input**: `deleteItemSchema`
- **Access**: Private (authenticated users)
- **Description**: Soft deletes an item

### Public Endpoints (No Authentication Required)

#### Customer Menu Access

**Get Public Menu**

```
GET /api/trpc/menu.getPublicMenu
```

- **Input**: `getPublicMenuSchema`
- **Access**: Public (no authentication required)
- **Description**: Retrieves the complete menu for customers
- **Features**:
  - Only shows active store branches and categories
  - Includes all active items with images
  - Option to include inactive items
- **Response**: Store branch info + categories with items

**Get Public Item**

```
GET /api/trpc/menu.getPublicItem
```

- **Input**: `getPublicItemSchema`
- **Access**: Public (no authentication required)
- **Description**: Retrieves a specific item for customers
- **Features**: Only shows active items from active categories/branches

## Validation Schemas

### Category Schemas

```typescript
createCategorySchema = {
  title: string (1-100 chars, required)
  icon: string (1-50 chars, required)
  description: string (1-500 chars, required)
  active: boolean (optional)
  storeBranchId: string (required)
}

updateCategorySchema = {
  id: string (required)
  title: string (1-100 chars, optional)
  icon: string (1-50 chars, optional)
  description: string (1-500 chars, optional)
  active: boolean (optional)
}
```

### Item Schemas

```typescript
createItemSchema = {
  title: string (1-100 chars, required)
  icon: string (1-50 chars, required)
  description: string (1-500 chars, required)
  price: number (positive, required)
  currency: string (1-10 chars, defaults to "USD")
  active: boolean (optional)
  categoryId: string (required)
  imageIds: string[] (optional)
}

updateItemSchema = {
  id: string (required)
  title: string (1-100 chars, optional)
  icon: string (1-50 chars, optional)
  description: string (1-500 chars, optional)
  price: number (positive, optional)
  currency: string (1-10 chars, optional)
  active: boolean (optional)
  categoryId: string (optional)
  imageIds: string[] (optional)
}
```

## Image Gallery Features

### ItemImage Relationship

- **Many-to-Many**: Items can have multiple images, files can be used by multiple items
- **Ordering**: Images are ordered by the `order` field
- **Primary Image**: First image (order 0) is marked as primary
- **Cascade Delete**: When item or file is deleted, ItemImage records are automatically removed

### Image Management

- **Upload**: Images must be uploaded via the file API first
- **Association**: Use `imageIds` array to associate files with items
- **Reordering**: Update `imageIds` array to change image order
- **Primary Image**: First image in the array becomes the primary image

## Security Features

### Access Control

- **Private Endpoints**: Require authentication and user ownership verification
- **Public Endpoints**: No authentication required, but only show active content
- **Soft Deletes**: All deletions are soft deletes (preserves data)

### Data Validation

- **Input Validation**: All inputs validated with Zod schemas
- **Business Logic**: Prevents duplicate titles within same scope
- **Ownership Verification**: Users can only access their own data

### Error Handling

- **Comprehensive Error Messages**: Clear error messages for different scenarios
- **HTTP Status Codes**: Proper HTTP status codes for different error types
- **Logging**: All errors are logged for debugging

## Usage Examples

### Creating a Category

```typescript
const category = await trpc.menu.createCategory.mutate({
  title: 'Main Dishes',
  icon: '🍽️',
  description: 'Our signature main dishes',
  active: true,
  storeBranchId: 'branch_id_here',
});
```

### Creating an Item with Images

```typescript
const item = await trpc.menu.createItem.mutate({
  title: 'Grilled Salmon',
  icon: '🐟',
  description: 'Fresh grilled salmon with herbs',
  price: 24.99,
  currency: 'USD',
  active: true,
  categoryId: 'category_id_here',
  imageIds: ['file_id_1', 'file_id_2'],
});
```

### Getting Public Menu

```typescript
const menu = await trpc.menu.getPublicMenu.query({
  storeBranchId: 'branch_id_here',
  includeInactive: false,
});
```

## Database Migration

The schema has been updated with:

1. **Price fields** in Item model
2. **ItemImage junction table** for image galleries
3. **File relationship** for image management

Run the migration with:

```bash
npx prisma migrate dev --name add_menu_price_and_images
```

## Next Steps

1. **Frontend Integration**: Create React components for menu management
2. **Image Upload**: Implement file upload functionality
3. **Menu Display**: Create customer-facing menu display
4. **Search & Filter**: Add advanced search and filtering features
5. **Analytics**: Track popular items and categories
