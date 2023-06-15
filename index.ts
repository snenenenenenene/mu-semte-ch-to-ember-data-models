import fs from "fs";

interface Resource {
  resourceName: string;
  class: string;
  properties: Record<string, string>;
  hasMany: Record<string, string>;
  hasOne: Record<string, string>;
}

function parseLispFile(lispCode: string): Resource[] {
  const resources: Resource[] = [];

  const lines = lispCode.split("\n");
  let currentResource: Resource | null = null;

  console.log(lines[0]);
  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("(define-resource")) {
      if (currentResource) {
        resources.push(currentResource);
      }

      const matches = /[(]define-resource\s+([^\s()]+)/.exec(trimmedLine);
      if (matches) {
        const resourceName = matches[1];
        currentResource = {
          resourceName,
          class: "",
          properties: {},
          hasMany: {},
          hasOne: {},
        };
      } else {
        console.error(`Invalid Lisp format for resource: ${trimmedLine}`);
      }
    } else if (currentResource && trimmedLine.startsWith("(:class")) {
      const matches = /[(]:(\w+)\s+([^\s()]+)/.exec(trimmedLine);
      if (matches) {
        const key = matches[1];
        const value = matches[2];
        currentResource.class = value;
      } else {
        console.error(`Invalid Lisp format for class: ${trimmedLine}`);
      }
    } else if (currentResource && trimmedLine.startsWith("(:")) {
      // use regex to get everything that starts with (: and ends with )
      const matches = /\(:([^)]+)\)/.exec(trimmedLine);
      if (matches) {
        // if the object is (:scope-note :string ,(s-prefix "skos:scopeNote") then the key should be scope-note and the value should be string
        const key = matches[1].split(" ")[0].replace(":", "");
        const value = matches[1].split(" ")[1].replace(":", "");

        const properties = { key: key, value: value };

        if (typeof properties === "object") {
          currentResource.properties = properties;
        } else {
          console.error(`Invalid Lisp format for properties: ${trimmedLine}`);
        }
      } else {
        console.error(`Invalid Lisp format for properties: ${trimmedLine}`);
      }
    } else if (currentResource && trimmedLine.startsWith(":has-many")) {
      const matches = /\(([^)]+)\)/.exec(trimmedLine);
      if (matches) {
        const key = matches[1].split(" ")[0].replace(":", "");
        const value = matches[1].split(" ")[1].replace(":", "");

        const hasMany = { key: key, value: value };
        if (typeof hasMany === "object") {
          currentResource.hasMany = hasMany;
        } else {
          console.error(`Invalid Lisp format for has-many: ${trimmedLine}`);
        }
      } else {
        console.error(`Invalid Lisp format for has-many: ${trimmedLine}`);
      }
    } else if (currentResource && trimmedLine.startsWith(":has-one")) {
      const matches = /\(([^)]+)\)/.exec(trimmedLine);
      if (matches) {
        console.log(matches);
        const key = matches[1].split(" ")[0].replace(":", "");
        const value = matches[1].split(" ")[1].replace(":", "");

        const hasOne = { key: key, value: value };
        if (typeof hasOne === "object") {
          currentResource.hasOne = hasOne;
        } else {
          console.error(`Invalid Lisp format for has-one: ${trimmedLine}`);
        }
      } else {
        console.error(`Invalid Lisp format for has-one: ${trimmedLine}`);
      }
    }
  }

  if (currentResource) {
    resources.push(currentResource);
  }

  return resources;
}

const lispCode = fs.readFileSync("./mandaat-domain-en.lisp", "utf-8");
const resources = parseLispFile(lispCode);
console.log(resources);
