import express, { CookieOptions, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { profile } from 'console';
import { Account, Class, displayName, getAccount, Guest, Monster, User } from './types';
import dataFile from './data';
import { getProfile, Profile } from './profile';

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(express.json());
app.use(cookieParser());

const users = ["John Smith", "Rebecca Wafer", "Phil Hartman"];

const oldAccounts: Account[] = [{
  username: "Bob",
  password: "123",
  sessionId: "Bob",
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

dataFile.getUsers().then(users => {
  if (users.length === 0) {
    dataFile.addUser(oldAccounts[0]);
  }
});

export async function getUserByCookie(cookie: string): Promise<User | undefined> {
  return (await dataFile.getUsers()).find(user => user.sessionId === cookie);
}

export async function getAccountByUsername(username: string): Promise<Account | undefined> {
  for (const user of (await dataFile.getUsers())) {
    const account = getAccount(user);
    if (account !== null && account.username === username) {
      return account;
    }
  }
  return undefined;
}

async function generateGuest(): Promise<Guest> {
  const cookie = await generateSessionId();
  return {
    sessionId: cookie,
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
  }
}

async function generateSessionId(): Promise<string> {
  while (true) {
    const generatedCookie = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
    const isCookieInUse = (await dataFile.getUsers()).some(user =>
      user.sessionId === generatedCookie
    );
    if (!isCookieInUse) {
      return generatedCookie;
    }
  }
}

const userCookieName = "user";
const userCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

app.get('/', (req, res) => {
  res.send('Hello Express!');
});

app.get('/api/profile', async (req, res) => {
  if (req.cookies.user !== undefined) {
    const userCookie = req.cookies.user;
    const foundAccount = await getUserByCookie(userCookie);
    if (foundAccount) {
      res.json({
        result: "success",
        profile: getProfile(foundAccount)
      });
    } else {
      res.json({ result: "session expired" });
    }
  } else {
    const guest = await generateGuest();
    await dataFile.addUser(guest);
    res
      .cookie(userCookieName, guest.sessionId, userCookieOptions)
      .json({ result: "success", profile: getProfile(guest)});
    // res.json({ result: "not logged in" });
  }
});

export namespace UpdateClass {
  export type ReqBody = {
    class_: Class
  };
  export type ResBody =
    | { result: "success", profile: Profile }
    | { result: "invalid class" | "not logged in" | "session expired" };
}

function isClass(class_: any): class_ is Class {
  return class_ === "Scholar" || class_ === "Warrior";
}

app.post("/api/class", async (req, res: Response<UpdateClass.ResBody>) => {
  const class_ = req.body.class_;
  if (!isClass(class_)) {
    res.json({ result: "invalid class" });
    return;
  }
  if (req.cookies.user !== undefined) {
    const userCookie = req.cookies.user;
    const foundUser = await getUserByCookie(userCookie);
    if (foundUser !== undefined) {
      // if (req.body.class_ !== undefined) {
        // if (req.body.class_ === "Warrior" || req.body.class_ === "Scholar") {
          foundUser.class_ = class_;
          res.json({ result: "success", profile: getProfile(foundUser) });
        // } else {
        //   res.json({ result: "invalid class" });
        // }
      // } else {
      //   res.json({ result: "success", profile: getProfile(foundUser) });
      // }
    } else {
      res.json({ result: "session expired" });
    }
  } else {
    const guest = await generateGuest();
    guest.class_ = class_;
    await dataFile.addUser(guest);
    res
      .cookie(userCookieName, guest.sessionId, userCookieOptions)
      .json({ result: "success", profile: getProfile(guest) });
  }
});

app.post('/api/login', async (req, res) => {
  const foundAccount = await getAccountByUsername(req.body.username)
  if (foundAccount === undefined) {
    res.json({ result: "account not found"});
  } else if (foundAccount.password !== req.body.password) {
    res.json({ result: "wrong password" });
  } else {
    res
      .cookie(userCookieName, foundAccount.sessionId, userCookieOptions)
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

app.post('/api/register', async (req, res) => {
  const foundAccount = await getAccountByUsername(req.body.username)
  if (foundAccount !== undefined) {
    res.json({ result: "username taken"});
  } else {
    const accountCookie = await generateSessionId();
    await dataFile.addUser({
      username: req.body.username,
      password: req.body.password,
      sessionId: accountCookie,
      class_: "Scholar",
      monsters: []
    });
    res
      .cookie(userCookieName, accountCookie, userCookieOptions)
      .json({ result: "success" });
  }
});

app.get('/api/users/:id', (req, res) => {
  res.json({ name: users[parseInt(req.params.id)] });
});

app.get('/api/posts/:postId/comments/:commentId', (req, res) => {
  res.json({ postId: req.params.postId, commentId: req.params.commentId });
});

app.listen(port, () => console.log(`api: http://localhost:${port}`));