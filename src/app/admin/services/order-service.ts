import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // <-- Importa isPlatformBrowser

import { HttpClient } from '@angular/common/http';
import { CreatePedido } from '../../interfaces/pedido';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private platformId = inject(PLATFORM_ID);

  private ordersSignal = signal<CreatePedido[]>([]);
  orders = this.ordersSignal.asReadonly();

  private apiUrl = '/api1/pedidos';

  constructor(private http: HttpClient) {
    this.loadOrders();
  }

  loadOrders() {
    if (isPlatformBrowser(this.platformId)) {
      // 2. Si es un navegador, hacemos la llamada a la API como siempre.
      console.log('Ejecutando en el NAVEGADOR: Haciendo llamada a la API...');
      this.http.get<CreatePedido[]>(this.apiUrl).subscribe({
        next: (data) => this.ordersSignal.set(data),
        error: (err) => console.error('Error cargando pedidos', err),
      });
    } else {
      // 3. Si NO es un navegador (es decir, es el servidor durante la build),
      //    NO hacemos la llamada a la API. En su lugar, devolvemos un
      //    Observable vacío o con datos por defecto.
      console.log('Ejecutando en el SERVIDOR (build): Omitiendo llamada a la API.');
      //return of([]); // 'of([])' crea un Observable que emite un array vacío y se completa.
    }
  }

  updateGesendet(id: number, gesendet: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      // 2. Si es un navegador, hacemos la llamada a la API como siempre.
      console.log('Ejecutando en el NAVEGADOR: Haciendo llamada a la API...');
      return this.http.patch(`${this.apiUrl}/${id}`, { gesendet }).pipe(
        tap((updatedOrder: any) => {
          // 🔥 Actualizamos la signal para refrescar la UI al instante
          this.loadOrders();
        })
      );
    } else {
      // 3. Si NO es un navegador (es decir, es el servidor durante la build),
      //    NO hacemos la llamada a la API. En su lugar, devolvemos un
      //    Observable vacío o con datos por defecto.
      console.log('Ejecutando en el SERVIDOR (build): Omitiendo llamada a la API.');
      return of([]); // 'of([])' crea un Observable que emite un array vacío y se completa.
    }
  }
}
