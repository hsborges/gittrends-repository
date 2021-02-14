import application from './app';
import mongoClient from '@gittrends/database-config';

(async (): Promise<void> => {
  const fastify = application();

  await mongoClient.connect().catch((error) => {
    fastify.log.error(error);
    process.exit(1);
  });

  try {
    await fastify.listen(process.env.PORT ?? 3000, '0.0.0.0');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
})();
