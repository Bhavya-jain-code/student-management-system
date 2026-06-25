const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "studentDB",
  password: "bhavyajain",
  port: 5433,
});

(async () => {
  try {
    const res = await pool.query(
      "SELECT id, name, email, role, password FROM users ORDER BY id DESC LIMIT 20",
    );
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
