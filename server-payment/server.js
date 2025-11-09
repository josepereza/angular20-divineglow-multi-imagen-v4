require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

// ¡AQUÍ VA TU CLAVE SECRETA! Cárgala desde variables de entorno en un proyecto real.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // <--- ¡PON TU CLAVE sk_test_... AQUÍ!
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
// Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});
app.post('/create-payment', async (req, res) => {
  // Recibimos los mismos datos de siempre
  const { paymentMethodId, amount } = req.body;

  try {
    // --- ¡AQUÍ ESTÁ LA NUEVA LÓGICA! ---
    // 1. Obtenemos los detalles del PaymentMethod usando su ID
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // 2. Extraemos el nombre del cliente de forma segura desde los billing_details
    const customerName = paymentMethod.billing_details.name;

    // 3. Ahora creamos el PaymentIntent como antes
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'chf',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });
    
    // 4. Mostramos el nombre en la consola para confirmar
    console.log(`¡Pago exitoso de ${customerName || 'Cliente Anónimo'} por ${paymentIntent.amount / 100} ${paymentIntent.currency}!`);

    res.status(200).json({ success: true, paymentIntentId: paymentIntent.id });

  } catch (error) {
    console.error("Error de Stripe:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Ruta
app.post('/send-confirmacion', async (req, res) => {
  // 1. Recibimos un payload más completo desde el frontend
  const { customerInfo, cartItems, totalPrice } = req.body;
  console.log('mensaje del server',customerInfo)
  // Validación robusta
  if (!customerInfo || !cartItems || !totalPrice) {
    return res.status(400).json({ error: 'Faltan datos del pedido: customerInfo, cartItems, totalPrice' });
  }

  // 2. Construimos el correo para el CLIENTE
  const customerSubject = 'Bestätigung für Ihre Bestellung bei divineglow';
  const customerText = `
    Hallo ${customerInfo.fullName},

    vielen Dank für Ihre Bestellung bei divineglow!

    Wir haben Ihre Zahlung in Höhe von ${totalPrice.toFixed(2)} CHF erfolgreich erhalten.
    Ihre Bestellung wird in Kürze an folgende Adresse versendet:
    ${customerInfo.street}, ${customerInfo.postalCode} ${customerInfo.city}

    Mit freundlichen Grüssen,
    Ihr divineglow Team
  `;

  // 3. Construimos el correo para el ADMINISTRADOR (para ti)
  const adminSubject = `🎉 Neuer Auftrag! - #${Math.floor(Math.random() * 10000)}`; // Un ID de pedido simple
  const adminText = `
    Sie haben einen neuen Auftrag erhalten!

    Kundendetails:
    - Name: ${customerInfo.fullName}
    - Email: ${customerInfo.email}
    - Adresse: ${customerInfo.street}, ${customerInfo.postalCode} ${customerInfo.city}

    Bestellte Artikel:
    ${cartItems.map(item => 
      `- ${item.name} (ID: ${item.id}) | Menge: 1 | Preis: ${(item.price * 1).toFixed(2)} CHF`
    ).join('\n')}

    Gesamtsumme: ${totalPrice.toFixed(2)} CHF
  `;

  try {
    // 4. Creamos las dos promesas de envío de correo
    const sendToCustomer = transporter.sendMail({
      from: `"divineglow" <${process.env.GMAIL_USER}>`,
      to: customerInfo.email,
      subject: customerSubject,
      text: customerText
    });

    const sendToAdmin = transporter.sendMail({
      from: `"Benachrichtigung" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // <-- Usamos la variable de entorno
      subject: adminSubject,
      text: adminText
    });
    
    // 5. Las enviamos en paralelo y esperamos a que ambas terminen
    await Promise.all([sendToCustomer, sendToAdmin]);

    res.json({ message: 'Correos de confirmación enviados correctamente' });

  } catch (err) {
    console.error('Error al enviar uno o más correos:', err);
    // Aunque falle el correo del admin, es importante que el del cliente se intente enviar
    // por lo que no devolvemos un error al frontend a menos que ambos fallen catastróficamente.
    res.status(500).json({ error: 'Error interno al procesar los correos' });
  }
});

app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));