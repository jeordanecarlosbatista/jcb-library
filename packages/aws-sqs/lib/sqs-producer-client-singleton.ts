import { SQSClient } from "@aws-sdk/client-sqs";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";
import { SQSProvider } from "@lib/sqs-provider";
import { SqsProducer } from "@lib/sqs-producer";

class SQSProducerClientSingleton {
  private static instance: SqsProducer;

  public static getInstance(): SqsProducer {
    if (!SQSProducerClientSingleton.instance) {
      const sqsProvider = this.createSQSProvider();
      const logger = this.createLogger();
      SQSProducerClientSingleton.instance = new SqsProducer(
        sqsProvider,
        logger
      );
    }
    return SQSProducerClientSingleton.instance;
  }

  private static createSQSProvider(): SQSProvider {
    const sqsClient = new SQSClient({
      endpoint: process.env.AWS_SQS_ENDPOINT,
      region: process.env.AWS_REGION,
    });
    return new SQSProvider(sqsClient);
  }

  private static createLogger(): ConsoleLogger {
    return new ConsoleLogger();
  }
}

export { SQSProducerClientSingleton };
