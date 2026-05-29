import express from 'express';

export async function createServer() {
  const app = express();

  app.use(express.json());

  // Routes will be registered here

  return app;
}
