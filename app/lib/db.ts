import {PrismaClient} from "@prisma/client";
const prismaPrototype = require('@prisma/client');

const prisma = new PrismaClient();

prismaPrototype.Decimal.prototype.toJSON = function() {
  return this.toNumber();
}

export default prisma;
