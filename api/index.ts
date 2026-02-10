import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { profile } from 'console';

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());

const users = ["John Smith", "Rebecca Wafer", "Phil Hartman"];

interface Account {
  username: string,
  password: string,
  cookie: string,
  class_: Class,
  monsters: Monster[]
}
const accounts: Account[] = [{
  username: "Bob",
  password: "123",
  cookie: "Bob",
  class_: "Scholar",
  monsters: [
    {
      name: "Dust Golem",
      task: "fold the mountain",
      level: 8,
      currentHp: 5,
      maxHp: 10,
    },
    {
      name: "Caffeine Wraith",
      task: "no coffee after 2pm",
      level: "boss",
      currentHp: 1,
      maxHp: 1
    }
  ]
}];

type Class = "Warrior" | "Scholar";
type Level = number | "boss";

interface Monster {
  name: string,
  task: string,
  level: Level,
  currentHp: number,
  maxHp: number
}

interface Profile {
  username: string,
  class_: Class,
  monsters: Monster[]
}

function getProfile(account: Account): Profile {
  return {
    username: account.username,
    class_: account.class_,
    monsters: account.monsters
  };
}

app.get('/', (req, res) => {
  res.send('Hello Express!');
});

app.get('/api/profile', (req, res) => {
  if (req.cookies.account !== undefined) {
    const accountCookie = req.cookies.account;
    const foundAccount = accounts.find(account => account.cookie === accountCookie);
    if (foundAccount) {
      res.json({
        result: "success",
        profile: getProfile(foundAccount)
      });
    } else {
      res.json({ result: "user not found" });
    }
  } else {
    res.json({ result: "not logged in"});
  }
});

app.post('/api/profile', (req, res) => {
  if (req.cookies.account !== undefined) {
    const accountCookie = req.cookies.account;
    const foundAccount = accounts.find(account => account.cookie === accountCookie);
    if (foundAccount !== undefined) {
      if (req.body.class_ !== undefined) {
        if (req.body.class_ === "Warrior" || req.body.class_ === "Scholar") {
          foundAccount.class_ = req.body.class_;
          res.json({ result: "success", profile: getProfile(foundAccount) });
        } else {
          res.json({ result: "invalid class" })
        }
      } else {
        res.json({ result: "success", profile: getProfile(foundAccount) });
      }
    } else {
      res.json({ result: "user not found" });
    }
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
      .cookie("account", foundAccount.cookie, {
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