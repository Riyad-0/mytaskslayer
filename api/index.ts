import app from "server";

app.get('/api/hello', (req, res) => {
  res.send("Hello!");
});

export default app;