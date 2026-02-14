import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';
import { Account, hasAccount, User } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, "data.json");

async function getUsers(): Promise<User[]> {
  return readData();
}

async function addUser(user: User) {
  const data = await getUsers();
  data.push(user);
  writeData(data);
}

async function readData(): Promise<User[]> {
  try {
    const result = await fs.readFile(dataFilePath);
    return JSON.parse(result.toString());
  } catch (e) {
    return [];
  }
}

async function writeData(data: User[]) {
  fs.writeFile(dataFilePath, JSON.stringify(data));
}

const dataFile = {
  getUsers,
  addUser
};

export default dataFile;