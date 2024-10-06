import { SQSProducerClient } from "@/sqs-producer";
import { SQSProvider } from "@/sqs-provider";
import { SQSClient } from "@aws-sdk/client-sqs";
import { ConsoleLogger } from "@jeordanecarlosbatista/jcb-logger";

class SQSProducerClientSingleton {
  private static instance: SQSProducerClient;

  private constructor() {}

  public static getInstance(): SQSProducerClient {
    if (!SQSProducerClientSingleton.instance) {
      const sqsProvider = new SQSProvider(
        new SQSClient({
          endpoint: process.env.AWS_SQS_ENDPOINT,
          region: process.env.AWS_REGION,
        })
      );
      const logger = new ConsoleLogger();
      SQSProducerClientSingleton.instance = new SQSProducerClient(
        sqsProvider,
        logger
      );
    }
    return SQSProducerClientSingleton.instance;
  }
}

export default SQSProducerClientSingleton;
