import express from 'express'

const app = express()
const port = 3000

const users = ["John Smith", "Rebecca Wafer", "Phil Hartman"];

app.use(express.static('../web/dist'))

app.get('/', (_req, res) => {
  res.send('Hello Express!')
})

app.get('/api/users/:id', (_req, res) => {
  res.json({ name: users[parseInt(_req.params.id)] })
})

app.get('/api/posts/:postId/comments/:commentId', (_req, res) => {
  res.json({ postId: _req.params.postId, commentId: _req.params.commentId })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

export default app