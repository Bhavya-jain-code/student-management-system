import express from "express";
import cors from "cors";
import pg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { pushAction, popAction } from "./services/undoStack.js";
import { enqueue, dequeue, getQueue } from "./services/queue.js";
// Load environment variables as early as possible
dotenv.config();
console.log("DATABASE_URL =", process.env.DATABASE_URL);

// Initialize Google Gemini only if API key is provided.
// Wrap in an async IIFE and guard against missing/invalid keys so
// the server doesn't crash at startup when the key is absent or wrong.
let ai = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  console.log("✅ Gemini Initialized");
} else {
  console.warn("❌ GEMINI_API_KEY not found");
}

const SECRET = "super_secret_key";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(express.json());

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// DB CONNECT
pool
  .connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => {
    console.error("❌ DB Error:", err.message);
  });
const db = await pool.query("SELECT current_database()");
console.log(db.rows);

const schema = await pool.query("SELECT current_schema()");
console.log(schema.rows);

const tables = await pool.query(`
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public';
`);

console.log(tables.rows);
// ================= LOGIN =================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Management API Running 🚀",
  });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const dbUser = user.rows[0];

    if (!dbUser.password) {
      return res.status(500).json({ message: "Password not set in DB" });
    }

    const isMatch = await bcrypt.compare(password, dbUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: dbUser.id, role: dbUser.role }, SECRET, {
      expiresIn: "1d",
    });

    let studentId = null;
    if (dbUser.role?.toLowerCase() === "student") {
      const studentResult = await pool.query(
        "SELECT id FROM students WHERE user_id = $1",
        [dbUser.id],
      );
      studentId = studentResult.rows[0]?.id ?? null;

      if (!studentId) {
        const fallbackResult = await pool.query(
          "SELECT id FROM students WHERE email = $1 LIMIT 1",
          [dbUser.email],
        );
        studentId = fallbackResult.rows[0]?.id ?? null;
      }
    }

    res.json({
      token,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      },
      student_id: studentId,
    });
  } catch (err) {
    console.error("LOGIN ERROR FULL:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    console.log("REGISTER BODY:", req.body);

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, Email, Password required",
      });
    }

    if ((role || "Student").toLowerCase() === "student" && !phone) {
      return res.status(400).json({
        message: "Phone is required for student registration",
      });
    }

    // Check existing user
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users table
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role || "Student"],
    );

    const user = result.rows[0];

    let studentId = null;
    let studentRow = null;

    // If role is Student, insert into students table
    if ((role || "Student").toLowerCase() === "student") {
      const studentResult = await pool.query(
        `INSERT INTO students
         (user_id, name, email, phone, address, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, name, email, phone, address, status`,
        [user.id, user.name, user.email, phone, address ?? null, "active"],
      );

      studentRow = studentResult.rows[0];
      studentId = studentRow?.id ?? null;
      console.log("Student inserted successfully", studentRow);
    }

    res.status(201).json({
      message: "User registered successfully",
      user,
      student_id: studentId,
      student: studentRow,
    });
  } catch (err) {
    console.error("REGISTER ERROR FULL:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});
// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // {id, role}
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= PROTECTED ROUTE =================
app.get("/dashboard", async (req, res) => {
  try {
    // -------------------------
    // TOTAL COUNTS (NO FILTER)
    // -------------------------
    const students = await pool.query(`
      SELECT COUNT(*) FROM students
    `);

    const courses = await pool.query(`
      SELECT COUNT(*) FROM courses
      WHERE COALESCE(status, 'active') = 'active'
    `);

    const enrollments = await pool.query(`
      SELECT COUNT(*) FROM enrollments
    `);

    // -------------------------
    // COURSE CHART
    // -------------------------
    const courseChart = await pool.query(`
      SELECT
        c.title,
        COUNT(e.id) AS students
      FROM courses c
      LEFT JOIN enrollments e
        ON c.id = e.course_id
      WHERE COALESCE(c.status, 'active') = 'active'
      GROUP BY c.id, c.title
    `);

    // -------------------------
    // ATTENDANCE STATS
    // -------------------------
    const attendance = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'Present') AS present,
        COUNT(*) FILTER (WHERE status = 'Absent') AS absent
      FROM attendance
    `);

    // -------------------------
    // RESPONSE
    // -------------------------
    res.json({
      totalStudents: Number(students.rows[0].count),
      totalCourses: Number(courses.rows[0].count),
      totalEnrollments: Number(enrollments.rows[0].count),

      courseChart: courseChart.rows,

      attendance: {
        present: Number(attendance.rows[0].present || 0),
        absent: Number(attendance.rows[0].absent || 0),
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
/* =========================
   🎓 STUDENTS API (FIXED)
========================= */

// CREATE STUDENT
app.post("/students", async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // 1. Student insert
    const studentResult = await pool.query(
      `INSERT INTO students
       (name, email, phone, address, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [name, email, phone, address],
    );

    const student = studentResult.rows[0];

    // ✅ Stack me Add action save karo
    pushAction({
      type: "ADD",
      student: student,
    });

    // 2. Check user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    // Queue
    enqueue({
      action: "Student Added",
      studentId: student.id,
      name: student.name,
      time: new Date(),
    });

    let userResult = null;

    if (existingUser.rows.length === 0) {
      console.log("INSIDE USER INSERT BLOCK");

      const hashedPassword = await bcrypt.hash("123456", 10);

      userResult = await pool.query(
        `INSERT INTO users
         (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [student.name, student.email, hashedPassword, "Student"],
      );
    }

    console.log("USER CREATED:", userResult?.rows?.[0] ?? null);

    res.status(201).json({
      message: "Student added successfully",
      student,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});
// GET ALL STUDENTS (Pagination + Search + Sort + Active Only)
app.get("/students", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const { search = "", sort = "latest" } = req.query;

    let query = `
      SELECT *
      FROM students
      WHERE status = 'active'
    `;

    const values = [];
    let index = 1;

    // Search
    if (search) {
      query += `
        AND (
          name ILIKE $${index}
          OR email ILIKE $${index}
        )
      `;
      values.push(`%${search}%`);
      index++;
    }

    // Sorting
    if (sort === "name") {
      query += ` ORDER BY name ASC`;
    } else if (sort === "oldest") {
      query += ` ORDER BY id ASC`;
    } else {
      query += ` ORDER BY id DESC`;
    }

    // Pagination
    query += ` LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limit, offset);

    const students = await pool.query(query, values);

    // Total count (pagination ke liye)
    let countQuery = `
      SELECT COUNT(*) AS count
      FROM students
      WHERE status = 'active'
    `;

    const countValues = [];

    if (search) {
      countQuery += `
        AND (
          name ILIKE $1
          OR email ILIKE $1
        )
      `;
      countValues.push(`%${search}%`);
    }

    const count = await pool.query(countQuery, countValues);

    res.json({
      success: true,
      data: students.rows,
      total: Number(count.rows[0].count),
      currentPage: page,
      totalPages: Math.ceil(Number(count.rows[0].count) / limit),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET BY ID
app.get("/students/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students WHERE id=$1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (FIXED SAFE VERSION)
app.put("/students/:id", async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

    // 1. Update se pehle old student data nikalo
    const oldStudent = await pool.query(
      "SELECT * FROM students WHERE id = $1",
      [req.params.id],
    );

    if (oldStudent.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 2. Stack me old data save karo
    pushAction({
      type: "UPDATE",
      student: oldStudent.rows[0],
    });

    // 3. Student update karo
    const result = await pool.query(
      `UPDATE students
       SET name=$1, email=$2, phone=$3, address=$4, status=$5
       WHERE id=$6
       RETURNING *`,
      [
        name ?? null,
        email ?? null,
        phone ?? null,
        address ?? null,
        status ?? "active",
        req.params.id,
      ],
    );
    // ✅ Queue me Update event save karo
    enqueue({
      action: "Student Updated",
      studentId: req.params.id,
      name: oldStudent.rows[0].name,
      time: new Date(),
    });

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// DELETE (Soft Delete only)
app.delete("/students/:id", async (req, res) => {
  try {
    const oldStudent = await pool.query(
      "SELECT * FROM students WHERE id = $1",
      [req.params.id],
    );

    if (oldStudent.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    pushAction({
      type: "DELETE",
      student: oldStudent.rows[0],
    });

    await pool.query("BEGIN");

    await pool.query(
      `UPDATE students
       SET status = 'inactive'
       WHERE id = $1`,
      [req.params.id],
    );

    await pool.query("COMMIT");

    enqueue({
      action: "Student Deleted",
      studentId: req.params.id,
      name: oldStudent.rows[0].name,
      time: new Date(),
    });

    res.json({
      success: true,
      message: "Student marked inactive successfully (soft delete)",
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// UNDO SOFT DELETE
app.put("/students/:id/undo", async (req, res) => {
  try {
    const studentId = req.params.id;

    const existing = await pool.query("SELECT * FROM students WHERE id = $1", [
      studentId,
    ]);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await pool.query(
      `UPDATE students
       SET status = 'active'
       WHERE id = $1`,
      [studentId],
    );

    res.json({
      success: true,
      message: "Student restored successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// HARD DELETE (use only when you want to remove all dependent records too)
app.delete("/students/:id/hard", async (req, res) => {
  try {
    const studentId = req.params.id;

    const oldStudent = await pool.query(
      "SELECT * FROM students WHERE id = $1",
      [studentId],
    );

    if (oldStudent.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await pool.query("BEGIN");

    await pool.query("DELETE FROM payments WHERE student_id = $1", [studentId]);
    await pool.query("DELETE FROM marks WHERE student_id = $1", [studentId]);
    await pool.query("DELETE FROM attendance WHERE student_id = $1", [
      studentId,
    ]);
    await pool.query("DELETE FROM enrollments WHERE student_id = $1", [
      studentId,
    ]);
    await pool.query("DELETE FROM students WHERE id = $1", [studentId]);

    await pool.query("COMMIT");

    res.json({
      success: true,
      message: "Student hard deleted successfully along with dependent records",
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

/* =========================
   📚 COURSES API
========================= */

app.post("/courses", async (req, res) => {
  try {
    const { title, duration, fee, status } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO courses
      (
        title,duration,fee,status)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [title, duration, fee, status],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/courses", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM courses WHERE status != $1",
      ["deleted"], // or "inactive"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/courses/:id", async (req, res) => {
  try {
    const { title, duration, fee, status } = req.body;

    const existing = await pool.query("SELECT * FROM courses WHERE id = $1", [
      req.params.id,
    ]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const current = existing.rows[0];
    const safeTitle =
      typeof title === "string" && title.trim() ? title.trim() : current.title;
    const safeDuration =
      typeof duration === "string" && duration.trim()
        ? duration.trim()
        : current.duration;
    const safeFee =
      fee !== undefined && fee !== null && fee !== "" ? fee : current.fee;
    const normalizedStatus =
      typeof status === "string" && status.trim()
        ? status.trim().toLowerCase()
        : current.status || "active";

    const result = await pool.query(
      `UPDATE courses
       SET title=$1,
           duration=$2,
           fee=$3,
           status=$4
       WHERE id=$5
       RETURNING *`,
      [safeTitle, safeDuration, safeFee, normalizedStatus, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/courses/delete/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE courses SET status=$1 WHERE id=$2 RETURNING *",
      ["deleted", req.params.id],
    );

    res.json({ message: "Course soft deleted", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/courses/restore/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE courses SET status=$1 WHERE id=$2 RETURNING *",
      ["active", req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/courses/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    const existing = await pool.query("SELECT * FROM courses WHERE id = $1", [
      courseId,
    ]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    await pool.query("BEGIN");

    await pool.query(
      `UPDATE courses
       SET status = 'inactive'
       WHERE id = $1`,
      [courseId],
    );

    await pool.query("COMMIT");

    res.json({
      success: true,
      message: "Course marked inactive successfully (soft delete)",
      data: existing.rows[0],
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
});

app.delete("/courses/:id/hard", async (req, res) => {
  try {
    const courseId = req.params.id;

    const existing = await pool.query("SELECT * FROM courses WHERE id = $1", [
      courseId,
    ]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    await pool.query("BEGIN");

    await pool.query("DELETE FROM payments WHERE course_id = $1", [courseId]);
    await pool.query("DELETE FROM marks WHERE course_id = $1", [courseId]);
    await pool.query("DELETE FROM attendance WHERE course_id = $1", [courseId]);
    await pool.query("DELETE FROM enrollments WHERE course_id = $1", [
      courseId,
    ]);
    await pool.query("DELETE FROM courses WHERE id = $1", [courseId]);

    await pool.query("COMMIT");

    res.json({
      success: true,
      message: "Course hard deleted successfully along with dependent records",
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
});

// /* =========================
//    🧑‍🎓 ENROLLMENTS API
// ========================= */

app.post("/EnrollStudent", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      student_id,
      course_id,
      paid_amount,
      payment_mode,
      transaction_id,
      installments,
    } = req.body;

    // Duplicate Check
    const check = await client.query(
      `SELECT * FROM enrollments
       WHERE student_id=$1
       AND course_id=$2`,
      [student_id, course_id],
    );

    if (check.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "Student already enrolled",
      });
    }

    // Course Fee
    const course = await client.query("SELECT fee FROM courses WHERE id=$1", [
      course_id,
    ]);

    if (course.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Course not found",
      });
    }

    const totalFee = Number(course.rows[0].fee);

    // Enrollment
    const enrollment = await client.query(
      `
      INSERT INTO enrollments
      (
        student_id,
        course_id
      )
      VALUES($1,$2)
      RETURNING *
      `,
      [student_id, course_id],
    );

    const enrollmentId = enrollment.rows[0].id;

    // First Payment
    await client.query(
      `
      INSERT INTO payments
      (
        enrollment_id,
        amount,
        payment_date,
        payment_mode,
        transaction_id,
        installment_no,
        status,
        is_deleted
      )
      VALUES
      (
        $1,
        $2,
        CURRENT_DATE,
        $3,
        $4,
        1,
        'paid',
        false
      )
      `,
      [enrollmentId, paid_amount, payment_mode, transaction_id],
    );

    // Remaining Fee
    const remaining = totalFee - Number(paid_amount);

    if (remaining > 0 && Number(installments) > 1) {
      const each = remaining / (Number(installments) - 1);

      for (let i = 2; i <= Number(installments); i++) {
        let due = new Date();

        due.setMonth(due.getMonth() + (i - 1));

        await client.query(
          `
          INSERT INTO installments
          (
            enrollment_id,
            installment_no,
            amount,
            due_date,
            paid_amount,
            status
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            0,
            'Pending'
          )
          `,
          [enrollmentId, i, each, due],
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Enrollment Successful",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  } finally {
    client.release();
  }
});

app.get("/installments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.installment_no,
        i.amount,
        i.paid_amount,
        i.status,
        i.due_date,

        e.id AS enrollment_id,

        s.id AS student_id,
        s.name AS student_name,

        c.title AS course_name

      FROM installments i

      JOIN enrollments e
      ON e.id = i.enrollment_id

      JOIN students s
      ON s.id = e.student_id

      JOIN courses c
      ON c.id = e.course_id

      ORDER BY
      i.status,
      i.due_date;
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/installments/pay", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { installment_id, payment_mode, transaction_id } = req.body;

    const installment = await client.query(
      `
      SELECT *
      FROM installments
      WHERE id=$1
      `,
      [installment_id],
    );

    if (installment.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Installment not found",
      });
    }

    const data = installment.rows[0];

    if (data.status === "Paid") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Already Paid",
      });
    }

    await client.query(
      `
      INSERT INTO payments
      (
        enrollment_id,
        amount,
        payment_date,
        payment_mode,
        transaction_id,
        installment_no,
        status,
        is_deleted
      )
      VALUES
      (
        $1,
        $2,
        CURRENT_DATE,
        $3,
        $4,
        $5,
        'paid',
        false
      )
      `,
      [
        data.enrollment_id,
        data.amount,
        payment_mode,
        transaction_id,
        data.installment_no,
      ],
    );

    await client.query(
      `
      UPDATE installments
      SET
      status='Paid',
      paid_amount=amount
      WHERE id=$1
      `,
      [installment_id],
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Installment Paid Successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  } finally {
    client.release();
  }
});

app.post("/checkout/enroll", async (req, res) => {
  try {
    const { student_id, course_id, amount, payment_date } = req.body;

    const studentId = Number(student_id);
    const courseId = Number(course_id);
    const amountValue = Number(amount);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({ message: "Invalid student" });
    }

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({ message: "Invalid course" });
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const enrollmentResult = await pool.query(
      `INSERT INTO enrollments
       (student_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT ON CONSTRAINT unique_student_course
       DO NOTHING
       RETURNING *`,
      [studentId, courseId],
    );

    if (enrollmentResult.rows.length === 0) {
      return res
        .status(409)
        .json({ message: "Student already enrolled in this course" });
    }

    const enrollmentId = enrollmentResult.rows[0].id;

    await pool.query(
      `INSERT INTO payments (enrollment_id, amount, payment_date, status, is_deleted)
       VALUES ($1, $2, $3, 'paid', false)`,
      [
        enrollmentId,
        amountValue,
        payment_date || new Date().toISOString().split("T")[0],
      ],
    );

    res.status(201).json({
      success: true,
      message: "Enrollment and payment completed successfully",
    });
  } catch (err) {
    console.error("CHECKOUT ENROLL ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/enrollments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.id,
        s.name AS student_name,
        c.title AS course_name,
        e.enrollment_date,
        e.status AS enrollment_status,

        COALESCE(p.status, 'Pending') AS payment_status,
        p.amount,
        p.payment_date

      FROM enrollments e

      JOIN students s
        ON s.id = e.student_id

      JOIN courses c
        ON c.id = e.course_id

      LEFT JOIN LATERAL (
        SELECT
          status,
          amount,
          payment_date
        FROM payments
        WHERE enrollment_id = e.id
          AND is_deleted = false
        ORDER BY payment_date DESC, id DESC
        LIMIT 1
      ) p ON true

      ORDER BY e.id DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET ENROLLMENTS ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.delete("/enrollments/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM enrollments WHERE id = $1 RETURNING *",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Enrollment not found",
      });
    }

    res.json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// JOIN QUERY

// GET STUDENT ENROLLMENTS WITH COURSE ID
app.get("/student/:id/enrollments", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id AS course_id,
        c.title AS course_name,
        c.duration,
        c.fee,
        c.status,
        e.enrollment_date
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = $1
         AND COALESCE(c.status, 'active') = 'active'
       ORDER BY e.enrollment_date DESC`,
      [req.params.id],
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/student-dashboard/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log("Fetching dashboard for studentId:", studentId);

    const [courses, attendance, marks, payment] = await Promise.all([
      // Total Courses
      pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE e.student_id = $1
          AND COALESCE(c.status, 'active') = 'active'
        `,
        [studentId],
      ),

      // Attendance Percentage
      pool.query(
        `
        SELECT
          COALESCE(
            ROUND(
              AVG(
                CASE
                  WHEN LOWER(status) = 'present' THEN 100
                  ELSE 0
                END
              ),
              2
            ),
            0
          ) AS attendance_percent
        FROM attendance
        WHERE student_id = $1
        `,
        [studentId],
      ),

      // Average Marks
      pool.query(
        `
        SELECT
          COALESCE(
            ROUND(
              AVG(
                (marks_obtained::numeric / NULLIF(total_marks,0)) * 100
              ),
              2
            ),
            0
          ) AS avg_marks
        FROM marks
        WHERE student_id = $1
        `,
        [studentId],
      ),

      // Latest Payment Status
      pool.query(
        `
        SELECT p.status
        FROM payments p
        INNER JOIN enrollments e
          ON p.enrollment_id = e.id
        WHERE e.student_id = $1
          AND p.is_deleted = false
        ORDER BY p.payment_date DESC, p.id DESC
        LIMIT 1
        `,
        [studentId],
      ),
    ]);

    const response = {
      myCourses: courses.rows[0]?.count || 0,
      attendance: Number(attendance.rows[0]?.attendance_percent || 0),
      avgMarks: Number(marks.rows[0]?.avg_marks || 0),
      feeStatus: payment.rows.length > 0 ? payment.rows[0].status : "Pending",
    };

    console.log("Student Dashboard Response:", response);

    res.json(response);
  } catch (err) {
    console.error("Student Dashboard Error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});
// =========================
// GET STUDENTS BY COURSE
// =========================

app.get("/courses/:id/students", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.email
      FROM enrollments e
      JOIN students s
        ON s.id = e.student_id
      WHERE e.course_id = $1
      AND s.status='active'
      ORDER BY s.name ASC
      `,
      [req.params.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});
// =========================
// ATTENDANCE API
// =========================
// =========================
// BULK ATTENDANCE
// =========================

app.post("/attendance/bulk", async (req, res) => {
  const client = await pool.connect();

  try {
    const { course_id, attendance_date, records } = req.body;

    await client.query("BEGIN");

    for (const record of records) {
      // Duplicate attendance check
      const already = await client.query(
        `
        SELECT id
        FROM attendance
        WHERE
        student_id=$1
        AND course_id=$2
        AND attendance_date=$3
        `,

        [record.student_id, course_id, attendance_date],
      );

      if (already.rows.length > 0) {
        await client.query(
          `
          UPDATE attendance
          SET status=$1
          WHERE id=$2
          `,

          [record.status, already.rows[0].id],
        );
      } else {
        await client.query(
          `
          INSERT INTO attendance
          (
            student_id,
            course_id,
            attendance_date,
            status
          )
          VALUES
          ($1,$2,$3,$4)
          `,

          [record.student_id, course_id, attendance_date, record.status],
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      success: true,

      message: "Attendance Saved Successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(err);

    res.status(500).json({
      success: false,

      error: err.message,
    });
  } finally {
    client.release();
  }
});

// ADD ATTENDANCE
app.post("/attendance", async (req, res) => {
  try {
    const { student_id, course_id, attendance_date, status } = req.body;

    const result = await pool.query(
      `INSERT INTO attendance
       (student_id, course_id, attendance_date, status)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [student_id, course_id, attendance_date, status],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ATTENDANCE ERROR:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
});
// GET ALL ATTENDANCE
app.get("/student/:id/attendance", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        c.title AS course_name,
        MAX(a.attendance_date) AS attendance_date,
        ROUND(
          AVG(
            CASE
              WHEN LOWER(a.status) = 'present'
              THEN 100
              ELSE 0
            END
          ), 2
        ) AS attendance_percent,
        COUNT(*) FILTER (WHERE LOWER(a.status) = 'present') AS present_count,
        COUNT(*) AS total_days
      FROM attendance a
      JOIN courses c
        ON c.id = a.course_id
      WHERE a.student_id = $1
      GROUP BY c.id, c.title
      ORDER BY c.title
      `,
      [req.params.id],
    );

    const formattedRows = result.rows.map((row) => ({
      ...row,
      attendance_percent: Number(row.attendance_percent || 0),
      present_count: Number(row.present_count || 0),
      total_days: Number(row.total_days || 0),
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/attendance", async (req, res) => {
  const result = await pool.query(`
    SELECT
      a.id,
      s.name AS student_name,
      c.title AS course_name,
      a.attendance_date,
      a.status
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    JOIN courses c ON c.id = a.course_id
    ORDER BY a.id DESC
  `);

  res.json(result.rows);
});
app.get("/attendance/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
          a.student_id,
          a.attendance_date,
          a.status,
          c.title AS course_name
       FROM attendance a
       JOIN courses c ON c.id = a.course_id
       WHERE a.student_id = $1
       ORDER BY a.attendance_date DESC`,
      [studentId],
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/attendance/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE attendance
       SET status=$1
       WHERE id=$2
       RETURNING *`,
      [status, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ATTENDANCE
app.delete("/attendance/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM attendance
      WHERE id=$1
      RETURNING *
      `,
      [req.params.id],
    );

    res.json({
      message: "Attendance deleted",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
// ============================
// BULK ADD MARKS
// ============================

app.post("/marks/bulk", async (req, res) => {
  const client = await pool.connect();

  try {
    const { course_id, records } = req.body;

    await client.query("BEGIN");

    for (const record of records) {
      const percentage =
        Number(record.total_marks) === 0
          ? 0
          : (Number(record.marks_obtained) / Number(record.total_marks)) * 100;

      // Check if marks already exist
      const existing = await client.query(
        `
        SELECT id
        FROM marks
        WHERE
        student_id=$1
        AND course_id=$2
        `,
        [record.student_id, course_id],
      );

      if (existing.rows.length > 0) {
        await client.query(
          `
          UPDATE marks
          SET
          marks_obtained=$1,
          total_marks=$2,
          percentage=$3
          WHERE id=$4
          `,
          [
            record.marks_obtained,
            record.total_marks,
            percentage.toFixed(2),
            existing.rows[0].id,
          ],
        );
      } else {
        await client.query(
          `
          INSERT INTO marks
          (
            student_id,
            course_id,
            marks_obtained,
            total_marks,
            percentage
          )
          VALUES
          ($1,$2,$3,$4,$5)
          `,
          [
            record.student_id,
            course_id,
            record.marks_obtained,
            record.total_marks,
            percentage.toFixed(2),
          ],
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Marks Saved Successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    client.release();
  }
});

app.post("/marks", async (req, res) => {
  try {
    const { student_id, course_id, marks_obtained, total_marks } = req.body;

    // 🔥 CALCULATE PERCENTAGE HERE
    const percentage = (Number(marks_obtained) / Number(total_marks)) * 100;

    const result = await pool.query(
      `INSERT INTO marks 
      (student_id, course_id, marks_obtained, total_marks, percentage)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [student_id, course_id, marks_obtained, total_marks, percentage],
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/student/:id/marks", async (req, res) => {
  try {
    const result = await pool.query(
      `
   SELECT
  m.id,
  c.title AS course_name,
  m.marks_obtained,
  m.total_marks,
  m.created_at,
  ROUND((m.marks_obtained::numeric / m.total_marks) * 100, 2) AS percentage
FROM marks m
JOIN courses c ON m.course_id = c.id
WHERE m.student_id = $1
ORDER BY m.id DESC;
      `,
      [req.params.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/marks", async (req, res) => {
  const result = await pool.query(`
   SELECT
  m.id,
  s.name AS student_name,
  c.title AS course_name,
  m.marks_obtained,
  m.total_marks,
  m.created_at
FROM marks m
JOIN students s ON s.id = m.student_id
JOIN courses c ON c.id = m.course_id
ORDER BY m.id DESC;
  `);

  res.json(result.rows);
});

app.put("/marks/:id", async (req, res) => {
  try {
    const { marks_obtained, total_marks } = req.body;

    const result = await pool.query(
      `UPDATE marks
SET marks_obtained=$1,
    total_marks=$2,
    percentage=$3
WHERE id=$4
       RETURNING *`,
      [marks_obtained, total_marks, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/marks/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM marks WHERE id=$1 RETURNING *",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Marks record not found",
      });
    }

    res.json({
      message: "Marks deleted",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/payments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        e.id AS enrollment_id,
        s.name AS student_name,
        c.title AS course_name,
        c.fee AS course_fee,
        p.amount,
        p.payment_date,
        p.status,

        -- Total paid till this payment
        (
          SELECT COALESCE(SUM(p2.amount), 0)
          FROM payments p2
          WHERE p2.enrollment_id = p.enrollment_id
            AND COALESCE(p2.is_deleted, false) = false
            AND (
              p2.payment_date < p.payment_date
              OR (
                p2.payment_date = p.payment_date
                AND p2.id <= p.id
              )
            )
        ) AS total_paid,

        -- Remaining after this payment
        (
          c.fee -
          (
            SELECT COALESCE(SUM(p2.amount), 0)
            FROM payments p2
            WHERE p2.enrollment_id = p.enrollment_id
              AND COALESCE(p2.is_deleted, false) = false
              AND (
                p2.payment_date < p.payment_date
                OR (
                  p2.payment_date = p.payment_date
                  AND p2.id <= p.id
                )
              )
          )
        ) AS remaining_amount

      FROM payments p
      JOIN enrollments e ON e.id = p.enrollment_id
      JOIN students s ON s.id = e.student_id
      JOIN courses c ON c.id = e.course_id

      WHERE COALESCE(p.is_deleted, false) = false

      ORDER BY p.payment_date DESC, p.id DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// CREATE PAYMENT
app.post("/payments", async (req, res) => {
  try {
    const { enrollment_id, amount, payment_date } = req.body;

    const enrollmentId = Number(enrollment_id);
    const amountValue = Number(amount);

    if (!enrollmentId || amountValue <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    await pool.query(
      `INSERT INTO payments (enrollment_id, amount, payment_date, status, is_deleted)
       VALUES ($1, $2, $3, 'paid', false)`,
      [enrollmentId, amountValue, payment_date],
    );

    res.json({ message: "Payment added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// RESTORE PAYMENT (UNDO)
app.put("/payments/undo/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE payments
       SET is_deleted = false
       WHERE id = $1
       RETURNING *`,
      [req.params.id],
    );

    res.json({
      success: true,
      message: "Payment restored",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SOFT DELETE
app.delete("/payments/:id", async (req, res) => {
  try {
    const paymentId = Number(req.params.id);

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({ error: "Invalid payment id" });
    }

    const result = await pool.query(
      `UPDATE payments
       SET is_deleted = true
       WHERE id = $1 AND COALESCE(is_deleted, false) = false
       RETURNING *`,
      [paymentId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HARD DELETE (optional)
app.delete("/payments/hard/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM payments WHERE id=$1 RETURNING *",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/reports", async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM students");

    const courses = await pool.query("SELECT COUNT(*) FROM courses");

    const enrollments = await pool.query("SELECT COUNT(*) FROM enrollments");

    const attendance = await pool.query("SELECT COUNT(*) FROM attendance");

    const revenue = await pool.query(`
      SELECT COALESCE(SUM(amount),0) AS revenue
      FROM payments
    `);

    // Attendance Analytics
    const present = await pool.query(`
      SELECT COUNT(*) FROM attendance
      WHERE status='Present'
    `);

    const absent = await pool.query(`
      SELECT COUNT(*) FROM attendance
      WHERE status='Absent'
    `);

    // Payment Analytics
    const paymentStats = await pool.query(`
      SELECT
      COALESCE(MAX(amount),0) AS highest_payment,
      COALESCE(AVG(amount),0) AS average_payment
      FROM payments
    `);

    const pending = await pool.query(`
  SELECT 
    COALESCE((
      SELECT SUM(c.fee)
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
    ),0)
    -
    COALESCE((
      SELECT SUM(amount)
      FROM payments
    ),0)
    AS pending
`);

    // Marks Analytics
    const marksStats = await pool.query(`
      SELECT
      ROUND(
        AVG(
          (marks_obtained::decimal / total_marks)*100
        ),2
      ) AS average_percentage,

      ROUND(
        MAX(
          (marks_obtained::decimal / total_marks)*100
        ),2
      ) AS highest_percentage,

      ROUND(
        MIN(
          (marks_obtained::decimal / total_marks)*100
        ),2
      ) AS lowest_percentage
      FROM marks
    `);

    const topper = await pool.query(`
      SELECT s.name
      FROM marks m
      JOIN students s
      ON s.id = m.student_id
      ORDER BY
      (m.marks_obtained::decimal /
      m.total_marks) DESC
      LIMIT 1
    `);

    const passed = await pool.query(`
      SELECT COUNT(*) FROM marks
      WHERE
      (marks_obtained::decimal /
      total_marks)*100 >= 40
    `);

    const failed = await pool.query(`
      SELECT COUNT(*) FROM marks
      WHERE
      (marks_obtained::decimal /
      total_marks)*100 < 40
    `);

    const attendanceRate =
      Number(present.rows[0].count) + Number(absent.rows[0].count) > 0
        ? (
            (Number(present.rows[0].count) /
              (Number(present.rows[0].count) + Number(absent.rows[0].count))) *
            100
          ).toFixed(2)
        : 0;

    res.json({
      totalStudents: students.rows[0].count,

      totalCourses: courses.rows[0].count,

      totalEnrollments: enrollments.rows[0].count,

      totalAttendance: attendance.rows[0].count,

      revenue: revenue.rows[0].revenue,

      topperName: topper.rows[0]?.name || "-",

      averagePercentage: marksStats.rows[0].average_percentage || 0,

      highestPercentage: marksStats.rows[0].highest_percentage || 0,

      lowestPercentage: marksStats.rows[0].lowest_percentage || 0,

      passedStudents: passed.rows[0].count,

      failedStudents: failed.rows[0].count,

      presentCount: present.rows[0].count,

      absentCount: absent.rows[0].count,

      attendanceRate,

      highestPayment: paymentStats.rows[0].highest_payment,

      averagePayment: Number(paymentStats.rows[0].average_payment).toFixed(2),

      pendingPayments: Number(pending.rows[0].pending || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/profile/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students WHERE id=$1", [
      req.params.id,
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/student/:id/payments", async (req, res) => {
  try {
    const result = await pool.query(
      `
  SELECT
    p.id,
    c.title AS course_name,
    p.amount,
    p.payment_date,
    p.status
  FROM payments p
  JOIN enrollments e
    ON p.enrollment_id = e.id
  JOIN courses c
    ON e.course_id = c.id
  WHERE e.student_id = $1
    AND p.is_deleted = false
  ORDER BY p.payment_date DESC, p.id DESC
  `,
      [req.params.id],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/classes", async (req, res) => {
  try {
    const { course_id, title, video_url, description } = req.body;

    const result = await pool.query(
      `INSERT INTO classes (course_id, title, video_url, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [course_id, title, video_url, description],
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/classes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, co.title AS course_name
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      ORDER BY c.id DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/classes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        c.*,
        co.title AS course_name
      FROM classes c
      JOIN courses co
      ON c.course_id = co.id
      WHERE c.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/courses/:id/classes", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM classes WHERE course_id=$1 ORDER BY id ASC`,
      [req.params.id],
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/classes/:id", async (req, res) => {
  try {
    const { course_id, title, video_url, description } = req.body;

    const result = await pool.query(
      `
      UPDATE classes
      SET
        course_id = $1,
        title = $2,
        video_url = $3,
        description = $4
      WHERE id = $5
      RETURNING *
      `,
      [course_id, title, video_url, description, req.params.id],
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.delete("/courses/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query(
    `UPDATE courses 
     SET is_deleted = true 
     WHERE id = $1`,
    [id],
  );

  res.json({ message: "Course deleted successfully" });
});

app.get("/classes/course/:courseId", async (req, res) => {
  const { courseId } = req.params;

  const result = await pool.query(
    "SELECT * FROM classes WHERE course_id = $1",
    [courseId],
  );

  res.json(result.rows);
});

app.get("/student-advisor/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Marks Data
    const marksResult = await pool.query(
      `
      SELECT
      AVG(percentage) as avg_percentage,
      MIN(percentage) as weakest_percentage
      FROM marks
      WHERE student_id = $1
      `,
      [studentId],
    );

    // Attendance Data
    const attendanceResult = await pool.query(
      `
      SELECT
      COUNT(*) as total_classes,
      COUNT(*) FILTER (WHERE status='Present') as present_classes
      FROM attendance
      WHERE student_id = $1
      `,
      [studentId],
    );

    const avgMarks = Number(marksResult.rows[0].avg_percentage || 0);

    const totalClasses = Number(attendanceResult.rows[0].total_classes || 0);

    const presentClasses = Number(
      attendanceResult.rows[0].present_classes || 0,
    );

    const attendance =
      totalClasses === 0
        ? 0
        : Math.round((presentClasses / totalClasses) * 100);

    let riskLevel = "Low";
    let tips = [];

    if (avgMarks < 40 || attendance < 60) {
      riskLevel = "High";

      tips = [
        "Attend all upcoming classes",
        "Practice weak topics daily",
        "Solve previous year questions",
        "Meet your mentor weekly",
      ];
    } else if (avgMarks < 60 || attendance < 75) {
      riskLevel = "Medium";

      tips = [
        "Revise class notes",
        "Take weekly mock tests",
        "Improve attendance",
      ];
    } else {
      tips = [
        "Keep current performance",
        "Participate in advanced projects",
        "Help classmates and revise",
      ];
    }

    res.json({
      success: true,
      avgMarks,
      attendance,
      riskLevel,
      tips,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.post("/advisor-chat", async (req, res) => {
  try {
    const { message, studentId } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: "Gemini AI is not initialized",
      });
    }

    // Average Marks
    const marksResult = await pool.query(
      `
      SELECT COALESCE(ROUND(AVG(percentage),2),0) AS avg_marks
      FROM marks
      WHERE student_id = $1
      `,
      [studentId],
    );

    // Attendance
    const attendanceResult = await pool.query(
      `
      SELECT
        COALESCE(
          ROUND(
            AVG(
              CASE
                WHEN LOWER(status)='present'
                THEN 100
                ELSE 0
              END
            ),2
          ),0
        ) AS attendance
      FROM attendance
      WHERE student_id = $1
      `,
      [studentId],
    );

    // Student Courses
    const coursesResult = await pool.query(
      `
      SELECT c.title
      FROM enrollments e
      JOIN courses c
        ON c.id = e.course_id
      WHERE e.student_id = $1
      `,
      [studentId],
    );

    const avgMarks = Number(marksResult.rows[0].avg_marks);
    const attendance = Number(attendanceResult.rows[0].attendance);

    const courses =
      coursesResult.rows.length > 0
        ? coursesResult.rows.map((c) => c.title).join(", ")
        : "No courses enrolled";

    const prompt = `
You are an AI Study Advisor for a Student Management System.

Student Details:
- Student ID: ${studentId}
- Average Marks: ${avgMarks}%
- Attendance: ${attendance}%
- Enrolled Courses: ${courses}

Rules:
- Reply in simple English.
- Keep answers within 5-6 lines.
- Give personalized advice using the student's marks, attendance and enrolled courses.
- Mention course names whenever relevant.
- If attendance is below 75%, tell the student to improve attendance.
- If marks are below 50%, suggest extra revision and practice.
- If the user asks for their Student ID, reply with the Student ID above.
- If the user asks "Which courses am I enrolled in?", answer using the course list above.
- Never say "I don't have a student ID."

Student Question:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      reply: response.text,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/undo", async (req, res) => {
  try {
    const action = popAction();

    if (!action) {
      return res.json({
        success: false,
        message: "Nothing to undo",
      });
    }

    // Undo Delete -> Active karo
    if (action.type === "DELETE") {
      await pool.query(
        `
        UPDATE students
        SET status = 'active'
        WHERE id = $1
        `,
        [action.student.id],
      );
    }

    // Undo Add -> Inactive karo
    else if (action.type === "ADD") {
      await pool.query(
        `
        UPDATE students
        SET status = 'inactive'
        WHERE id = $1
        `,
        [action.student.id],
      );
    }

    // Undo Update -> Purana data restore karo
    else if (action.type === "UPDATE") {
      const s = action.student;

      await pool.query(
        `
        UPDATE students
        SET
          name = $1,
          email = $2,
          phone = $3,
          address = $4,
          status = $5
        WHERE id = $6
        `,
        [s.name, s.email, s.phone, s.address, s.status, s.id],
      );
    }

    res.json({
      success: true,
      message: "Undo successful",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/queue", (req, res) => {
  res.json(getQueue());
});

app.post("/queue/process", (req, res) => {
  const item = dequeue();

  if (!item) {
    return res.json({
      message: "Queue Empty",
    });
  }

  res.json({
    processed: item,
  });
});

app.patch("/courses/:id/status", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await pool.query(
      "SELECT status FROM courses WHERE id = $1",
      [id],
    );

    if (course.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const currentStatus = String(course.rows[0].status || "inactive")
      .trim()
      .toLowerCase();
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const updated = await pool.query(
      "UPDATE courses SET status = $1 WHERE id = $2 RETURNING *",
      [newStatus, id],
    );

    res.json({
      message: "Status updated",
      status: newStatus,
      data: updated.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Student basic info
    const studentResult = await pool.query(
      `SELECT id, name, email, phone, status
       FROM students
       WHERE id = $1`,
      [id],
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = studentResult.rows[0];

    // 2. Courses separately (IMPORTANT FIX)
    const courseResult = await pool.query(
      `SELECT c.id, c.title
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id
       WHERE e.student_id = $1`,
      [id],
    );

    // 3. Response merge
    res.json({
      success: true,
      data: {
        ...student,

        // real course list
        courses: courseResult.rows,

        // optional UI fields (can later move to DB)
        advisor: "Rahul Sharma",
        attendance: 92,
        avgMarks: 84,
        feeStatus: "Paid",
        completedCourses: courseResult.rows.length,

        activities: [
          { title: "Course Enrolled", date: "2 days ago" },
          { title: "Attendance Updated", date: "Yesterday" },
          { title: "Fee Paid", date: "Today" },
        ],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.put("/students/:id", async (req, res) => {
  const { name, email, phone } = req.body;

  const result = await pool.query(
    `UPDATE students 
     SET name=$1, email=$2, phone=$3 
     WHERE id=$4 
     RETURNING id, name, email, phone`,
    [name, email, phone, req.params.id],
  );

  res.json({
    success: true,
    data: result.rows[0], // 🔥 return updated data
  });
});

app.put("/students/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // 1. GET password from USERS table (NOT students)
    const user = await pool.query(
      `SELECT u.password
       FROM users u
       JOIN students s ON s.user_id = u.id
       WHERE s.id = $1`,
      [id],
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 2. Check old password
    const valid = await bcrypt.compare(oldPassword, user.rows[0].password);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update USERS table (NOT students)
    await pool.query(
      `UPDATE users u
       SET password = $1
       FROM students s
       WHERE s.user_id = u.id AND s.id = $2`,
      [hashedPassword, id],
    );

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.get("/student/:id/courses", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
          e.id AS enrollment_id,
          c.id,
          c.title,
          c.duration,
          c.fee,
          c.status,
          e.enrollment_date,

          COALESCE(p.total_paid, 0) AS amount,

          (c.fee - COALESCE(p.total_paid, 0)) AS remaining_amount,

          COALESCE(p.last_status, 'Pending') AS payment_status,

          p.last_payment_date AS payment_date

      FROM enrollments e

      JOIN courses c
        ON c.id = e.course_id

      LEFT JOIN (
          SELECT
              enrollment_id,
              SUM(amount) AS total_paid,
              MAX(payment_date) AS last_payment_date,
              (
                  ARRAY_AGG(status ORDER BY payment_date DESC, id DESC)
              )[1] AS last_status
          FROM payments
          WHERE is_deleted = false
          GROUP BY enrollment_id
      ) p
      ON p.enrollment_id = e.id

      WHERE
          e.student_id = $1
          AND COALESCE(c.status, 'active') = 'active'
      `,
      [id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* =========================
   🚀 SERVER START
========================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
