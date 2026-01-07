import { NodeSdk } from "@effect/opentelemetry"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node"

// ============================================================
// OpenTelemetry Configuration
// ============================================================

const OTEL_ENDPOINT = process.env["OTEL_EXPORTER_OTLP_ENDPOINT"] ?? "http://localhost:4318"

export const TracingLive = NodeSdk.layer(() => ({
  resource: {
    serviceName: "effect-crud-app",
    serviceVersion: "1.0.0",
  },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${OTEL_ENDPOINT}/v1/traces`,
    })
  ),
}))
