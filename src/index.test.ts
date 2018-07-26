import PgTestUtil from "pg-test-util";
import { join } from "path";
import generateSeed from "./index";
import tempDir from "temp-dir";
import { readFile, remove, readdir } from "fs-extra";

const NAME = "pg-knex-seeder-test";
const DIR = join(tempDir, NAME);
const SQLFILE = join(__dirname, "__test_supplements__/sql/create-test-db.sql");
const envName = "PG_NON_DEFAULT_STRING";

let pgTestUtil;
let db;
let knex;

async function isEqual(subDir) {
  const dir = join(DIR, subDir);
  const expectedDir = join(__dirname, "./__test_supplements__/expected", subDir);

  const files = await readdir(dir);
  const expectedFiles = await readdir(expectedDir);

  expect(files).toEqual(expectedFiles);

  files.map(async file => {
    const content = await readFile(join(dir, file));
    const expectedContent = await readFile(join(expectedDir, file));
    expect(content.toString()).toBe(expectedContent.toString());
  });
}

beforeAll(async () => {
  pgTestUtil = await new PgTestUtil({ dropOnlyCreated: false }); // Uses connection string from: process.env.PG_TEST_CONNECTION_STRING
  db = await pgTestUtil.createDatabase({ name: NAME, file: SQLFILE });
  knex = db.knex;
});

afterAll(async () => {
  await remove(DIR);
  await pgTestUtil.dropDatabase(NAME);
});

describe("generateSeed", () => {
  it("should create numbered files", async () => {
    await generateSeed({ envName, outDir: join(DIR, "default") });
    await isEqual("default");
  });

  it("should create numbered files only for selected tables", async () => {
    await generateSeed({ envName, outDir: join(DIR, "selected"), tables: ["Color"] });
    await isEqual("selected");
  });

  it("should create numbered files only for selected tables with schema", async () => {
    await generateSeed({ envName, outDir: join(DIR, "selected-with-schema"), tables: ["public.Color"] });
    await isEqual("selected-with-schema");
  });

  it("should create non-numbered files", async () => {
    await generateSeed({ envName, outDir: join(DIR, "non-numbered"), increment: null });
    await isEqual("non-numbered");
  });

  it("should create odd-numbered files", async () => {
    await generateSeed({ envName, outDir: join(DIR, "odd-numbered"), increment: 2 });
    await isEqual("odd-numbered");
  });

  it("should create files including schema name", async () => {
    await generateSeed({ envName, outDir: join(DIR, "schema"), schemaInFilename: true });
    await isEqual("schema");
  });

  it("should throw if environment variable is empty and no connection parameters are provided", async () => {
    expect(generateSeed({ envName: "non-existing-env" })).rejects.toThrow("connection parameter or environment varible");
  });

  it("should throw on error", async () => {
    expect(generateSeed({ connection: { database: "a", user: "xx" } })).rejects.toThrow("password authentication failed for user");
  });

  it("should throw if cannot find a way to connect.", async () => {
    expect(generateSeed()).rejects.toThrow("connection parameter or environment varible");
  });
});
