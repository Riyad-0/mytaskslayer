import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3000

const users = ["John Smith", "Rebecca Wafer", "Phil Hartman"];

// Vercel requires the static files to be in this 'public' dir.
// app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (_req, res) => {
  res.send('Hello Express!')
})

app.get('/api/users/:id', (_req, res) => {
  res.json({ name: users[parseInt(_req.params.id)] })
})

app.get('/api/posts/:postId/comments/:commentId', (_req, res) => {
  res.json({ postId: _req.params.postId, commentId: _req.params.commentId })
})

// Send all unhandled paths to the static files; they will be handled with
// client-side routing.
// Only needed in dev build when serving static files from express instead of
// running the frontend dev server.
app.get('*splat', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

// // Only needed in dev build.
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

export default app