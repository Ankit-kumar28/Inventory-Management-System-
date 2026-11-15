import session from 'express-session';
import MongoStore from 'connect-mongo';
import { config } from './env.js';
export function createSessionMiddleware() {
  return session({
    name: config.sessionName,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoUri,
      collectionName: 'sessions',
      ttl: config.sessionMaxAge / 1000,
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
      maxAge: config.sessionMaxAge,
    },
  });
}
