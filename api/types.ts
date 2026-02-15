import z from "zod";

export type User = Account | Guest;

export interface Account {
  username: string,
  password: string,
  cookie: string,
  class_: Class,
  monsters: Monster[]
}

export interface Guest {
  cookie: string,
  class_: Class,
  monsters: Monster[]
}

export type Class = "Warrior" | "Scholar";


export interface Monster {
  name: string,
  task: string,
  level: Level,
  currentHp: number,
  maxHp: number
}

export type Level = number | "boss";

export function hasAccount(user: User): user is Account {
  return "username" in user && "password" in user;
}

export function displayName(user: User): string {
  return hasAccount(user) ? user.username : ("Guest" + user.cookie);
}