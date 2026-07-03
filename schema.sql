-- Create USERS table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'Student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create STUDENTS table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create COURSES table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(100),
    fee DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ENROLLMENTS table
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    CONSTRAINT unique_student_course UNIQUE (student_id, course_id)
);

-- Create PAYMENTS table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_mode VARCHAR(50),
    transaction_id VARCHAR(255),
    installment_no INT,
    status VARCHAR(50) DEFAULT 'pending',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create INSTALLMENTS table
CREATE TABLE IF NOT EXISTS installments (
    id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
    installment_no INT,
    amount DECIMAL(10, 2),
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ATTENDANCE table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (
        student_id,
        course_id,
        attendance_date
    )
);

-- Create MARKS table
CREATE TABLE IF NOT EXISTS marks (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    marks_obtained DECIMAL(10, 2),
    total_marks DECIMAL(10, 2),
    percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, course_id)
);

-- Create CLASSES table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    class_number INT,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);

CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments (student_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments (course_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance (student_id);

CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks (student_id);

CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id ON payments (enrollment_id);