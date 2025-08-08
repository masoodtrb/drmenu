import { z } from "zod";
import { Prisma } from "@prisma/client";
import { SearchFilter, FilterOperation } from "./queryBuilder";

/**
 * Field configuration for model generation
 */
export interface ModelField {
  name: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "array"
    | "object"
    | "relation";
  required?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: string[];
  };
  relation?: {
    model: string;
    type: "one" | "many";
    field?: string;
  };
  defaultValue?: any;
  transform?: (value: any) => any;
}

/**
 * Model configuration for generating CRUD operations
 */
export interface ModelConfig {
  name: string; // Model name (e.g., "store", "user")
  tableName: string; // Database table name
  fields: ModelField[];
  searchFields?: string[];
  defaultFilters?: Record<string, any>;
  defaultIncludes?: Record<string, any>;
  defaultOrderBy?: Record<string, "asc" | "desc">;
  softDelete?: boolean; // Whether the model supports soft delete
  audit?: boolean; // Whether the model supports audit logging
  permissions?: {
    create?: string[]; // Required roles for create
    read?: string[]; // Required roles for read
    update?: string[]; // Required roles for update
    delete?: string[]; // Required roles for delete
    list?: string[]; // Required roles for list
  };
  hooks?: {
    beforeCreate?: (data: any) => any;
    afterCreate?: (data: any) => any;
    beforeUpdate?: (data: any) => any;
    afterUpdate?: (data: any) => any;
    beforeDelete?: (data: any) => any;
    afterDelete?: (data: any) => any;
  };
}

/**
 * Generated model structure
 */
export interface GeneratedModel {
  config: ModelConfig;
  schemas: {
    create: z.ZodSchema;
    update: z.ZodSchema;
    list: z.ZodSchema;
    getById: z.ZodSchema;
    delete: z.ZodSchema;
    searchFilter: z.ZodSchema;
  };
  router: any; // tRPC router
  queryBuilder: any; // Query builder class
  types: {
    input: Record<string, any>;
    output: Record<string, any>;
  };
}

/**
 * Model Builder for generating CRUD operations
 */
export class ModelBuilder {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  /**
   * Generate Zod validation schemas
   */
  private generateSchemas() {
    const { fields } = this.config;

    // Create base field schema
    const baseFieldSchema: Record<string, z.ZodSchema> = {};

    fields.forEach((field) => {
      let schema: z.ZodSchema;

      switch (field.type) {
        case "string":
          schema = z.string();
          if (field.validation?.minLength)
            schema = schema.min(field.validation.minLength);
          if (field.validation?.maxLength)
            schema = schema.max(field.validation.maxLength);
          if (field.validation?.pattern)
            schema = schema.regex(new RegExp(field.validation.pattern));
          if (field.validation?.enum)
            schema = z.enum(field.validation.enum as [string, ...string[]]);
          break;

        case "number":
          schema = z.number();
          if (field.validation?.min !== undefined)
            schema = schema.min(field.validation.min);
          if (field.validation?.max !== undefined)
            schema = schema.max(field.validation.max);
          break;

        case "boolean":
          schema = z.boolean();
          break;

        case "date":
          schema = z.date();
          break;

        case "array":
          schema = z.array(z.any());
          break;

        case "object":
          schema = z.record(z.any());
          break;

        case "relation":
          schema = z.string();
          break;

        default:
          schema = z.any();
      }

      if (field.required) {
        baseFieldSchema[field.name] = schema;
      } else {
        baseFieldSchema[field.name] = schema.optional();
      }
    });

    // Create schema
    const createSchema = z.object(baseFieldSchema);

    // Update schema (all fields optional)
    const updateFieldSchema: Record<string, z.ZodSchema> = {};
    fields.forEach((field) => {
      let schema: z.ZodSchema;

      switch (field.type) {
        case "string":
          schema = z.string().optional();
          break;
        case "number":
          schema = z.number().optional();
          break;
        case "boolean":
          schema = z.boolean().optional();
          break;
        case "date":
          schema = z.date().optional();
          break;
        case "array":
          schema = z.array(z.any()).optional();
          break;
        case "object":
          schema = z.record(z.any()).optional();
          break;
        case "relation":
          schema = z.string().optional();
          break;
        default:
          schema = z.any().optional();
      }

      updateFieldSchema[field.name] = schema;
    });

    const updateSchema = z.object({
      id: z.string().min(1, `${this.config.name} ID is required`),
      ...updateFieldSchema,
    });

    // List schema
    const listSchema = z.object({
      limit: z.number().min(1).max(100).optional().default(10),
      offset: z.number().min(0).optional().default(0),
      search: z.string().optional(),
      advancedSearch: z.array(this.generateSearchFilterSchema()).optional(),
      orderBy: z.record(z.enum(["asc", "desc"])).optional(),
      ...this.generateFilterFields(),
    });

    // Get by ID schema
    const getByIdSchema = z.object({
      id: z.string().min(1, `${this.config.name} ID is required`),
    });

    // Delete schema
    const deleteSchema = z.object({
      id: z.string().min(1, `${this.config.name} ID is required`),
    });

    // Search filter schema
    const searchFilterSchema = this.generateSearchFilterSchema();

    return {
      create: createSchema,
      update: updateSchema,
      list: listSchema,
      getById: getByIdSchema,
      delete: deleteSchema,
      searchFilter: searchFilterSchema,
    };
  }

  /**
   * Generate search filter schema
   */
  private generateSearchFilterSchema() {
    return z.object({
      field: z.string(),
      value: z.any(),
      operation: z.enum([
        "eq",
        "ne",
        "gt",
        "gte",
        "lt",
        "lte",
        "in",
        "notIn",
        "contains",
        "startsWith",
        "endsWith",
        "isNull",
        "isNotNull",
        "between",
        "notContains",
        "regex",
        "search",
        "has",
        "hasNot",
        "some",
        "every",
        "none",
      ]),
      relation: z.string().optional(),
      caseSensitive: z.boolean().optional(),
    });
  }

  /**
   * Generate filter fields based on model fields
   */
  private generateFilterFields() {
    const filterFields: Record<string, z.ZodSchema> = {};

    this.config.fields.forEach((field) => {
      if (field.filterable) {
        switch (field.type) {
          case "boolean":
            filterFields[field.name] = z.boolean().optional();
            break;
          case "string":
            filterFields[field.name] = z.string().optional();
            break;
          case "number":
            filterFields[field.name] = z.number().optional();
            break;
          case "date":
            filterFields[field.name] = z.date().optional();
            break;
          case "array":
            filterFields[field.name] = z.array(z.string()).optional();
            break;
          case "relation":
            filterFields[field.name] = z.string().optional();
            break;
        }
      }
    });

    return filterFields;
  }

  /**
   * Generate query builder class
   */
  private generateQueryBuilder() {
    const className = `${this.capitalizeFirst(this.config.name)}QueryBuilder`;

    return `
import { QueryBuilder } from "./queryBuilder";
import { SearchFilter } from "./queryBuilder";

export class ${className} extends QueryBuilder {
  constructor(options: any = {}) {
    super(globalThis.prisma?.${this.config.name}, options);
  }

  // Search methods
  search${this.capitalizeFirst(this.config.name)}s(searchTerm: string): this {
    return this.searchText(searchTerm, ${JSON.stringify(
      this.config.searchFields || []
    )});
  }

  search${this.capitalizeFirst(
    this.config.name
  )}sAdvanced(filters: SearchFilter[]): this {
    return this.search(filters);
  }

  // Filter methods
  ${this.generateFilterMethods()}

  // Include methods
  withRelations(): this {
    return this.include(${JSON.stringify(this.config.defaultIncludes || {})});
  }
}
`;
  }

  /**
   * Generate filter methods for query builder
   */
  private generateFilterMethods(): string {
    const methods: string[] = [];

    this.config.fields.forEach((field) => {
      if (field.filterable) {
        const methodName = `by${this.capitalizeFirst(field.name)}`;
        const filterName = field.name;

        switch (field.type) {
          case "boolean":
            methods.push(`
  ${methodName}(value: boolean): this {
    return this.filter({ ${filterName}: value });
  }`);
            break;
          case "string":
            methods.push(`
  ${methodName}(value: string): this {
    return this.filter({ ${filterName}: value });
  }`);
            break;
          case "number":
            methods.push(`
  ${methodName}(value: number): this {
    return this.filter({ ${filterName}: value });
  }`);
            break;
          case "date":
            methods.push(`
  ${methodName}Range(startDate: Date, endDate: Date): this {
    return this.search([
      { field: "${filterName}", value: [startDate, endDate], operation: "between" }
    ]);
  }`);
            break;
          case "array":
            methods.push(`
  ${methodName}Advanced(values: string[]): this {
    return this.search([
      { field: "${filterName}", value: values, operation: "in" }
    ]);
  }`);
            break;
          case "relation":
            methods.push(`
  by${this.capitalizeFirst(
    field.relation?.model || field.name
  )}(value: string): this {
    return this.filter({ ${filterName}: value });
  }`);
            break;
        }
      }
    });

    return methods.join("\n");
  }

  /**
   * Generate tRPC router
   */
  private generateRouter() {
    const routerName = `${this.config.name}Router`;
    const queryBuilderName = `${this.capitalizeFirst(
      this.config.name
    )}QueryBuilder`;

    return `
import { createTRPCRouter, privateProcedure, requireRoles } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";
import { ${queryBuilderName} } from "./${this.config.name}QueryBuilder";
import { getErrorMessage } from "@/trpc/server/constants/messages";
import { ${this.config.name}Schemas } from "./${this.config.name}Validation";

export const ${routerName} = createTRPCRouter({
  // Create ${this.config.name}
  create: ${this.generatePermissionCheck("create")}
    .input(${this.config.name}Schemas.create)
    .mutation(async ({ ctx, input }) => {
      try {
        ${this.generateCreateLogic()}
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create ${this.config.name}",
        });
      }
    }),

  // Get ${this.config.name} by ID
  getById: ${this.generatePermissionCheck("read")}
    .input(${this.config.name}Schemas.getById)
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;
        const ${this.config.name} = await ctx.db.${this.config.name}.findFirst({
          where: { id, ${this.config.softDelete ? "deletedAt: null," : ""} },
          include: ${JSON.stringify(this.config.defaultIncludes || {})},
        });

        if (!${this.config.name}) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "${this.capitalizeFirst(this.config.name)} not found",
          });
        }

        return { ${this.config.name} };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ${this.config.name}",
        });
      }
    }),

  // List ${this.config.name}s
  list: ${this.generatePermissionCheck("list")}
    .input(${this.config.name}Schemas.list)
    .query(async ({ ctx, input }) => {
      try {
        const { limit, offset, search, advancedSearch, ...filters } = input;

        const queryBuilder = new ${queryBuilderName}()
          .paginate(limit, offset)
          .withRelations();

        // Add advanced search if provided
        if (advancedSearch && advancedSearch.length > 0) {
          queryBuilder.search${this.capitalizeFirst(
            this.config.name
          )}sAdvanced(advancedSearch);
        }
        // Add legacy search if provided
        else if (search) {
          queryBuilder.search${this.capitalizeFirst(this.config.name)}s(search);
        }

        // Add filters
        ${this.generateFilterLogic()}

        const result = await queryBuilder.execute();

        return {
          ${this.config.name}s: result.data,
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
        };
      } catch (err: unknown) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ${this.config.name}s",
        });
      }
    }),

  // Update ${this.config.name}
  update: ${this.generatePermissionCheck("update")}
    .input(${this.config.name}Schemas.update)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const existing${this.capitalizeFirst(
          this.config.name
        )} = await ctx.db.${this.config.name}.findFirst({
          where: { id, ${this.config.softDelete ? "deletedAt: null," : ""} },
        });

        if (!existing${this.capitalizeFirst(this.config.name)}) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "${this.capitalizeFirst(this.config.name)} not found",
          });
        }

        const ${this.config.name} = await ctx.db.${this.config.name}.update({
          where: { id },
          data: updateData,
          include: ${JSON.stringify(this.config.defaultIncludes || {})},
        });

        return {
          success: true,
          ${this.config.name},
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update ${this.config.name}",
        });
      }
    }),

  // Delete ${this.config.name}
  delete: ${this.generatePermissionCheck("delete")}
    .input(${this.config.name}Schemas.delete)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input;

        const ${this.config.name} = await ctx.db.${this.config.name}.findFirst({
          where: { id, ${this.config.softDelete ? "deletedAt: null," : ""} },
        });

        if (!${this.config.name}) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "${this.capitalizeFirst(this.config.name)} not found",
          });
        }

        ${
          this.config.softDelete
            ? `await ctx.db.${this.config.name}.update({
          where: { id },
          data: { deletedAt: new Date() },
        });`
            : `await ctx.db.${this.config.name}.delete({
          where: { id },
        });`
        }

        return {
          success: true,
          message: "${this.capitalizeFirst(
            this.config.name
          )} deleted successfully",
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete ${this.config.name}",
        });
      }
    }),
});
`;
  }

  /**
   * Generate permission check
   */
  private generatePermissionCheck(operation: string): string {
    const roles =
      this.config.permissions?.[
        operation as keyof typeof this.config.permissions
      ];
    if (roles && roles.length > 0) {
      return `requireRoles([${roles
        .map((role) => `Role.${role.toUpperCase()}`)
        .join(", ")}])`;
    }
    return "privateProcedure";
  }

  /**
   * Generate create logic
   */
  private generateCreateLogic(): string {
    const requiredFields = this.config.fields.filter((f) => f.required);
    const fieldNames = requiredFields.map((f) => f.name);

    return `
        const { ${fieldNames.join(", ")} } = input;

        const ${this.config.name} = await ctx.db.${this.config.name}.create({
          data: input,
          include: ${JSON.stringify(this.config.defaultIncludes || {})},
        });

        return {
          success: true,
          ${this.config.name},
        };`;
  }

  /**
   * Generate filter logic
   */
  private generateFilterLogic(): string {
    const filterableFields = this.config.fields.filter((f) => f.filterable);
    const filterLogic: string[] = [];

    filterableFields.forEach((field) => {
      const methodName = `by${this.capitalizeFirst(field.name)}`;
      filterLogic.push(`
        if (filters.${field.name} !== undefined) {
          queryBuilder.${methodName}(filters.${field.name});
        }`);
    });

    return filterLogic.join("\n");
  }

  /**
   * Generate types
   */
  private generateTypes() {
    return {
      input: {
        create: `Create${this.capitalizeFirst(this.config.name)}Input`,
        update: `Update${this.capitalizeFirst(this.config.name)}Input`,
        list: `List${this.capitalizeFirst(this.config.name)}sInput`,
        getById: `Get${this.capitalizeFirst(this.config.name)}ByIdInput`,
        delete: `Delete${this.capitalizeFirst(this.config.name)}Input`,
      },
      output: {
        create: `Create${this.capitalizeFirst(this.config.name)}Output`,
        update: `Update${this.capitalizeFirst(this.config.name)}Output`,
        list: `List${this.capitalizeFirst(this.config.name)}sOutput`,
        getById: `Get${this.capitalizeFirst(this.config.name)}ByIdOutput`,
        delete: `Delete${this.capitalizeFirst(this.config.name)}Output`,
      },
    };
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate complete model
   */
  generate(): GeneratedModel {
    const schemas = this.generateSchemas();

    return {
      config: this.config,
      schemas,
      router: this.generateRouter(),
      queryBuilder: this.generateQueryBuilder(),
      types: this.generateTypes(),
    };
  }
}

/**
 * Predefined model configurations
 */
export const ModelConfigs = {
  store: {
    name: "store",
    tableName: "store",
    fields: [
      {
        name: "title",
        type: "string",
        required: true,
        searchable: true,
        filterable: true,
        validation: { minLength: 1, maxLength: 255 },
      },
      {
        name: "active",
        type: "boolean",
        required: false,
        filterable: true,
        defaultValue: false,
      },
      {
        name: "userId",
        type: "relation",
        required: true,
        filterable: true,
        relation: { model: "user", type: "one" },
      },
      {
        name: "storeTypeId",
        type: "relation",
        required: true,
        filterable: true,
        relation: { model: "storeType", type: "one" },
      },
    ],
    searchFields: ["title"],
    defaultFilters: { deletedAt: null },
    defaultIncludes: {
      storeType: true,
      user: { select: { id: true, username: true } },
      _count: { select: { StoreBranch: { where: { deletedAt: null } } } },
    },
    defaultOrderBy: { createdAt: "desc" },
    softDelete: true,
    permissions: {
      create: ["ADMIN"],
      read: ["ADMIN", "STORE_ADMIN"],
      update: ["ADMIN"],
      delete: ["ADMIN"],
      list: ["ADMIN"],
    },
  },

  user: {
    name: "user",
    tableName: "user",
    fields: [
      {
        name: "username",
        type: "string",
        required: true,
        searchable: true,
        filterable: true,
        validation: { minLength: 3, maxLength: 50 },
      },
      { name: "password", type: "string", required: true },
      {
        name: "role",
        type: "string",
        required: true,
        filterable: true,
        validation: { enum: ["ADMIN", "STORE_ADMIN"] },
      },
      {
        name: "active",
        type: "boolean",
        required: false,
        filterable: true,
        defaultValue: false,
      },
    ],
    searchFields: ["username"],
    defaultFilters: { deletedAt: null },
    defaultIncludes: { Profile: true },
    defaultOrderBy: { createdAt: "desc" },
    softDelete: true,
    permissions: {
      create: ["ADMIN"],
      read: ["ADMIN"],
      update: ["ADMIN"],
      delete: ["ADMIN"],
      list: ["ADMIN"],
    },
  },

  file: {
    name: "file",
    tableName: "file",
    fields: [
      {
        name: "name",
        type: "string",
        required: true,
        searchable: true,
        filterable: true,
      },
      { name: "path", type: "string", required: true },
      { name: "size", type: "number", required: true, filterable: true },
      { name: "mimeType", type: "string", required: true, filterable: true },
      {
        name: "published",
        type: "boolean",
        required: false,
        filterable: true,
        defaultValue: false,
      },
      {
        name: "storageType",
        type: "string",
        required: false,
        filterable: true,
        defaultValue: "local",
      },
      {
        name: "ownerId",
        type: "relation",
        required: true,
        filterable: true,
        relation: { model: "user", type: "one" },
      },
    ],
    searchFields: ["name"],
    defaultFilters: { deletedAt: null },
    defaultIncludes: { owner: { select: { id: true, username: true } } },
    defaultOrderBy: { createdAt: "desc" },
    softDelete: true,
    permissions: {
      create: ["ADMIN", "STORE_ADMIN"],
      read: ["ADMIN", "STORE_ADMIN"],
      update: ["ADMIN", "STORE_ADMIN"],
      delete: ["ADMIN"],
      list: ["ADMIN", "STORE_ADMIN"],
    },
  },
};

/**
 * Factory function to create model builder
 */
export function createModelBuilder(config: ModelConfig): ModelBuilder {
  return new ModelBuilder(config);
}

/**
 * Generate model from predefined config
 */
export function generateModelFromConfig(
  configName: keyof typeof ModelConfigs
): GeneratedModel {
  const config = ModelConfigs[configName];
  const builder = new ModelBuilder(config);
  return builder.generate();
}
