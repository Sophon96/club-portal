import { PrismaClient } from "@prisma/client";

import { singleton } from "./singleton.server";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton("prisma", getPrismaClient);

function getPrismaClient() {
  const client = new PrismaClient();
  // connect eagerly
  client.$connect();

  return client;
}

export { prisma };
