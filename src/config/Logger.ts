import { Layer, Logger, LogLevel } from "effect"

// ============================================================
// Logger Configuration
// ============================================================

// Read log level from environment variable (default: Info)
const getLogLevel = (): LogLevel.LogLevel => {
  const level = process.env["LOG_LEVEL"]?.toLowerCase() ?? "info"
  
  switch (level) {
    case "trace": return LogLevel.Trace
    case "debug": return LogLevel.Debug
    case "info": return LogLevel.Info
    case "warning": return LogLevel.Warning
    case "error": return LogLevel.Error
    case "fatal": return LogLevel.Fatal
    case "none": return LogLevel.None
    default: return LogLevel.Info
  }
}

// ============================================================
// Pretty Logger with UTC Timestamps
// ============================================================

const UtcPrettyLogger = Logger.prettyLogger({
  formatDate: (date) => date.toISOString(),
})

// ============================================================
// Exported Logger Layer
// ============================================================

export const LoggerLive = Layer.mergeAll(
  Logger.replace(Logger.defaultLogger, UtcPrettyLogger),
  Logger.minimumLogLevel(getLogLevel())
)

// Re-export log level for reference
export const currentLogLevel = getLogLevel()
