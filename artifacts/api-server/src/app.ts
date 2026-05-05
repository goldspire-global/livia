import express, { type Express, type ErrorRequestHandler, type RequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
};
app.use("/api", notFoundHandler);

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled API error");
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
};
app.use(errorHandler);

export default app;
