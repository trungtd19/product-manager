import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: "postgresql://bdsnhalam_user:XiIp989ryzR26ptogNgMNQeavyooFyXc@dpg-d0hmhqbe5dus73b680lg-a.singapore-postgres.render.com/bdsnhalam",
  ssl: {
    rejectUnauthorized: false, // bắt buộc khi dùng Render DB
  },
});