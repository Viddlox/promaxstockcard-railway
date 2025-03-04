import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";

import { prisma } from "./prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const deleteAllData = async (orderedFileNames) => {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  const ordersModel = prisma.orders;
  if (ordersModel) {
    await ordersModel.deleteMany({});
    console.log("Cleared data from Orders");
  }

  for (const modelName of modelNames) {
    const model = prisma[modelName];
    if (model) {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`
      );
    }
  }
};

const main = async () => {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "products.json",
    "inventory.json",
    "users.json",
    "customers.json",
    "orders.json",
  ];

  const orderedFileNamesToSeed = [
    "products.json",
    "inventory.json",
    "users.json",
    "customers.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNamesToSeed) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model = prisma[modelName];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    // Hash passwords for users
    if (modelName === 'users') {
      for (const user of jsonData) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await model.create({
          data: {
            ...user,
            password: hashedPassword
          },
        });
      }
    } else {
      for (const data of jsonData) {
        await model.create({
          data,
        });
      }
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
};

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
