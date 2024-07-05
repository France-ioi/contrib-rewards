import {PrismaClient} from "@prisma/client";
import {Decimal} from "@prisma/client/runtime/binary";
import config from "@/app/lib/config";

const prismaClientSingleton = () => {
  return new PrismaClient()
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (config.nodeEnv !== 'production') globalThis.prismaGlobal = prisma

export default prisma;


// recursive function looping deeply through an object to find Decimals
export function transformDecimalsToNumbers(obj: any) {
  if (!obj) {
    return
  }

  for (const key of Object.keys(obj)) {
    if (Decimal.isDecimal(obj[key])) {
      obj[key] = obj[key].toNumber()
    } else if (typeof obj[key] === 'object') {
      transformDecimalsToNumbers(obj[key])
    }
  }
}
