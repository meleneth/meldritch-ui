import { readFileSync } from "node:fs";

const lock = JSON.parse(
  readFileSync(new URL("../contracts.lock", import.meta.url)),
);
const generated = readFileSync(
  new URL("../src/generated/protocol.ts", import.meta.url),
  "utf8",
);
const version = generated.match(/WEB_PROTOCOL_VERSION = "([^"]+)"/)?.[1];
const schema = Number(
  generated.match(/WIRE_SCHEMA_VERSION = ([0-9]+)/)?.[1] ?? NaN,
);

if (version !== lock.web_protocol || schema !== 3) {
  throw new Error(
    `generated Web contract ${version}/schema ${schema} does not match contracts.lock`,
  );
}
if (
  !/Source: web\/schemas\/protocol\.schema\.json sha256:[a-f0-9]{64}/.test(
    generated,
  )
) {
  throw new Error("generated Web contract has no authoritative source digest");
}
console.log(
  `Web contract ${version}, schema ${schema}, revision ${lock.revision}`,
);
