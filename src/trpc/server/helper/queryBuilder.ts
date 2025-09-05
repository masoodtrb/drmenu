import { Prisma } from "@prisma/client";
import { prisma } from "@/trpc/server/db";

export type FilterOperation =
  | "eq" // equals
  | "ne" // not equals
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "in" // in array
  | "notIn" // not in array
  | "contains" // contains (string)
  | "startsWith" // starts with
  | "endsWith" // ends with
  | "isNull" // is null
  | "isNotNull" // is not null
  | "between" // between two values
  | "notContains" // does not contain
  | "regex" // regex pattern
  | "search" // full-text search
  | "has" // has relation
  | "hasNot" // does not have relation
  | "some" // some relation matches
  | "every" // every relation matches
  | "none"; // no relation matches

export interface SearchFilter {
  field: string;
  value: any;
  operation: FilterOperation;
  relation?: string; // For nested relations like "user.role"
  caseSensitive?: boolean;
}

export interface QueryBuilderOptions {
  limit?: number;
  offset?: number;
  search?: string | SearchFilter[]; // Enhanced to support both string and array of filters
  searchFields?: string[];
  filters?: Record<string, any>;
  orderBy?: Record<string, "asc" | "desc">;
  include?: Record<string, any>;
  select?: Record<string, any>;
}

export interface QueryBuilderResult<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export class QueryBuilder {
  private options: QueryBuilderOptions;
  private model: any; // Prisma model
  private defaultLimit = 10;
  private maxLimit = 100;

  constructor(model: any, options: QueryBuilderOptions = {}) {
    this.model = model;
    this.options = {
      limit: this.defaultLimit,
      offset: 0,
      ...options,
    };
  }

  /**
   * Convert SearchFilter to Prisma where clause
   */
  private buildFilterCondition(filter: SearchFilter): any {
    const { field, value, operation, relation, caseSensitive = false } = filter;

    // Handle nested relations
    if (relation) {
      const relationPath = relation.split(".");
      const currentCondition: any = {};
      let current = currentCondition;

      // Build nested path
      for (let i = 0; i < relationPath.length - 1; i++) {
        current[relationPath[i]] = {};
        current = current[relationPath[i]];
      }

      // Add the final condition
      current[relationPath[relationPath.length - 1]] =
        this.buildSingleCondition(field, value, operation, caseSensitive);

      return currentCondition;
    }

    return this.buildSingleCondition(field, value, operation, caseSensitive);
  }

  /**
   * Build a single condition based on operation
   */
  private buildSingleCondition(
    field: string,
    value: any,
    operation: FilterOperation,
    caseSensitive: boolean
  ): any {
    const mode = caseSensitive ? undefined : "insensitive";

    switch (operation) {
      case "eq":
        return { equals: value };
      case "ne":
        return { not: value };
      case "gt":
        return { gt: value };
      case "gte":
        return { gte: value };
      case "lt":
        return { lt: value };
      case "lte":
        return { lte: value };
      case "in":
        return { in: Array.isArray(value) ? value : [value] };
      case "notIn":
        return { notIn: Array.isArray(value) ? value : [value] };
      case "contains":
        return { contains: value, mode };
      case "notContains":
        return { not: { contains: value, mode } };
      case "startsWith":
        return { startsWith: value, mode };
      case "endsWith":
        return { endsWith: value, mode };
      case "isNull":
        return null;
      case "isNotNull":
        return { not: null };
      case "between":
        if (Array.isArray(value) && value.length === 2) {
          return { gte: value[0], lte: value[1] };
        }
        throw new Error(
          "Between operation requires array with exactly 2 values"
        );
      case "regex":
        return { search: value, mode };
      case "search":
        return { search: value, mode };
      case "has":
        return { some: value };
      case "hasNot":
        return { none: value };
      case "some":
        return { some: value };
      case "every":
        return { every: value };
      case "none":
        return { none: value };
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  /**
   * Build the where clause for filtering and searching
   */
  private buildWhereClause(): Prisma.JsonObject {
    const whereClause: any = {};

    // Add soft delete filter (if entity has deletedAt field)
    if (this.model.fields?.deletedAt) {
      whereClause.deletedAt = null;
    }

    // Handle advanced search filters
    if (this.options.search) {
      if (Array.isArray(this.options.search)) {
        // Advanced search with array of filters
        const searchConditions = this.options.search.map((filter) =>
          this.buildFilterCondition(filter)
        );

        if (searchConditions.length > 0) {
          // If multiple conditions, combine with AND
          Object.assign(whereClause, ...searchConditions);
        }
      } else if (
        typeof this.options.search === "string" &&
        this.options.searchFields
      ) {
        // Legacy string search
        const searchConditions = this.options.searchFields.map((field) => ({
          [field]: {
            contains: this.options.search as string,
            mode: "insensitive" as const,
          },
        }));

        if (searchConditions.length > 0) {
          whereClause.OR = searchConditions;
        }
      }
    }

    // Add custom filters
    if (this.options.filters) {
      Object.assign(whereClause, this.options.filters);
    }

    return whereClause;
  }

  /**
   * Build the orderBy clause
   */
  private buildOrderByClause(): Record<string, "asc" | "desc"> {
    return this.options.orderBy || { createdAt: "desc" };
  }

  /**
   * Build the include clause for relations
   */
  private buildIncludeClause(): Record<string, any> | undefined {
    return this.options.include;
  }

  /**
   * Build the select clause for specific fields
   */
  private buildSelectClause(): Record<string, any> | undefined {
    return this.options.select;
  }

  /**
   * Execute the query with pagination
   */
  async execute<T>(): Promise<QueryBuilderResult<T>> {
    const limit = Math.min(
      this.options.limit || this.defaultLimit,
      this.maxLimit
    );
    const offset = this.options.offset || 0;

    const whereClause = this.buildWhereClause();
    const orderByClause = this.buildOrderByClause();
    const includeClause = this.buildIncludeClause();
    const selectClause = this.buildSelectClause();

    // Build the query options
    const queryOptions: any = {
      where: whereClause,
      orderBy: orderByClause,
      take: limit,
      skip: offset,
    };

    // Add include or select (not both)
    if (includeClause) {
      queryOptions.include = includeClause;
    } else if (selectClause) {
      queryOptions.select = selectClause;
    }

    // Execute queries in parallel
    const [data, totalCount] = await Promise.all([
      this.model.findMany(queryOptions),
      this.model.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const hasMore = offset + limit < totalCount;

    return {
      data: data as T[],
      totalCount,
      hasMore,
      currentPage,
      totalPages,
    };
  }

  /**
   * Set advanced search filters
   */
  search(filters: SearchFilter[]): this {
    this.options.search = filters;
    return this;
  }

  /**
   * Set legacy string search (for backward compatibility)
   */
  searchText(searchTerm: string, searchFields: string[]): this {
    this.options.search = searchTerm;
    this.options.searchFields = searchFields;
    return this;
  }

  /**
   * Set pagination options
   */
  paginate(limit?: number, offset?: number): this {
    if (limit !== undefined) this.options.limit = limit;
    if (offset !== undefined) this.options.offset = offset;
    return this;
  }

  /**
   * Set filters
   */
  filter(filters: Record<string, any>): this {
    this.options.filters = { ...this.options.filters, ...filters };
    return this;
  }

  /**
   * Set ordering
   */
  orderBy(orderBy: Record<string, "asc" | "desc">): this {
    this.options.orderBy = orderBy;
    return this;
  }

  /**
   * Set includes for relations
   */
  include(include: Record<string, any>): this {
    this.options.include = include;
    return this;
  }

  /**
   * Set select for specific fields
   */
  select(select: Record<string, any>): this {
    this.options.select = select;
    return this;
  }
}

/**
 * Factory function to create a query builder for any model
 */
export function createQueryBuilder<T>(
  model: any,
  options: QueryBuilderOptions = {}
): QueryBuilder {
  return new QueryBuilder(model, options);
}

/**
 * Predefined query builders for common entities
 */
export class StoreQueryBuilder extends QueryBuilder {
  constructor(options: QueryBuilderOptions = {}) {
    super(prisma?.store, options);
  }

  /**
   * Search in store title and description
   */
  searchStores(searchTerm: string): this {
    return this.searchText(searchTerm, ["title"]);
  }

  /**
   * Advanced search for stores
   */
  searchStoresAdvanced(filters: SearchFilter[]): this {
    return this.search(filters);
  }

  /**
   * Filter by store type
   */
  byStoreType(storeTypeId: string): this {
    return this.filter({ storeTypeId });
  }

  /**
   * Filter by active status
   */
  byActiveStatus(active: boolean): this {
    return this.filter({ active });
  }

  /**
   * Filter by user ownership
   */
  byUser(userId: string): this {
    return this.filter({ userId });
  }

  /**
   * Filter by creation date range
   */
  byCreatedDateRange(startDate: Date, endDate: Date): this {
    return this.search([
      { field: "createdAt", value: [startDate, endDate], operation: "between" },
    ]);
  }

  /**
   * Filter by store type with advanced conditions
   */
  byStoreTypeAdvanced(storeTypeIds: string[]): this {
    return this.search([
      { field: "storeTypeId", value: storeTypeIds, operation: "in" },
    ]);
  }

  /**
   * Include store type and user relations
   */
  withRelations(): this {
    return this.include({
      storeType: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      _count: {
        select: {
          StoreBranch: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    });
  }
}

export class UserQueryBuilder extends QueryBuilder {
  constructor(options: QueryBuilderOptions = {}) {
    super(prisma?.user, options);
  }

  /**
   * Search in username and email
   */
  searchUsers(searchTerm: string): this {
    return this.searchText(searchTerm, ["username"]);
  }

  /**
   * Advanced search for users
   */
  searchUsersAdvanced(filters: SearchFilter[]): this {
    return this.search(filters);
  }

  /**
   * Filter by role
   */
  byRole(role: string): this {
    return this.filter({ role });
  }

  /**
   * Filter by active status
   */
  byActiveStatus(active: boolean): this {
    return this.filter({ active });
  }

  /**
   * Filter by creation date
   */
  byCreatedAfter(date: Date): this {
    return this.search([{ field: "createdAt", value: date, operation: "gte" }]);
  }

  /**
   * Filter by username pattern
   */
  byUsernamePattern(pattern: string): this {
    return this.search([
      { field: "username", value: pattern, operation: "contains" },
    ]);
  }

  /**
   * Include profile relation
   */
  withProfile(): this {
    return this.include({
      Profile: true,
    });
  }
}

export class FileQueryBuilder extends QueryBuilder {
  constructor(options: QueryBuilderOptions = {}) {
    super(prisma?.file, options);
  }

  /**
   * Search in file name
   */
  searchFiles(searchTerm: string): this {
    return this.searchText(searchTerm, ["name"]);
  }

  /**
   * Advanced search for files
   */
  searchFilesAdvanced(filters: SearchFilter[]): this {
    return this.search(filters);
  }

  /**
   * Filter by owner
   */
  byOwner(ownerId: string): this {
    return this.filter({ ownerId });
  }

  /**
   * Filter by published status
   */
  byPublishedStatus(published: boolean): this {
    return this.filter({ published });
  }

  /**
   * Filter by storage type
   */
  byStorageType(storageType: string): this {
    return this.filter({ storageType });
  }

  /**
   * Filter by file size range
   */
  byFileSizeRange(minSize: number, maxSize: number): this {
    return this.search([
      { field: "size", value: [minSize, maxSize], operation: "between" },
    ]);
  }

  /**
   * Filter by file type
   */
  byFileType(mimeTypes: string[]): this {
    return this.search([
      { field: "mimeType", value: mimeTypes, operation: "in" },
    ]);
  }

  /**
   * Include owner relation
   */
  withOwner(): this {
    return this.include({
      owner: {
        select: {
          id: true,
          username: true,
        },
      },
    });
  }
}

/**
 * Utility functions for common query patterns
 */
export const QueryUtils = {
  /**
   * Create a basic list query
   */
  createListQuery<T>(
    model: any,
    options: QueryBuilderOptions = {}
  ): Promise<QueryBuilderResult<T>> {
    return createQueryBuilder<T>(model, options).execute();
  },

  /**
   * Create a search query with advanced filters
   */
  createAdvancedSearchQuery<T>(
    model: any,
    filters: SearchFilter[],
    options: QueryBuilderOptions = {}
  ): Promise<QueryBuilderResult<T>> {
    return createQueryBuilder<T>(model, options).search(filters).execute();
  },

  /**
   * Create a legacy search query
   */
  createSearchQuery<T>(
    model: any,
    searchTerm: string,
    searchFields: string[],
    options: QueryBuilderOptions = {}
  ): Promise<QueryBuilderResult<T>> {
    return createQueryBuilder<T>(model, options)
      .searchText(searchTerm, searchFields)
      .execute();
  },

  /**
   * Create a filtered query
   */
  createFilteredQuery<T>(
    model: any,
    filters: Record<string, any>,
    options: QueryBuilderOptions = {}
  ): Promise<QueryBuilderResult<T>> {
    return createQueryBuilder<T>(model, options).filter(filters).execute();
  },
};
