import type { RequestHandler } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Options } from "pino-http";
import pinoHttpImport from "pino-http";

/** Callable default export under `moduleResolution: bundler`; namespace under `node16`. */
function pinoHttpFactory(opts?: Options): RequestHandler {
  const factory =
    typeof pinoHttpImport === "function"
      ? pinoHttpImport
      : (pinoHttpImport as { default: typeof pinoHttpImport }).default;
  return factory(opts) as unknown as RequestHandler;
}

export { pinoHttpFactory };
export type { IncomingMessage, ServerResponse };
