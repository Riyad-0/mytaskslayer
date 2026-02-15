import { app, getUserByCookie } from ".";
import express, { Request, RequestHandler, Response } from 'express';
import { getProfile, Profile } from "./profile";
import { Class } from "./types";
import z from "zod";
import { classSchema } from "./zodSchemas";

export type ReqBody = {
  class_: Class
};
export type ResBody =
  | { result: "success", profile: Profile }
  | { result: "invalid class" | "not logged in" | "session expired" };

export const path = "/api/class";

const reqBodySchema = z.object({ class_: classSchema });

function validateRequestBody(body: any): body is ReqBody {
  return true;
}

app.post(path, async (req, res: Response<ResBody>) => {
  const validate = reqBodySchema.safeParse(req.body);
  if (!validate.success) {
    res.json()
  } else {
    const body = validate.data;
  }
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