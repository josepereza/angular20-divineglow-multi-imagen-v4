import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // <-- Importa isPlatformBrowser

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Importamos los modelos que necesitamos

import { CustomerInfo } from './cart';
import { LineaPedido } from '../interfaces/pedido';
import { Product } from '../interfaces/product';
import { of } from 'rxjs';

// Creamos una interfaz para el payload por claridad
export interface ConfirmationPayload {
  customerInfo: CustomerInfo;
  cartItems: Product[];
  totalPrice: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private platformId = inject(PLATFORM_ID);

  private http = inject(HttpClient);
  // private backendUrl = 'http://divineglow.ch:3002';
  private backendUrl = '/api2';

  // El método ahora acepta el payload completo
  sendConfirmationEmail(payload: ConfirmationPayload): Observable<any> {
    console.log('email.service', payload);

    if (isPlatformBrowser(this.platformId)) {
      // 2. Si es un navegador, hacemos la llamada a la API como siempre.
      console.log('Ejecutando en el NAVEGADOR: Haciendo llamada a la API...');
      return this.http.post(`${this.backendUrl}/send-confirmacion`, payload);
    } else {
      // 3. Si NO es un navegador (es decir, es el servidor durante la build),
      //    NO hacemos la llamada a la API. En su lugar, devolvemos un
      //    Observable vacío o con datos por defecto.
      console.log('Ejecutando en el SERVIDOR (build): Omitiendo llamada a la API.');
      return of([]); // 'of([])' crea un Observable que emite un array vacío y se completa.
    }
  }
}
