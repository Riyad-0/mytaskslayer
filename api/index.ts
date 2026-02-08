import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

const users = ["John Smith", "Rebecca Wafer", "Phil Hartman"];

app.get('/', (req, res) => {
  res.send('Hello Express!');
});

app.post('/api/login', (req, res) => {
  res.json({ message: `Logged in`, body: req.body });
});

app.get('/api/users/:id', (req, res) => {
  res.json({ name: users[parseInt(req.params.id)] });
});

app.get('/api/posts/:postId/comments/:commentId', (req, res) => {
  res.json({ postId: req.params.postId, commentId: req.params.commentId });
});

app.listen(port, () => console.log(`api: http://localhost:${port}`));