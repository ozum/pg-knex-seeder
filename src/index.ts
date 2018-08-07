/* eslint-disable no-restricted-syntax */

import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import knex from "knex";
import * as prettier from "prettier";
const pgStructure = require("pg-structure");
const parse = require("pg-connection-string").parse;

dotenv.config();

/**
 * PostgreSQL connection options which are passed directly to node-postgres.
 * @typedef {Object} DBConnection
 * @property {string}           database            - Database name
 * @property {string}           [host=localhost]    - Hostname of the database.
 * @property {number}           [port=5432]         - Port of the database.
 * @property {string}           [user]              - Username for connecting to db.
 * @property {string}           [password]          - Password to connecting to db.
 * @property {boolean|Object}   [ssl=false]         - Pass the same options as tls.connect().
 */
interface DBConnection {
  database: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  ssl?: boolean;
}

/**
 * Returns file contents to seed table with given data.
 * @private
 * @param   {string} tableName  - Name of the table
 * @param   {Object} data       - Data fetched from database.
 * @returns {string}            - Content to write in file.
 */
function template(tableName: string, data: Object): string {
  return `
    /* eslint-disable no-use-before-define */

    exports.seed = function seed(knex) {
      return knex("${tableName}")
        .del()
        .then(() =>
          knex("${tableName}").insert(getData()));
    }

    function getData() {
      return ${JSON.stringify(data, null, 2)};
    }
  `;
}

/**
 * Returns file contents to disable/enable all table triggers.
 * @param   {string[]}        tables  - List of table names.
 * @param   {ENABLE|DISABLE}  status  - Whether to enable or disable triggers.
 * @returns {string}                  - Content to write file.
 */
function triggerTemplate(tables: string[], status: string): string {
  const sql = tables.map(name => `knex.raw("ALTER TABLE ?? ${status} TRIGGER ALL;", [${JSON.stringify(name)}])\n`);

  return `
    /* eslint-disable no-use-before-define */

    exports.seed = function seed(knex) {
      return Promise.all([
        ${sql}
      ]);
    }
  `;
}

/**
 * Returns table names as an array.
 * @async
 * @private
 * @param   {DBConnection}  connection  - Database connection details.
 * @param   {string[]}      schemas     - List of schema names to get table names from.
 * @param   {string[]}      tables      - List of table names if table names are manually given.
 * @returns {string[]}                  - List of table names.
 */
async function getTables(connection: DBConnection, schemas: string[], tables?: string[]): Promise<string[]> {
  if (tables) {
    return tables.map(table => (table.includes(".") ? table : `public.${table}`));
  }

  const db = await pgStructure(connection, schemas);

  let allTables: string[] = [];

  await Promise.all(
    schemas.map(async schema => {
      const schemaTables: Map<string, { fullName: string; name: string }> = await db.schemas.get(schema).tables;
      allTables = allTables.concat(
        Array.from(schemaTables.values())
          .filter(table => !table.name.startsWith("knex_migrations"))
          .map(table => table.fullName),
      );
    }),
  );

  return allTables;
}

/**
 * Returns next counter number as a string for given index and array. Adds zero padding left of the number. If no numbering is
 * used, returns undefined
 * @private
 * @param   {number}            index     - Returns
 * @param   {string[]}          tables    - Array of table names
 * @param   {number|null}       increment - Increment steps.
 * @returns {string|undefined}            - If numbering is used, next counter number as a string and zero padded at the beginning, undefined otherwise.
 */
function getCounter(index: number, tables: string[], increment?: number | null): string | undefined {
  if (!increment) {
    return undefined;
  }
  const maxLength = (tables.length * increment + 1).toString().length;
  return (index * increment + 1).toString().padStart(maxLength, "0");
}

/**
 * Writes file for given table.
 * @async
 * @private
 * @param   {knex}              pg                - Knex object
 * @param   {string}            table             - Table name to fetch data from and write seed file.
 * @param   {string}            dir               - Output directory to write file.
 * @param   {boolean}           schemaInFileName  - Whether to use schema names in file names.
 * @param   {prettier.Options}  prettierOptions   - Prettier options
 * @param   {string}            counter           - Counter number to add at the beginning of file name.
 * @returns {Promise<void>}                       - Void
 */
async function writeDataFile(
  pg: knex,
  table: string,
  dir: string,
  schemaInFileName: boolean,
  prettierOptions: prettier.Options,
  counter?: string,
): Promise<void> {
  const tableWithoutSchema = table.split(".")[1];
  const result = await pg.raw(`SELECT array_to_json(array_agg(??), FALSE) AS "jsonDump" FROM ??`, [tableWithoutSchema, table]);
  const json = result.rows[0].jsonDump;
  const file = path.join(dir, `${counter ? `${counter}-` : ""}${schemaInFileName ? table : tableWithoutSchema}.js`);
  await fs.remove(file);

  return json ? fs.writeFile(file, prettier.format(template(table, json), prettierOptions)) : undefined;
}

/**
 * Writes enable/disable trigger files.
 * @param   {string}            dir               - Output directory to write file.
 * @param   {string[]}          tableNames        - List of table names.
 * @param   {prettier.Options}  prettierOptions   - Prettier options
 * @param   {string}            increment         - Increment steps for file numbering.
 * @returns {Promise<void>}                       - Void

 */
async function writeTriggerFile(
  dir: string,
  tableNames: string[],
  prettierOptions: prettier.Options,
  increment?: number | null,
): Promise<void> {
  const firstCounter = getCounter(-1, tableNames, increment);
  const lastCounter = getCounter(tableNames.length, tableNames, increment);

  const enableFile = path.join(dir, `${firstCounter ? `0-` : "aa_"}disable-triggers.js`);
  await fs.remove(enableFile);
  await fs.writeFile(enableFile, prettier.format(triggerTemplate(tableNames, "DISABLE"), prettierOptions));

  const disableFile = path.join(dir, `${lastCounter ? `${lastCounter}-` : "zz_"}enable-triggers.js`);
  await fs.remove(disableFile);
  await fs.writeFile(disableFile, prettier.format(triggerTemplate(tableNames, "ENABLE"), prettierOptions));
}

/**
 * Generates knex seed files from PostgreSQL database into given directory.
 * @async
 * @param   {string}                [envName="PG_CONNECTION_STRING"]  - Environment varibale name storing db connection string to use connecting to database. (If no `connection` parameter provided)
 * @param   {DBConnection}          [connection]                      - Parameters to use connecting to database. (Overrides environment varibale)
 * @param   {string}                [outDir=process.cwd()]            - Output directory to generate seed files in.  (Uses process.cwd() if not provided)
 * @param   {string[]}              [tables]                          - List of tables to generate seed files. May contain schema name (i.e `member` or `public.member`). If none provided all tables are used in given schemas.
 * @param   {string[]}              [schemas=["public"]]              - List of schemas. All tables in given schemas are used to generate seed files. (If `tables` parameter is used, `schemas` parameter is ignored.)
 * @param   {number|null|undefined} [increment=1]                     - To order seed files an incrementing number is prepended to file names. This determines increment steps of numbers. If `null` or `undefined` are provided no numbers added to file names.
 * @param   {boolean}               [schemaInFilename=false]          - Whether to append schema name in file names. (i.e. `01-public.member.js`)
 * @param   {boolean}               [disableTriggers=true]            - Disable triggers when seeding. (Prevents foreign key collisions.)
 * @returns {Promise<void>}                                           - Void promise
 */
export default async function generate({
  envName = "PG_CONNECTION_STRING",
  connection,
  outDir = process.cwd(),
  tables,
  schemas = ["public"],
  increment = 1,
  schemaInFilename = false,
  disableTriggers = true,
}: {
  envName?: string;
  connection?: DBConnection;
  outDir?: string;
  tables?: string[];
  schemas?: string[];
  increment?: number | null;
  schemaInFilename?: boolean;
  disableTriggers?: boolean;
} = {}): Promise<void> {
  let pg: any;
  if (!connection && !process.env[envName]) {
    throw new Error(
      "connection parameter or environment varible which stores valid connection string (default: PG_CONNECTION_STRING) is required.",
    );
  }

  try {
    pg = knex({
      connection: connection || process.env[envName],
      client: "pg",
      debug: false,
    });

    const allTables = await getTables(connection || parse(process.env[envName]), schemas, tables);
    await fs.mkdirp(outDir);
    const prettierOptions = Object.assign(await prettier.resolveConfig(process.cwd(), { editorconfig: true }), { parser: "babylon" });
    await Promise.all(
      allTables.map((table, index, arr) =>
        writeDataFile(pg, table, outDir, schemaInFilename, prettierOptions, getCounter(index, arr, increment)),
      ),
    );

    if (disableTriggers) {
      await writeTriggerFile(outDir, allTables, prettierOptions, increment);
    }
  } catch (e) {
    pg.destroy();
    throw new Error(e);
  }
  pg.destroy();
}
