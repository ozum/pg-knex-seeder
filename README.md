<!-- DO NOT EDIT README.md (It will be overridden by README.hbs) -->

# pg-knex-seeder

Generates [Knex seed files](https://knexjs.org/#Seeds-CLI) from a PostgreSQL database using all or selected tables.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Synopsis](#synopsis)
  - [CLI](#cli)
  - [API](#api)
- [API](#api-1)
  - [Functions](#functions)
  - [Typedefs](#typedefs)
  - [generate([envName], [connection], [outDir], [tables], [schemas], [increment], [schemaInFilename]) ⇒ <code>Promise.&lt;void&gt;</code>](#generateenvname-connection-outdir-tables-schemas-increment-schemainfilename-%E2%87%92-codepromiseltvoidgtcode)
  - [DBConnection : <code>Object</code>](#dbconnection--codeobjectcode)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Synopsis

## CLI

```
$ npx pg-knex-seeder --out-dir seeds
$ npx pg-knex-seeder --out-dir seeds --env-name PG_CONNECTION_STRING --tables member,public.products --increment 5
```

## API

```js
import generateSeed from "pg-knex-seeder";

generateSeed({ outDir: `${__dirname}/seeds` })
  .then(() => console.log("Seeds are generated..."))
  .catch(e => console.error(e));

// with some parameters

generateSeed({
  envName: "PG_CONNECTION_STRING", // Or use `connection` parameter
  outDir: process.cwd(),
  tables: ["other_schema.member", "member", "product"],
  increment: 5,
  schemaInFilename: true,
})
  .then(() => console.log("Seeds are generated..."))
  .catch(e => console.error(e));
```

# API

## Functions

<dl>
<dt><a href="#generate">generate([envName], [connection], [outDir], [tables], [schemas], [increment], [schemaInFilename])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Generates knex seed files from PostgreSQL database into given directory.</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DBConnection">DBConnection</a> : <code>Object</code></dt>
<dd><p>PostgreSQL connection options which are passed directly to node-postgres.</p></dd>
</dl>

<a name="generate"></a>

## generate([envName], [connection], [outDir], [tables], [schemas], [increment], [schemaInFilename]) ⇒ <code>Promise.&lt;void&gt;</code>

<p>Generates knex seed files from PostgreSQL database into given directory.</p>

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - <ul>

<li>Void promise</li>
</ul>

| Param              | Type                                                               | Default                                                     | Description                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [envName]          | <code>string</code>                                                | <code>&quot;\&quot;PG_CONNECTION_STRING\&quot;&quot;</code> | <p>Environment varibale name storing db connection string to use connecting to database. (If no <code>connection</code> parameter provided)</p>                                                                       |
| [connection]       | [<code>DBConnection</code>](#DBConnection)                         |                                                             | <p>Parameters to use connecting to database. (Overrides environment varibale)</p>                                                                                                                                     |
| [outDir]           | <code>string</code>                                                | <code>&quot;process.cwd()&quot;</code>                      | <p>Output directory to generate seed files in. (Uses process.cwd() if not provided)</p>                                                                                                                               |
| [tables]           | <code>Array.&lt;string&gt;</code>                                  |                                                             | <p>List of tables to generate seed files. May contain schema name (i.e <code>member</code> or <code>public.member</code>). If none provided all tables are used in given schemas.</p>                                 |
| [schemas]          | <code>Array.&lt;string&gt;</code>                                  | <code>[&quot;public&quot;]</code>                           | <p>List of schemas. All tables in given schemas are used to generate seed files. (If <code>tables</code> parameter is used, <code>schemas</code> parameter is ignored.)</p>                                           |
| [increment]        | <code>number</code> \| <code>null</code> \| <code>undefined</code> | <code>1</code>                                              | <p>To order seed files an incrementing number is prepended to file names. This determines increment steps of numbers. If <code>null</code> or <code>undefined</code> are provided no numbers added to file names.</p> |
| [schemaInFilename] | <code>boolean</code>                                               | <code>false</code>                                          | <p>Whether to append schema name in file names. (i.e. <code>01-public.member.js</code>)</p>                                                                                                                           |

<a name="DBConnection"></a>

## DBConnection : <code>Object</code>

<p>PostgreSQL connection options which are passed directly to node-postgres.</p>

**Kind**: global typedef  
**Properties**

| Name       | Type                                        | Default                            | Description                                    |
| ---------- | ------------------------------------------- | ---------------------------------- | ---------------------------------------------- |
| database   | <code>string</code>                         |                                    | <p>Database name</p>                           |
| [host]     | <code>string</code>                         | <code>&quot;localhost&quot;</code> | <p>Hostname of the database.</p>               |
| [port]     | <code>number</code>                         | <code>5432</code>                  | <p>Port of the database.</p>                   |
| [user]     | <code>string</code>                         |                                    | <p>Username for connecting to db.</p>          |
| [password] | <code>string</code>                         |                                    | <p>Password to connecting to db.</p>           |
| [ssl]      | <code>boolean</code> \| <code>Object</code> | <code>false</code>                 | <p>Pass the same options as tls.connect().</p> |
