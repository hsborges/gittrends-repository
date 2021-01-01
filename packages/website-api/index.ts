import application from './app';

const fastify = application();
const PORT: number = parseInt(process.env.PORT ?? '3000', 10);

const start = async (): Promise<void> => {
  try {
    await fastify.listen(PORT, '0.0.0.0');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

// eslint-disable-next-line no-void
void start();
