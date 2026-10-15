"use strict";
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const dotenv = require("dotenv");
if (!process.env.CLIENT_CONFIG_HASH) throw new Error("Missing client config hash");
const config = dotenv.parse(fs.readFileSync("/tmp/client.env"));
for (const key of Object.keys(config))
  if (!key.startsWith("REACT_APP_")) throw new Error("Server variable in frontend build config");
Object.assign(process.env, config, { GENERATE_SOURCEMAP: "false" });
execFileSync("npm", ["run", "build"], { stdio: "inherit", env: process.env });
