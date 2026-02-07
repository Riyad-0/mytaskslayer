import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const users = ["John Smith", "Rebecca Wafer", "Phil Hartman"];

app.get('/', (_req, res) => {
  res.send('Hello Express!');
});

app.get('/api/users/:id', (_req, res) => {
  res.json({ name: users[parseInt(_req.params.id)] });
});

app.get('/api/posts/:postId/comments/:commentId', (_req, res) => {
  res.json({ postId: _req.params.postId, commentId: _req.params.commentId });
});

app.listen(port, () => console.log(`api: http://localhost:${port}`));