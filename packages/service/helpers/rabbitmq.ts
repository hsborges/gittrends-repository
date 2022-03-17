/*
 *  Author: Hudson S. Borges
 */
import amqp, { Connection } from 'amqplib';

import * as Entities from '@gittrends/database/dist/entities';

class RabbitMQClient {
  private conn?: Connection;

  public async connect() {
    this.conn = await amqp
      .connect(process.env.GT_RABBITMQ_URL || 'amqp://localhost:5672')
      .then((conn) => (this.conn ? conn.close().then(() => this.conn) : conn));

    if (!this.conn) throw new Error('RabbitMQ connection error!');
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

    return this.conn;
  }

  async createChannel() {
    if (!this.conn) await this.connect();
    const channel = await this.conn?.createConfirmChannel();
    if (!channel) throw Error('Erro connecting to message broker.');
    return channel;
  }
}

const client = new RabbitMQClient();
export const connect = client.connect.bind(client);
export const createChannel = client.createChannel.bind(client);
