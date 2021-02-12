import application from './app';
import mongoClient from '@gittrends/database-config';

(async (): Promise<void> => {
  await mongoClient.connect();
  const fastify = await application();

  try {
    await fastify.listen(process.env.PORT ?? 3000, '0.0.0.0');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
})();
