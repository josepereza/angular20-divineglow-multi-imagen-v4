import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { CartService } from '../../services/cart';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedidoService';
import { EmailService } from '../../services/email.service';
import { tap } from 'rxjs';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-payment',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  cardholderName: string = '';

  // Inyección de dependencias
  cartService = inject(CartService);
  pedidoService = inject(PedidoService);
  private paymentService = inject(PaymentService);
  private emailService=inject(EmailService)
  private router = inject(Router);

  // Referencia al div donde se montará el elemento de Stripe
  @ViewChild('cardElement') cardElementRef!: ElementRef;

  // Variables de estado de Stripe
  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;

  // Signals para gestionar el estado de la UI
  isLoading = signal(false);
  cardError = signal<string | null>(null);

  async ngOnInit() {
    // Carga la librería de Stripe.js de forma asíncrona
    this.stripe = await loadStripe(
      'pk_test_51KwttKJhfdXMP2PM1eyZwmyTnW37LyaYzXB4xe0Hn13Y1NHPNUj4FVlVg4NoGLym1SO38P5WJrM0UbgWbMKScooI0000eFuVzO'
    ); // <--- ¡PON TU CLAVE pk_test_... AQUÍ!

    if (this.stripe) {
      this.setupStripeElement();
    }
  }

  private setupStripeElement() {
    const elements = this.stripe!.elements();
    // Estilos para el campo de la tarjeta
    const style = {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    };

    // Crea y monta el elemento de tarjeta
    this.cardElement = elements.create('card', {
      style: style,
      hidePostalCode: true, // Esta es la línea mágica
    });
    this.cardElement.mount(this.cardElementRef.nativeElement);

    // Escucha los errores de validación de la tarjeta en tiempo real
    this.cardElement.on('change', (event) => {
      this.cardError.set(event.error ? event.error.message : null);
    });
  }

  async handleSubmit() {
    console.log('handleSubmit iniciado...');
    
    // --- 1. VALIDACIONES INICIALES ---
    const customer = this.cartService.customerInfo();
    if (!customer) {
        alert("Error: Faltan datos del cliente. Redirigiendo al checkout.");
        this.router.navigate(['/checkout']);
        return;
    }
    if (this.isLoading() || !this.stripe || !this.cardElement || !this.cardholderName) {
      this.cardError.set('Por favor, completa todos los campos.');
      return;
    }
    this.isLoading.set(true);

    // --- 2. PROCESO CON STRIPE ---
    const { error, paymentMethod } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: { name: this.cardholderName },
    });

    if (error) {
      this.cardError.set(error.message || 'Error al validar la tarjeta.');
      this.isLoading.set(false);
      return;
    }
    
    // --- 3. SECUENCIA DE LLAMADAS AL BACKEND CON RXJS ---
    const amount = this.cartService.totalPrice();
    const cartItems = this.cartService.cartItems();

    this.paymentService.processPayment(paymentMethod!.id, amount).pipe(
      // tap es un operador que nos permite "espiar" el flujo sin modificarlo
      tap(paymentResponse => console.log('Paso 1: Pago procesado con éxito', paymentResponse)),
      
      // switchMap encadena la siguiente llamada. Si esta falla, todo el flujo se detiene
      switchMap(() => {
        console.log('Paso 2: Creando pedido en la base de datos...');
        // Asumo que tu pedidoService necesita los datos del cliente y del carrito
        const pedidoPayload = {
            customerInfo: customer,
            cartItems: cartItems
        };
        return this.pedidoService.createPedido(this.pedidoService.orderSignal()); // Usa el payload correcto
      }),
      
      tap(pedidoResponse => console.log('Paso 3: Pedido creado con éxito', pedidoResponse)),

      // switchMap para la última llamada: enviar los correos
      switchMap(() => {
        console.log('Paso 4: Solicitando envío de correos...');
        const emailPayload = {
          customerInfo: customer,
          cartItems: cartItems,
          totalPrice: amount
        };
        return this.emailService.sendConfirmationEmail(emailPayload);
      }),
      
      tap(emailResponse => console.log('Paso 5: Solicitud de correo enviada', emailResponse))

    ).subscribe({
      next: () => {
        // --- ÉXITO TOTAL: Se ejecuta solo si TODAS las llamadas anteriores tuvieron éxito ---
        console.log('¡Proceso de compra completado con éxito!');
        alert('¡Pago y pedido realizados con éxito! Recibirás un correo de confirmación.');
        
        this.cartService.clearCart();
        this.router.navigate(['/']);
      },
      error: (err) => {
        // --- MANEJO DE ERRORES: Se ejecuta si CUALQUIERA de las llamadas falla ---
        console.error('Ha ocurrido un error en el proceso de compra:', err);
        this.cardError.set(err.error?.message || 'No se pudo completar el proceso de compra.');
        this.isLoading.set(false); // Reactivamos el botón para que pueda intentarlo de nuevo
      }
    });
  }
}
