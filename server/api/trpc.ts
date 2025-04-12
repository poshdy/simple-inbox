import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@clerk/nextjs/server";
import { db } from "../db";

/* CREATING A CONTEXT WITH AUTH STATE AND DB CONNECTION 
THIS DATA IS ACCESSABLE AND SHARED BY ALL ROUTERS

*/
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const user = await auth();

  return {
    auth: user,
    db,
    ...opts,
  };
};

// INITIALIZING TRPC INSTANCE AND CONNECTING TO THE CONTEXT AND TRANSFORMERS

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        message: error.message,
        httpStatus: error.cause instanceof ZodError ? 400 : 500,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// CREATE A SERVER SIDE CALLER
export const createCallerFactory = t.createCallerFactory;

// CREATE A ROUTER INSTANCE

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  //   if (t._config.isDev) {
  //     const waitMs = Math.floor(Math.random() * 400) + 100;
  //     await new Promise((resolve) => setTimeout(resolve, waitMs));
  //   }

  const result = await next();

  const end = Date.now();
  const duration = end - start;
  console.log(`[TRPC] ${path} took ${duration}ms`);

  return result;
});

const IsAuth = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new Error("UNAUTHORIZED");
  }
  return next({ ctx: { ...ctx, auth: ctx.auth as Required<typeof ctx.auth> } });
});

export const publicProcedure = t.procedure.use(timingMiddleware);
export const protectedProcedure = t.procedure.use(timingMiddleware).use(IsAuth);
