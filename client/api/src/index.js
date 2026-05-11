import express from 'express';
// import test from "server";

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/hello', (req, res) => {
  res.send("Hiyy!");
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}/`);
});

export default app;