import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { buildPromptContext, evaluateModel, routeMessage } from "./mesroute";

const messageInput = z.object({
  messageId: z.string().max(80).optional(),
  userId: z.string().min(1).max(80),
  conversationType: z.enum(["personal", "group", "business"]),
  messageText: z.string().min(1).max(4000),
  forwardedCount: z.number().int().min(0).max(1000).optional(),
  groupId: z.string().max(80).optional(),
  businessId: z.string().max(80).optional(),
});

const routerMode = z.enum(["demo", "live"]).default("demo");

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  mesroute: router({
    route: publicProcedure
      .input(z.object({ input: messageInput, mode: routerMode }))
      .mutation(({ input }) => routeMessage(input.input, input.mode)),
    routeBatch: publicProcedure
      .input(z.object({ messages: z.array(messageInput).min(1).max(100), mode: routerMode }))
      .mutation(async ({ input }) => Promise.all(input.messages.map((message) => routeMessage(message, input.mode)))),
    inspectContext: publicProcedure
      .input(messageInput)
      .query(({ input }) => buildPromptContext(input)),
    evaluate: publicProcedure
      .input(z.object({ mode: routerMode }))
      .mutation(({ input }) => evaluateModel(input.mode)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
