import express, { CookieOptions, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { profile } from 'console';
import { Account, Class, displayName, getAccount, Guest, Monster, User } from './types';
import dataFile from './data';
import { getProfile, Profile } from './profile';

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/api/hello', (req, res) => {
  res.send('Hello!');
});


app.listen(port, () => console.log(`api: http://localhost:${port}`));

export default app;