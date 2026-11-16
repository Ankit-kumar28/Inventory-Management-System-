import { connectDatabase } from './config/database.js';
import { config } from './config/env.js';
import app from './app.js';

async function startServer() {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    console.log(`\n🚀 Inventory Management Server`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   URL: ${config.appUrl}`);
    console.log(`   Client: ${config.clientUrl}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${config.port} is already in use.`);
      console.error(`   To free port ${config.port}, run: npx kill-port ${config.port} or kill -9 $(lsof -ti :${config.port})\n`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
