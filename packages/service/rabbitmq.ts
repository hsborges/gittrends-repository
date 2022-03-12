import amqp, { ConfirmChannel, Connection } from 'amqplib';

export async function createConnection() {
  return amqp.connect(process.env.GT_RABBITMQ_URL || 'amqp://localhost:5672');
}

let connection: Connection | undefined;
let channel: ConfirmChannel | undefined;

export async function useSharedConnection() {
  if (connection && channel) return channel;

  connection = await createConnection();
  channel = await connection.createConfirmChannel();

  await Promise.all([
    channel.prefetch(parseInt(process.env.GT_RABBITMQ_PREFETCH ?? '1', 10)),
    channel.assertQueue('entities', { durable: true })
  ]);

  const originalClose = channel.close.bind(channel);
  channel.close = () => {
    connection = undefined;
    channel = undefined;
    return originalClose();
  };

  return channel;
}
