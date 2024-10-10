import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const redisClient = new Redis({
  port: parseInt(process.env.REDIS_REST_PORT as string),
  host: process.env.REDIS_REST_URL,
  username: "default",
  password: process.env.REDIS_REST_TOKEN,
  tls: {
    rejectUnauthorized: false,
  }
});
