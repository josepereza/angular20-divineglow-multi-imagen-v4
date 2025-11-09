require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});
// Ruta
app.get('/prueba', (req, res) => {
  res.send('¡Hola Mundo!');
});// Ruta
app.post('/send-report', async (req, res) => {
  const { to, subject, text } = req.body;
   console.log(req.body)

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Faltan campos: to, subject, text' });
  }

  try {
    await transporter.sendMail({
      from: `"Formulario Presupuesto" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text
    });
    res.json({ message: 'Correo enviado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar correo' });
  }
});

// Arranca
app.listen(PORT, () => console.log(`Servidor mail en http://localhost:${PORT}`));