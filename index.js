require("dotenv").config();
const express = require("express");
const app = express();
const { VERSION_API, NODE_ENV, PORT } = process.env;
const connectDB = require("./config/db.js");
// Middleware
const port = PORT || 4000;

// Routes
connectDB()
  .then(() => {
    app.use(express.json());
    console.log("test");
    app.get(`${VERSION_API}/health-check`, (req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write("<!DOCTYPE html>");
      res.write("<html>");
      res.write("<head>");
      res.write("<title>Health Check</title>");
      res.write("</head>");
      res.write("<body>");
      res.write("<div style='text-align:center';><h1>Health Check</h1>");
      res.write("<p>The server is up and running.</p></div>");
      res.write("</body>");
      res.write("</html>");
      res.end();
    });
    app.use(`${VERSION_API}/auth`, require("./routes/user.js"));
    app.use(`${VERSION_API}/agency`, require("./routes/agency.js"));
    app.use(`${VERSION_API}/client`, require("./routes/client.js"));

    // error handling middleware
    // this should be defined after all routes has been defined so it can catch all error
    app.use((err, req, res, next) => {
      const statusCode = err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(statusCode).json({ error: true, message });
    });
    // Start the server
    app.listen(port, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${port}`
      );
    });
  })
  .catch((error) => {
    // handling Error in mongodb
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });
