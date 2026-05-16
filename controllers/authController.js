const bcrypt = require("bcrypt");
const db = require("../config/db");

exports.showSignup = (req, res) => {
  res.render("signup", { title: "Customer Signup" });
};

exports.signup = async (req, res, next) => {
  try {
    const { full_name, email, password, address, mobile_no } = req.body;

    if (!full_name || !email || !password || !address || !mobile_no) {
      req.session.error = "All fields are required.";
      return res.redirect("/signup");
    }

    const [existing] = await db.execute("SELECT customer_id FROM customers WHERE email = ?", [email]);
    if (existing.length > 0) {
      req.session.error = "Email already registered.";
      return res.redirect("/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO customers (full_name, email, password, address, mobile_no) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, address, mobile_no]
    );

    // After signup, directly create a customer session and open dashboard.
    req.session.customer = {
      customer_id: result.insertId,
      full_name,
      email
    };

    req.session.success = "Signup successful. Welcome to your dashboard.";
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Signup error:", err.message);

    // Give beginner-friendly database messages instead of only showing
    // the common "Something went wrong" error page.
    if (err.code === "ER_NO_SUCH_TABLE") {
      req.session.error = "Customers table not found. Please run database/schema.sql in MySQL first.";
      return res.redirect("/signup");
    }

    if (err.code === "ER_BAD_DB_ERROR") {
      req.session.error = "Database 'marks' not found. Please run database/schema.sql in MySQL first.";
      return res.redirect("/signup");
    }

    if (err.code === "ECONNREFUSED") {
      req.session.error = "MySQL is not running. Please start MySQL and try again.";
      return res.redirect("/signup");
    }

    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      req.session.error = "MySQL username or password is wrong. Check config/db.js or .env.";
      return res.redirect("/signup");
    }

    req.session.error = `Signup failed: ${err.message}`;
    res.redirect("/signup");
  }
};

exports.showLogin = (req, res) => {
  res.render("login", { title: "Customer Login" });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.session.error = "Email and password are required.";
      return res.redirect("/login");
    }

    const [customers] = await db.execute("SELECT * FROM customers WHERE email = ?", [email]);
    if (customers.length === 0) {
      req.session.error = "Invalid email or password.";
      return res.redirect("/login");
    }

    const customer = customers[0];
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      req.session.error = "Invalid email or password.";
      return res.redirect("/login");
    }

    req.session.customer = {
      customer_id: customer.customer_id,
      full_name: customer.full_name,
      email: customer.email
    };

    req.session.success = "Login successful.";
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    const customerId = req.session.customer.customer_id;
    const [[vehicleCount]] = await db.execute("SELECT COUNT(*) AS total FROM vehicles WHERE customer_id = ?", [customerId]);
    const [[bookingCount]] = await db.execute("SELECT COUNT(*) AS total FROM bookings WHERE customer_id = ?", [customerId]);
    const [[receiptCount]] = await db.execute("SELECT COUNT(*) AS total FROM receipts WHERE customer_id = ?", [customerId]);

    res.render("customer-dashboard", {
      title: "Customer Dashboard",
      stats: {
        vehicles: vehicleCount.total,
        bookings: bookingCount.total,
        receipts: receiptCount.total
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
