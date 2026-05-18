import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import * as Dotenv from "dotenv";
Dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  // type: "mysql",
  // host: "dev.mysql.mfine.int",
  // port: 3306,
  // username: "biologics_app_user",
  // password: "8y7NMf0wupWEXYCrnfE3",
  // database: "biologics",
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, "../**/*.entity{.ts,.js}")],
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
  extra: {
    connectTimeout: 10000, // Increase the connection timeout to 10 seconds
    connectionLimit: 100, // Ensure you are not exceeding the pool limit
    keepAliveInitialDelay: 10000, // Delay keepalive packets to 10 seconds
    reconnect: true, // Enable auto-reconnection
    acquireTimeout: 10000, // Timeout before throwing an error when waiting for a connection
  },
};
