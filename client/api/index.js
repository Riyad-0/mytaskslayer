import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/hello', (req, res) => {
  res.send("Hello!" + " " + a);
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}/`);
});

export default app;