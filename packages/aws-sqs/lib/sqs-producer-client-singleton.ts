import { SQSProducerClient } from "@/sqs-producer";
import { SQSProvider } from "@/sqs-provider";
import { SQSClient } from "@aws-sdk/client-sqs";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";

class SQSProducerClientSingleton {
  private static instance: SQSProducerClient;

  public static getInstance(): SQSProducerClient {
    if (!SQSProducerClientSingleton.instance) {
      const sqsProvider = this.createSQSProvider();
      const logger = this.createLogger();
      SQSProducerClientSingleton.instance = new SQSProducerClient(
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

export default SQSProducerClientSingleton;
