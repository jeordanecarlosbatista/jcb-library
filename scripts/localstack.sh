#!/bin/bash

export $(grep -v '^#' .env | xargs)

docker-compose up -d

echo "Waiting for LocalStack to start..."
sleep 10

echo "Creating the SQS queue..."

awslocal sqs create-queue --queue-name test-queue.fifo --attributes FifoQueue=true
awslocal sqs create-queue --queue-name test-queue-dlq.fifo --attributes FifoQueue=true


echo "SQS queue created successfully."