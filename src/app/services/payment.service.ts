import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // <-- Importa isPlatformBrowser

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  // URL de nuestro backend de ejemplo
    private platformId = inject(PLATFORM_ID);

  private backendUrl = '/api2'; 

  processPayment(paymentMethodId: string, amount: number): Observable<any> {
    const payload = {
      paymentMethodId,
      amount: Math.round(amount * 100) // Stripe trabaja en céntimos
    };

     if (isPlatformBrowser(this.platformId)) {
          // 2. Si es un navegador, hacemos la llamada a la API como siempre.
          console.log('Ejecutando en el NAVEGADOR: Haciendo llamada a la API...');
    return this.http.post(`${this.backendUrl}/create-payment`, payload);
        } else {
          // 3. Si NO es un navegador (es decir, es el servidor durante la build),
          //    NO hacemos la llamada a la API. En su lugar, devolvemos un
          //    Observable vacío o con datos por defecto.
          console.log('Ejecutando en el SERVIDOR (build): Omitiendo llamada a la API.');
          return of([]); // 'of([])' crea un Observable que emite un array vacío y se completa.
        }
  }
}