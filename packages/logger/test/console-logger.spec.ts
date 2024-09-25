import { v4 as uuid } from "uuid";

import { ConsoleLogger } from "@/console-logger";
import { LevelType, Logger } from "@/logger";

describe(Logger.name, () => {
  it.each(["info", "warn", "debug", "error", "trace"])(
    "should log info message with level %s",
    (level) => {
      const logger = new ConsoleLogger();

      logger.log({
        message: "info message",
        level: level as LevelType,
        logData: { key: "value" },
      });
    }
  );

  it("should update set request id", () => {
    const logger = new ConsoleLogger();
    const id = uuid();

    logger.setRequestId(id);

    expect(logger.getRequestId()).toBe(id);
  });

  it("should return log without logData", () => {
    const logger = new ConsoleLogger();

    logger.log({
      message: "info message",
    });
  });

  it("should return log pretty mode", () => {
    const logger = new ConsoleLogger({ prettyPrint: true });

    logger.log({
      message: "info message",
      logData: { key: "value" },
    });
  });

  it("should return log disabled mode", () => {
    const logger = new ConsoleLogger({ disabled: true });

    logger.log({
      message: "info message",
      logData: { key: "value" },
    });
  });
});
