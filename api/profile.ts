import { Class, displayName, Monster, User } from "./types";

export interface Profile {
  // TODO: rename to displayName
  username: string,
  class_: Class,
  monsters: Monster[]
}

export function getProfile(user: User): Profile {
  return {
    username: displayName(user),
    class_: user.class_,
    monsters: user.monsters
  };
}