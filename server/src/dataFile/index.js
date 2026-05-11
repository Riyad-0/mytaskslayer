import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';
/** @import { User } from "../types" */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, "data.json");

/**
 * @returns {Promise<User[]>}
 */
async function getUsers() {
  return readData();
}

/**
 * @param {User} user
 */
async function addUser(user) {
  const data = await getUsers();
  data.push(user);
  writeData(data);
}

/**
 * @param {User} user
 */
async function updateUser(user) {
  const data = await getUsers();
  const i = data.findIndex(x => x.session.id === user.session.id);
  if (i !== -1) {
    data[i] = user;
    writeData(data);
  }
}

/**
 * @returns {Promise<User[]>}
 */
async function readData() {
  try {
    const result = await fs.readFile(dataFilePath);
    return JSON.parse(result.toString());
  } catch (e) {
    return [];
  }
}

/**
 * @param {User[]} data
 */
async function writeData(data) {
  fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

const dataFile = {
  getUsers,
  addUser,
  updateUser,
};

export default dataFile;