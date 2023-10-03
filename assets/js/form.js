const express = require('express');
const app = express();
const nodemailer = require('nodemailer');

app.use(express.json());

app.post('/send-email', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Konfigurasi transport Nodemailer
  const transporter = nodemailer.createTransport({
    // Konfigurasi SMTP atau layanan email yang sesuai
    // ...
  });

  // Konten email
  const emailContent = {
    from: email,
    to: '', // Ganti dengan alamat email penerima yang sesuai
    subject: subject,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  // Mengirim email
  transporter.sendMail(emailContent, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to send email.' });
    } else {
      console.log('Email sent:', info.response);
      res.json({ message: 'Email sent successfully.' });
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
