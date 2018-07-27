import PgTestUtil from "pg-test-util";
import { join } from "path";
import { readFile, readdir } from "fs-extra";

export const SQLFILE = join(__dirname, "sql/create-test-db.sql");

export function getRandom(): string {
  return Math.floor(Math.random() * Math.floor(9999)).toString();
}

/**
 * Compares generated files by tests to expected files.
 * @private
 * @async
 * @param   {string} tempDir - Sub directory to create in temp directory.
 * @param   {string} subDir     - Sub directory to get results to compare.
 * @returns {void}
 * @throws  {Error}             - Throws error if expect fails.
 */
export async function expectEqualFiles(tempDir: string, subDir: string) {
  const dir = join(tempDir, subDir);
  const expectedDir = join(__dirname, "./expected", subDir);

  const files = await readdir(dir);
  const expectedFiles = await readdir(expectedDir);

  expect(files).toEqual(expectedFiles);

  files.map(async file => {
    const content = await readFile(join(dir, file));
    const expectedContent = await readFile(join(expectedDir, file));
    expect(content.toString()).toBe(expectedContent.toString());
  });
}

export async function getDb(dbName: string) {
  const pgTestUtil = await new PgTestUtil({ dropOnlyCreated: false }); // Uses connection string from: process.env.PG_TEST_CONNECTION_STRING
  const db = await pgTestUtil.createDatabase({ name: dbName, file: SQLFILE });
  return { db, pgTestUtil };
}
