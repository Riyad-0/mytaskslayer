// src/index.js
import express from "express";

// src/a.js
var a = 50;
var a_default = a;

// src/index.js
var app = express();
var PORT = process.env.PORT || 5e3;
app.get("/api/hello", (req, res) => {
  res.send("Hello! " + a_default);
});
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}/`);
});
var index_default = app;
export {
  index_default as default
};
