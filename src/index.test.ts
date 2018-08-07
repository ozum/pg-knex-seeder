import { join } from "path";
import generateSeed from "./index";
import { remove } from "fs-extra";
import { expectEqualFiles, getRandom, getDb } from "./__test_supplements__/util";
const tempDir = require("temp-dir");

const TEMPDIR = join(tempDir, getRandom());

const envName = "PG_TEST_CONNECTION_STRING_API";

let db;
let pgTestUtil;

beforeAll(async () => {
  ({ db, pgTestUtil } = await getDb("pg-knex-seeder-test-api"));
});

afterAll(async () => {
  await remove(TEMPDIR);
  await pgTestUtil.dropAllDatabases();
});

describe("generateSeed", () => {
  it("should create numbered files", async () => {
    await generateSeed({ envName, outDir: join(TEMPDIR, "default") });
    await expectEqualFiles(TEMPDIR, "default");
  });

  it("should create numbered files only for selected tables", async () => {
    await generateSeed({ envName, outDir: join(TEMPDIR, "selected"), tables: ["Color"] });
    await expectEqualFiles(TEMPDIR, "selected");
  });

  it("should create numbered files only for selected tables with schema", async () => {
    await generateSeed({ envName, outDir: join(TEMPDIR, "selected-with-schema"), tables: ["public.Color"] });
    await expectEqualFiles(TEMPDIR, "selected-with-schema");
  });

  it("should create non-numbered files", async () => {
    await generateSeed({ envName, outDir: join(TEMPDIR, "non-numbered"), increment: null });
    await expectEqualFiles(TEMPDIR, "non-numbered");
  });

  it("should create odd-numbered files", async () => {
    await generateSeed({ envName, outDir: join(TEMPDIR, "odd-numbered"), increment: 2 });
    await expectEqualFiles(TEMPDIR, "odd-numbered");
  });

  it("should create files including schema name", async () => {
    await generateSeed({ envName, outDir: join(TEMPDIR, "schema"), schemaInFilename: true });
    await expectEqualFiles(TEMPDIR, "schema");
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

  it("should create without disabled triggers", async () => {
    await generateSeed({ envName, outDir: join(TEMPDIR, "without-disable-triggers"), disableTriggers: false });
    await expectEqualFiles(TEMPDIR, "without-disable-triggers");
  });
});
