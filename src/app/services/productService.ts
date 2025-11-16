import { HttpClient, httpResource } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common'; // <-- Importa isPlatformBrowser

import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';
import { of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
   private http = inject(HttpClient);
   private platformId = inject(PLATFORM_ID); 

  private productsUrl = '/api1/productos';

  getProducts(): Observable<Product[]> {

     if (isPlatformBrowser(this.platformId)) {
      // 2. Si es un navegador, hacemos la llamada a la API como siempre.
      console.log('Ejecutando en el NAVEGADOR: Haciendo llamada a la API...');
      return this.http.get<Product[]>(this.productsUrl);
    } else {
      // 3. Si NO es un navegador (es decir, es el servidor durante la build),
      //    NO hacemos la llamada a la API. En su lugar, devolvemos un
      //    Observable vacío o con datos por defecto.
      console.log('Ejecutando en el SERVIDOR (build): Omitiendo llamada a la API.');
      return of([]); // 'of([])' crea un Observable que emite un array vacío y se completa.
    }
  }
  getProductsRs(){

     if (isPlatformBrowser(this.platformId)) {
      // 2. Si es un navegador, hacemos la llamada a la API como siempre.
      console.log('Ejecutando en el NAVEGADOR: Haciendo llamada a la API...');
    const productsSignal = httpResource<Product[]>(() => (this.productsUrl));
  return productsSignal.value;
     // return httpResource<Product[]>(()=>(this.productsUrl))
    } else {
      // 3. Si NO es un navegador (es decir, es el servidor durante la build),
      //    NO hacemos la llamada a la API. En su lugar, devolvemos un
      //    Observable vacío o con datos por defecto.
      console.log('Ejecutando en el SERVIDOR (build): Omitiendo llamada a la API.');
      return signal<Product[]>([]);; // 'of([])' crea un Observable que emite un array vacío y se completa.
    }

    
  }  
  }


