const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Contact = require("./models/Contact");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Nodemailer (Brevo SMTP Setup)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ POST /api/contact — Save to DB & Send Emails
app.post("/api/contact", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    console.log("✅ Contact saved:", req.body);

    // Email to You
    const adminMail = {
      from: `"CodeCrafted Portfolio" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "📬 New Contact Form Submission",
      html: `
        <h2>New Contact Details</h2>
        <ul>
          <li><strong>Name:</strong> ${req.body.name}</li>
          <li><strong>Email:</strong> ${req.body.email}</li>
          <li><strong>Phone:</strong> ${req.body.phone}</li>
          <li><strong>Company:</strong> ${req.body.company}</li>
          <li><strong>Project Type:</strong> ${req.body.projectType}</li>
          <li><strong>Timeline:</strong> ${req.body.timeline}</li>
          <li><strong>Comments:</strong> ${req.body.comments}</li>
        </ul>
      `,
    };

    // Auto-Reply to User
    const clientMail = {
      from: `"CodeCrafted Portfolio" <${process.env.EMAIL_USER}>`,
      to: req.body.email,
      subject: "🎉 We've received your message!",
      html: `
        <h3>Hi ${req.body.name},</h3>
        <p>Thank you for contacting me. I’ve received your message and will get back to you shortly.</p>
        <p><em>- Vinesh Kumar Reddy</em></p>
      `,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(clientMail);

    console.log("📧 Emails sent: to Admin and User");
    res.status(200).json({ message: "Contact saved and emails sent!" });
  } catch (error) {
  console.error("❌ Full Submission Error:", error);
  res.status(500).json({ error: error.message });
}

});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
