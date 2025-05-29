const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'employee-management-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database connection
const createDatabaseAndTables = async () => {
  try {
    // First create a connection without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS employee_management');

    // Close the initial connection
    await connection.end();

    // Now create the pool with the database specified
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'employee_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Drop tables if they exist to ensure a clean state
    // We need to drop them in the correct order due to foreign key constraints
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('DROP TABLE IF EXISTS salaries');
    await pool.query('DROP TABLE IF EXISTS employees');
    await pool.query('DROP TABLE IF EXISTS departments');
    await pool.query('DROP TABLE IF EXISTS users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create tables manually in the correct order to ensure dependencies are met
    try {
      // Create users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create departments table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS departments (
          department_code VARCHAR(10) PRIMARY KEY,
          department_name VARCHAR(100) NOT NULL,
          gross_salary DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create employees table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS employees (
          employee_number VARCHAR(20) PRIMARY KEY,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          position VARCHAR(100) NOT NULL,
          address TEXT,
          telephone VARCHAR(20),
          gender ENUM('Male', 'Female', 'Other'),
          hired_date DATE NOT NULL,
          department_code VARCHAR(10) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (department_code) REFERENCES departments(department_code)
        )
      `);

      // Create salaries table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS salaries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employee_number VARCHAR(20) NOT NULL,
          gross_salary DECIMAL(10, 2) NOT NULL,
          total_deduction DECIMAL(10, 2) NOT NULL,
          net_salary DECIMAL(10, 2) NOT NULL,
          month DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_number) REFERENCES employees(employee_number) ON DELETE CASCADE
        )
      `);

      // Check if we need to insert sample data
      const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
      if (userCount[0].count === 0) {
        // Insert default admin user
        await pool.query(`
          INSERT INTO users (username, password, first_name, last_name, email)
          VALUES ('admin', '$2b$10$mLEI4smzk0YQPfNx7KA5UOlHu.77V0VG/W9RqQmPBJA0KQNu4W5Hy', 'Admin', 'User', 'admin@example.com')
        `);

        // Insert sample departments
        await pool.query(`
          INSERT INTO departments (department_code, department_name, gross_salary)
          VALUES
          ('ENG', 'Engineering', 75000.00),
          ('HR', 'Human Resources', 65000.00),
          ('FIN', 'Finance', 70000.00),
          ('MKT', 'Marketing', 60000.00)
        `);

        // Insert sample employees
        await pool.query(`
          INSERT INTO employees (employee_number, first_name, last_name, position, address, telephone, gender, hired_date, department_code)
          VALUES
          ('EMP001', 'John', 'Doe', 'Software Engineer', '123 Main St, Anytown, USA', '555-123-4567', 'Male', '2022-01-15', 'ENG'),
          ('EMP002', 'Jane', 'Smith', 'HR Manager', '456 Oak Ave, Somewhere, USA', '555-987-6543', 'Female', '2021-05-20', 'HR'),
          ('EMP003', 'Michael', 'Johnson', 'Accountant', '789 Pine Rd, Nowhere, USA', '555-456-7890', 'Male', '2022-03-10', 'FIN')
        `);

        // Insert sample salaries
        await pool.query(`
          INSERT INTO salaries (employee_number, gross_salary, total_deduction, net_salary, month)
          VALUES
          ('EMP001', 75000.00, 15000.00, 60000.00, '2023-01-01'),
          ('EMP002', 65000.00, 13000.00, 52000.00, '2023-01-01'),
          ('EMP003', 70000.00, 14000.00, 56000.00, '2023-01-01'),
          ('EMP001', 75000.00, 15000.00, 60000.00, '2023-02-01'),
          ('EMP002', 65000.00, 13000.00, 52000.00, '2023-02-01'),
          ('EMP003', 70000.00, 14000.00, 56000.00, '2023-02-01')
        `);
      }

      console.log('Database and tables created successfully');
    } catch (error) {
      console.error('Error setting up database tables:', error);
      throw error;
    }

    return pool;
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

// Initialize the pool
let pool;
(async () => {
  try {
    pool = await createDatabaseAndTables();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Routes

// Helper function to ensure pool is initialized
const ensurePool = async (_req, res, next) => {
  if (!pool) {
    return res.status(503).json({ message: 'Database is initializing, please try again in a moment' });
  }
  next();
};

// Apply the middleware to all routes
app.use(ensurePool);

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;

    // Validate input
    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username or email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, password, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, firstName, lastName, email]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, first_name, last_name, email FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    res.json({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Department routes

// Get all departments
app.get('/api/departments', isAuthenticated, async (_req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments ORDER BY department_name');
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department by code
app.get('/api/departments/:code', isAuthenticated, async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments WHERE department_code = ?', [req.params.code]);

    if (departments.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(departments[0]);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create department
app.post('/api/departments', isAuthenticated, async (req, res) => {
  try {
    const { departmentCode, departmentName, grossSalary } = req.body;

    // Validate input
    if (!departmentCode || !departmentName || !grossSalary) {
      return res.status(400).json({ message: 'Department code, name, and gross salary are required' });
    }

    // Check if department code already exists
    const [existingDepartments] = await pool.query('SELECT * FROM departments WHERE department_code = ?', [departmentCode]);

    if (existingDepartments.length > 0) {
      return res.status(400).json({ message: 'Department code already exists' });
    }

    // Insert department
    await pool.query(
      'INSERT INTO departments (department_code, department_name, gross_salary) VALUES (?, ?, ?)',
      [departmentCode, departmentName, grossSalary]
    );

    res.status(201).json({ message: 'Department created successfully' });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update department
app.put('/api/departments/:code', isAuthenticated, async (req, res) => {
  try {
    const { departmentName, grossSalary } = req.body;

    // Validate input
    if (!departmentName || !grossSalary) {
      return res.status(400).json({ message: 'Department name and gross salary are required' });
    }

    // Update department
    await pool.query(
      'UPDATE departments SET department_name = ?, gross_salary = ? WHERE department_code = ?',
      [departmentName, grossSalary, req.params.code]
    );

    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete department
app.delete('/api/departments/:code', isAuthenticated, async (req, res) => {
  try {
    // Check if department is being used by employees
    const [employees] = await pool.query('SELECT COUNT(*) as count FROM employees WHERE department_code = ?', [req.params.code]);

    if (employees[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete department that has employees assigned to it' });
    }

    // Delete department
    await pool.query('DELETE FROM departments WHERE department_code = ?', [req.params.code]);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee routes

// Get all employees
app.get('/api/employees', isAuthenticated, async (_req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT e.*, d.department_name
      FROM employees e
      JOIN departments d ON e.department_code = d.department_code
      ORDER BY e.last_name, e.first_name
    `);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee by number
app.get('/api/employees/:number', isAuthenticated, async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT e.*, d.department_name
      FROM employees e
      JOIN departments d ON e.department_code = d.department_code
      WHERE e.employee_number = ?
    `, [req.params.number]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create employee
app.post('/api/employees', isAuthenticated, async (req, res) => {
  try {
    const { employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode } = req.body;

    // Validate input
    if (!employeeNumber || !firstName || !lastName || !position || !hiredDate || !departmentCode) {
      return res.status(400).json({ message: 'Employee number, first name, last name, position, hired date, and department code are required' });
    }

    // Check if employee number already exists
    const [existingEmployees] = await pool.query('SELECT * FROM employees WHERE employee_number = ?', [employeeNumber]);

    if (existingEmployees.length > 0) {
      return res.status(400).json({ message: 'Employee number already exists' });
    }

    // Check if department exists
    const [departments] = await pool.query('SELECT * FROM departments WHERE department_code = ?', [departmentCode]);

    if (departments.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Insert employee
    await pool.query(
      'INSERT INTO employees (employee_number, first_name, last_name, position, address, telephone, gender, hired_date, department_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode]
    );

    res.status(201).json({ message: 'Employee created successfully' });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee
app.put('/api/employees/:number', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode } = req.body;

    // Validate input
    if (!firstName || !lastName || !position || !hiredDate || !departmentCode) {
      return res.status(400).json({ message: 'First name, last name, position, hired date, and department code are required' });
    }

    // Check if department exists
    const [departments] = await pool.query('SELECT * FROM departments WHERE department_code = ?', [departmentCode]);

    if (departments.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Update employee
    await pool.query(
      'UPDATE employees SET first_name = ?, last_name = ?, position = ?, address = ?, telephone = ?, gender = ?, hired_date = ?, department_code = ? WHERE employee_number = ?',
      [firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode, req.params.number]
    );

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
app.delete('/api/employees/:number', isAuthenticated, async (req, res) => {
  try {
    // Delete employee (cascade will delete related salaries)
    await pool.query('DELETE FROM employees WHERE employee_number = ?', [req.params.number]);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Salary routes

// Get all salaries
app.get('/api/salaries', isAuthenticated, async (_req, res) => {
  try {
    const [salaries] = await pool.query(`
      SELECT s.*, e.first_name, e.last_name, e.position, d.department_name
      FROM salaries s
      JOIN employees e ON s.employee_number = e.employee_number
      JOIN departments d ON e.department_code = d.department_code
      ORDER BY s.month DESC, e.last_name, e.first_name
    `);

    res.json(salaries);
  } catch (error) {
    console.error('Get salaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get salaries by employee number
app.get('/api/employees/:number/salaries', isAuthenticated, async (req, res) => {
  try {
    const [salaries] = await pool.query(
      'SELECT * FROM salaries WHERE employee_number = ? ORDER BY month DESC',
      [req.params.number]
    );

    res.json(salaries);
  } catch (error) {
    console.error('Get employee salaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create salary
app.post('/api/salaries', isAuthenticated, async (req, res) => {
  try {
    const { employeeNumber, grossSalary, totalDeduction, netSalary, month } = req.body;

    // Validate input
    if (!employeeNumber || !grossSalary || !totalDeduction || !netSalary || !month) {
      return res.status(400).json({ message: 'Employee number, gross salary, total deduction, net salary, and month are required' });
    }

    // Check if employee exists
    const [employees] = await pool.query('SELECT * FROM employees WHERE employee_number = ?', [employeeNumber]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if salary for this employee and month already exists
    const [existingSalaries] = await pool.query(
      'SELECT * FROM salaries WHERE employee_number = ? AND month = ?',
      [employeeNumber, month]
    );

    if (existingSalaries.length > 0) {
      return res.status(400).json({ message: 'Salary for this employee and month already exists' });
    }

    // Insert salary
    const [result] = await pool.query(
      'INSERT INTO salaries (employee_number, gross_salary, total_deduction, net_salary, month) VALUES (?, ?, ?, ?, ?)',
      [employeeNumber, grossSalary, totalDeduction, netSalary, month]
    );

    res.status(201).json({ message: 'Salary created successfully', salaryId: result.insertId });
  } catch (error) {
    console.error('Create salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update salary
app.put('/api/salaries/:id', isAuthenticated, async (req, res) => {
  try {
    const { grossSalary, totalDeduction, netSalary, month } = req.body;

    // Validate input
    if (!grossSalary || !totalDeduction || !netSalary || !month) {
      return res.status(400).json({ message: 'Gross salary, total deduction, net salary, and month are required' });
    }

    // Update salary
    await pool.query(
      'UPDATE salaries SET gross_salary = ?, total_deduction = ?, net_salary = ?, month = ? WHERE id = ?',
      [grossSalary, totalDeduction, netSalary, month, req.params.id]
    );

    res.json({ message: 'Salary updated successfully' });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete salary
app.delete('/api/salaries/:id', isAuthenticated, async (req, res) => {
  try {
    await pool.query('DELETE FROM salaries WHERE id = ?', [req.params.id]);

    res.json({ message: 'Salary deleted successfully' });
  } catch (error) {
    console.error('Delete salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reports

// Get monthly payroll report
app.get('/api/reports/monthly-payroll', isAuthenticated, async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (YYYY-MM-DD format)' });
    }

    const [report] = await pool.query(`
      SELECT
        e.first_name,
        e.last_name,
        e.position,
        d.department_name,
        s.net_salary
      FROM salaries s
      JOIN employees e ON s.employee_number = e.employee_number
      JOIN departments d ON e.department_code = d.department_code
      WHERE DATE_FORMAT(s.month, '%Y-%m-01') = DATE_FORMAT(?, '%Y-%m-01')
      ORDER BY d.department_name, e.last_name, e.first_name
    `, [month]);

    res.json(report);
  } catch (error) {
    console.error('Monthly payroll report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department summary
app.get('/api/reports/departments', isAuthenticated, async (_req, res) => {
  try {
    const [departments] = await pool.query(`
      SELECT
        d.department_code,
        d.department_name,
        COUNT(e.employee_number) as employee_count,
        d.gross_salary as base_salary,
        AVG(s.gross_salary) as average_gross_salary,
        AVG(s.total_deduction) as average_deduction,
        AVG(s.net_salary) as average_net_salary
      FROM departments d
      LEFT JOIN employees e ON d.department_code = e.department_code
      LEFT JOIN (
        SELECT employee_number, gross_salary, total_deduction, net_salary
        FROM salaries s1
        WHERE (employee_number, month) IN (
          SELECT employee_number, MAX(month)
          FROM salaries
          GROUP BY employee_number
        )
      ) s ON e.employee_number = s.employee_number
      GROUP BY d.department_code, d.department_name, d.gross_salary
      ORDER BY d.department_name
    `);

    res.json(departments);
  } catch (error) {
    console.error('Department report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});