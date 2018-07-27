#!/usr/bin/env node

import pickBy from "lodash.pickBy";
import generate from "../index";
const yargsInteractive = require("yargs-interactive");

const options: { [name: string]: any } = {
  "env-name": {
    type: "input",
    name: "envName",
    default: "PG_CONNECTION_STRING",
    describe:
      "Environment varibale name storing db connection string to use connecting to database. (If no `connection` parameter provided)",
  },
  "out-dir": {
    type: "input",
    name: "outDir",
    describe: "Output directory to generate seed files in. (Uses process.cwd() if not provided)",
  },
  tables: {
    type: "input",
    describe:
      "List of tables (seperated by comma) to generate seed files. May contain schema name (i.e `member` or `public.member`). If none provided all tables are used in given schemas.",
  },
  schemas: {
    type: "input",
    default: "public",
    describe:
      "List of schemas. All tables in given schemas are used to generate seed files. (If `tables` parameter is used, `schemas` parameter is ignored.)",
  },
  increment: {
    type: "input",
    default: 1,
    describe:
      "To order seed files an incrementing number is prepended to file names. This determines increment steps of numbers. If `null` or `undefined` are provided no numbers added to file names",
  },
  schemaInFilename: {
    type: "confirm",
    default: false,
    describe: "Whether to append schema name in file names. (i.e. `01-public.member.js`)",
  },
};

const validKeys = new Set(Object.keys(options).map(key => options[key].name || key));

yargsInteractive()
  .usage("$0 <command> [args]")
  .interactive(options)
  .then(async (result: any) => {
    result.schemas = result.schemas ? result.schemas.split(",") : undefined;
    result.tables = result.tables ? result.tables.split(",") : undefined;

    const parameters = pickBy(result, (value, key) => validKeys.has(key) && value !== undefined);

    console.log(parameters);
    await generate(parameters);
    return parameters;
  })
  .then((parameters: { [name: string]: any }) => console.log(`Knex seed files are created in ${parameters.outDir}`))
  .catch((e: Error) => console.error(e));
