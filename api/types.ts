export type User = RegisteredUser | Guest;

export type RegisteredUser = Account;

export interface Account {
  username: string,
  password: string,
  sessionId: string,
  class_: Class,
  monsters: Monster[]
}

export interface Guest {
  sessionId: string,
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

function isRegistered(user: User): user is RegisteredUser {
  return "username" in user;
}

export function getAccount(user: User): Account | null {
  if (isRegistered(user)) {
    return user;
  } else {
    return null;
  }
}

export function displayName(user: User): string {
  return isRegistered(user) ? user.username : ("Guest" + user.sessionId);
}