import { PrismaClient } from "@prisma/client";

// Extend the global object to include the PrismaClient instance.
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

prisma.$use(async (params, next) => {
  if (params.model) {
    if (params.action === "delete") {
      params.action = "update";
      params.args["data"] = { deleted_at: new Date().toUTCString() };
    }
    if (params.action === "deleteMany") {
      params.action = "updateMany";
      if (params.args.data != undefined) {
        params.args.data["deleted_at"] = new Date().toUTCString();
      } else {
        params.args["data"] = { deleted_at: new Date().toUTCString() };
      }
    }
  }

  return next(params);
});
// In development, ensure the PrismaClient instance is not recreated on hot reloads.
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
