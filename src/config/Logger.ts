import { Effect, Layer, Logger, LogLevel } from "effect";
import { LogConfig } from "./AppConfig.js";

// ============================================================
// Logger Configuration
// ============================================================

// Parse log level string to LogLevel
const parseLogLevel = (level: string): LogLevel.LogLevel => {
  switch (level.toLowerCase()) {
    case "trace": return LogLevel.Trace;
    case "debug": return LogLevel.Debug;
    case "info": return LogLevel.Info;
    case "warning": return LogLevel.Warning;
    case "error": return LogLevel.Error;
    case "fatal": return LogLevel.Fatal;
    case "none": return LogLevel.None;
    default: return LogLevel.Info;
  }
};

// ============================================================
// Pretty Logger with Local Timestamps
// ============================================================

const LocalPrettyLogger = Logger.prettyLogger({
  formatDate: (date) => date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }),
});

// ============================================================
// Exported Logger Layer (uses Effect Config)
// ============================================================

export const LoggerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LogConfig;
    const logLevel = parseLogLevel(config.level);
    
    return Layer.mergeAll(
      Logger.replace(Logger.defaultLogger, LocalPrettyLogger),
      Logger.minimumLogLevel(logLevel)
    );
  })
);

