import application from './app';

const fastify = application();

const start = async (): Promise<void> => {
  try {
    await fastify.listen(process.env.PORT ?? 3000, '0.0.0.0');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

// eslint-disable-next-line no-void
void start();
