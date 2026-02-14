import { app, getUserByCookie } from ".";
import express, { Request, Response } from 'express';
import { getProfile, Profile } from "./profile";
import { Class } from "./types";

export namespace UpdateClass {
  export type ReqBody = {
    class_: Class
  };
  export type ResBody =
    | { result: "success", profile: Profile }
    | { result: "invalid class" | "not logged in" | "session expired" };

  export const path = "/api/class";
}

app.post(UpdateClass.path, async (req, res: Response<UpdateClass.ResBody>) => {
  if (req.cookies.account !== undefined) {
    const accountCookie = req.cookies.account;
    const foundAccount = await getUserByCookie(accountCookie);
    if (foundAccount !== undefined) {
      if (req.body.class_ !== undefined) {
        if (req.body.class_ === "Warrior" || req.body.class_ === "Scholar") {
          foundAccount.class_ = req.body.class_;
          res.json({ result: "success", profile: getProfile(foundAccount) });
        } else {
          res.json({ result: "invalid class" });
        }
      } else {
        res.json({ result: "success", profile: getProfile(foundAccount) });
      }
    } else {
      res.json({ result: "session expired" });
    }
  } else {
    res.json({ result: "not logged in"});
  }
});