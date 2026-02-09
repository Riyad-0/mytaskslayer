import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());

const users = ["John Smith", "Rebecca Wafer", "Phil Hartman"];

interface Account {
  username: string,
  password: string
}
const accounts: Account[] = [{
  username: "Bob",
  password: "123"
}];

app.get('/', (req, res) => {
  res.send('Hello Express!');
});

app.get('/api/account', (req, res) => {
  if (req.cookies.account !== undefined) {
    res.json({ result: "success", username: req.cookies.account });
  } else {
    res.json({ result: "not logged in"});
  }
});

app.post('/api/login', (req, res) => {
  const foundAccount = accounts.find(account => 
    req.body.username == account.username
  );
  if (foundAccount == undefined) {
    res.json({ result: "account not found"});
  } else if (foundAccount.password !== req.body.password) {
    res.json({ result: "wrong password" });
  } else {
    res
      .cookie("account", foundAccount.username, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ result: "success" });
    // res.json({ result: "success" })
    //   .cookie("account", foundAccount.username, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "strict",
    //     maxAge: 7 * 24 * 60 * 60 * 1000
    //   })
    //   .redirect("/profile");
  }
});

app.get('/api/users/:id', (req, res) => {
  res.json({ name: users[parseInt(req.params.id)] });
});

app.get('/api/posts/:postId/comments/:commentId', (req, res) => {
  res.json({ postId: req.params.postId, commentId: req.params.commentId });
});

app.listen(port, () => console.log(`api: http://localhost:${port}`));