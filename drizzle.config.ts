import dotenv from "dotenv";

import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
    out: "./drizzle",
    schema: "./db/schema.ts",
    dialect: "mysql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
