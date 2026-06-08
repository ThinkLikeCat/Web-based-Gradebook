import { createServer } from './infrastructure/webserver/server';

const PORT = process.env.PORT || 3000;

async function main() {
  const app = await createServer();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}/api/students/:id/schedule`);
    console.log(`http://localhost:${PORT}/api/students/:id/journal`);
    console.log(`http://localhost:${PORT}/api/students/:id/subjects/:subjectId`);
    console.log(`http://localhost:${PORT}/api/students/:id/labs/:labId`);
  });
}

main().catch(console.error);
