import { spawnSync } from "child_process";
import { join, basename } from "path";
import { remove } from "fs-extra";
import { expectEqualFiles, getRandom, getDb } from "../__test_supplements__/util";
const tempDir = require("temp-dir");

const BIN = basename(__filename).replace(".test", "");
const TEMPDIR = join(tempDir, getRandom());

const envName = "PG_TEST_CONNECTION_STRING_CLI";

let db;
let pgTestUtil;

beforeAll(async () => {
  ({ db, pgTestUtil } = await getDb("pg-knex-seeder-test-cli"));
});

afterAll(async () => {
  await remove(TEMPDIR);
  await pgTestUtil.dropAllDatabases();
});

afterAll(async () => {
  await remove(TEMPDIR);
  await db.drop();
});

describe("CLI", () => {
  it("should generae seed files", async () => {
    const result = spawnSync("ts-node", [join(__dirname, BIN), "--env-name", envName, "--out-dir", join(TEMPDIR, "default")], {
      encoding: "utf-8",
    });
    await expectEqualFiles(TEMPDIR, "default");
  });
});
