import { createServer } from './infrastructure/webserver/server';
import { config } from './config';

async function main() {
  const app = await createServer();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`http://localhost:${config.port}/api/students/:id/schedule`);
    console.log(`http://localhost:${config.port}/api/students/:id/journal`);
    console.log(`http://localhost:${config.port}/api/students/:id/subjects/:subjectId`);
    console.log(`http://localhost:${config.port}/api/students/:id/labs/:labId`);
  });
}

main().catch(console.error);
