import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"

// ============================================================
// Health Check API Definition
// ============================================================

const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
})

const ReadyResponse = Schema.Struct({
  status: Schema.Literal("ready"),
})

export class HealthApi extends HttpApiGroup.make("health")
  .add(
    HttpApiEndpoint.get("healthCheck", "/health")
      .addSuccess(HealthResponse)
      .annotate(OpenApi.Summary, "Health check endpoint")
  )
  .add(
    HttpApiEndpoint.get("readiness", "/ready")
      .addSuccess(ReadyResponse)
      .annotate(OpenApi.Summary, "Readiness check endpoint")
  ) {}
