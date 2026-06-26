import express from "express";
import cors from "cors";
import pg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables as early as possible
dotenv.config();

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
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "studentDB",
  password: "bhavyajain",
  port: 5433,
});

// DB CONNECT
pool
  .connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => {
    console.error("❌ DB Error:", err.message);
  });
// ================= LOGIN =================
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
    const students = await pool.query("SELECT COUNT(*) FROM students");

    const courses = await pool.query("SELECT COUNT(*) FROM courses");

    const enrollments = await pool.query("SELECT COUNT(*) FROM enrollments");

    const courseChart = await pool.query(`
     SELECT
  c.title,
  COUNT(e.id) AS students
FROM courses c
LEFT JOIN enrollments e
ON c.id = e.course_id
GROUP BY c.id, c.title
    `);

    res.json({
      totalStudents: Number(students.rows[0].count),
      totalCourses: Number(courses.rows[0].count),
      totalEnrollments: Number(enrollments.rows[0].count),
      courseChart: courseChart.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
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

    // 2. Check user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

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

// GET ALL
app.get("/students", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const students = await pool.query(
      `
      SELECT *
      FROM students
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    const count = await pool.query("SELECT COUNT(*) FROM students");

    res.json({
      success: true,
      data: students.rows,
      total: Number(count.rows[0].count),
      currentPage: page,
      totalPages: Math.ceil(count.rows[0].count / limit),
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
app.get("/students", async (req, res) => {
  try {
    const { search = "", status = "", sort = "latest" } = req.query;

    let query = `
      SELECT *
      FROM students
      WHERE 1=1
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

    // Filter by status
    if (status) {
      query += ` AND status = $${index}`;
      values.push(status);
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

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// UPDATE (FIXED SAFE VERSION)
app.put("/students/:id", async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

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

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/students/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM students WHERE id=$1 RETURNING *",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: "Student deleted",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
    const result = await pool.query("SELECT * FROM courses");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/courses/:id", async (req, res) => {
  try {
    const { title, duration, fee, status } = req.body;

    const result = await pool.query(
      `UPDATE courses
       SET title=$1,
           duration=$2,
           fee=$3,
           status=$4
       WHERE id=$5
       RETURNING *`,
      [title, duration, fee, status, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/courses/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM courses WHERE id=$1 RETURNING *",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// /* =========================
//    🧑‍🎓 ENROLLMENTS API
// ========================= */

app.post("/EnrollStudent", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { student_id, course_id } = req.body;

    const result = await pool.query(
      `INSERT INTO enrollments
       (student_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT ON CONSTRAINT unique_student_course
       DO NOTHING
       RETURNING *`,
      [student_id, course_id],
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        message: "Student already enrolled in this course",
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ENROLL ERROR:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/enrollments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.id,
        s.name AS student_name,
        c.title AS course_name,
        e.enrollment_date
      FROM enrollments e
      JOIN students s ON s.id = e.student_id
      JOIN courses c ON c.id = e.course_id
      ORDER BY e.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET ENROLLMENTS ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// JOIN QUERY
app.get("/student/:id/courses", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.name, c.title
       FROM students s
       JOIN enrollments e ON s.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       WHERE s.id = $1`,
      [req.params.id],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM enrollments
         WHERE student_id = $1`,
        [studentId],
      ),

      pool.query(
        `SELECT
           COALESCE(
             ROUND(
               AVG(
                 CASE
                   WHEN LOWER(status) = 'present'
                   THEN 100
                   ELSE 0
                 END
               ),2
             ),
           0) AS attendance_percent
         FROM attendance
         WHERE student_id = $1`,
        [studentId],
      ),

      pool.query(
        `SELECT
           COALESCE(
             ROUND(
               AVG(
                 (marks_obtained::numeric / total_marks) * 100
               ),2
             ),
           0) AS avg_marks
         FROM marks
         WHERE student_id = $1`,
        [studentId],
      ),

      pool.query(
        `SELECT status
         FROM payments
         WHERE student_id = $1
         ORDER BY payment_date DESC
         LIMIT 1`,
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
// ATTENDANCE API
// =========================

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

        ROUND(
          AVG(
            CASE
              WHEN LOWER(a.status) = 'present'
              THEN 100
              ELSE 0
            END
          ), 2
        ) AS attendance_percent

      FROM attendance a
      JOIN courses c
        ON c.id = a.course_id

      WHERE a.student_id = $1

      GROUP BY c.title
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
        ROUND(
          (m.marks_obtained::numeric / m.total_marks) * 100,
          2
        ) AS percentage
      FROM marks m
      JOIN courses c
        ON m.course_id = c.id
      WHERE m.student_id = $1
      ORDER BY m.id DESC
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
      m.total_marks
    FROM marks m
    JOIN students s ON s.id = m.student_id
    JOIN courses c ON c.id = m.course_id
    ORDER BY m.id DESC
  `);

  res.json(result.rows);
});

app.put("/marks/:id", async (req, res) => {
  try {
    const { marks_obtained, total_marks } = req.body;

    const result = await pool.query(
      `UPDATE marks
       SET marks_obtained=$1,
           total_marks=$2
       WHERE id=$3
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

app.post("/payments", async (req, res) => {
  try {
    const { student_id, course_id, amount, payment_date, status } = req.body;

    const result = await pool.query(
      `INSERT INTO payments
      (
        student_id,
        course_id,
        amount,
        payment_date,
        status
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [student_id, course_id, amount, payment_date, status],
    );

    res.status(201).json(result.rows[0]);
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
        s.name AS student_name,
        c.title AS course_name,
        p.amount,
        p.payment_date,
        p.status
      FROM payments p
      JOIN students s
        ON p.student_id = s.id
      JOIN courses c
        ON p.course_id = c.id
      ORDER BY p.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.put("/payments/:id", async (req, res) => {
  try {
    const { amount, status } = req.body;

    const result = await pool.query(
      `UPDATE payments
       SET amount=$1,
           status=$2
       WHERE id=$3
       RETURNING *`,
      [amount, status, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/payments/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM payments WHERE id=$1 RETURNING *",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json({
      message: "Payment deleted",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
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

      pendingPayments: 0,
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
      JOIN courses c
        ON p.course_id = c.id
      WHERE p.student_id = $1
      ORDER BY p.payment_date DESC
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
    const { title, video_url, description } = req.body;

    const result = await pool.query(
      `UPDATE classes
       SET title=$1, video_url=$2, description=$3
       WHERE id=$4
       RETURNING *`,
      [title, video_url, description, req.params.id],
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/classes/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM classes WHERE id=$1`, [req.params.id]);

    res.json({ success: true, message: "Class deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
/* =========================
   🚀 SERVER START
========================= */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
