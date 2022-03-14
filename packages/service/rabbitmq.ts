/*
 *  Author: Hudson S. Borges
 */
import { connect, Connection } from 'amqplib';

import * as Entities from '@gittrends/database/dist/entities';

class RabbitMQClient {
  private conn?: Connection;

  private async connect() {
    this.conn = await connect(process.env.GT_RABBITMQ_URL || 'amqp://localhost:5672');
    this.conn.on('close', () => (this.conn = undefined));

    const channel = await this.conn.createConfirmChannel();

    await Promise.all(
      Object.values(Entities)
        .filter((E) => E !== Entities.Entity)
        .map((E) =>
          channel?.assertQueue(E.name, { durable: true, arguments: { 'x-queue-mode': 'lazy' } })
        )
    );

    await channel.close();
  }

  async createChannel() {
    if (!this.conn) await this.connect();
    const channel = await this.conn?.createConfirmChannel();
    if (!channel) throw Error('Erro connecting to message broker.');
    return channel;
  }
}

const client = new RabbitMQClient();
export const createChannel = client.createChannel.bind(client);
