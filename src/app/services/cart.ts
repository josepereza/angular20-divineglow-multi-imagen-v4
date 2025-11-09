import { computed, Injectable, signal } from '@angular/core';
import { Product } from '../interfaces/product';
import { LineaPedido } from '../interfaces/pedido';

// Creamos una interfaz para los datos del cliente
export interface CustomerInfo {
  fullName: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Signal para gestionar el estado del carrito
  cartItems = signal<Product[]>([]);
  cartItemsPedido = signal<LineaPedido[]>([]);

  // Signals computados para valores derivados
  totalItems = computed(() => this.cartItems().length);
  totalPrice = computed(() => this.cartItems().reduce((acc, item) => acc + item.price, 0));

  // ***** NUEVO SIGNAL PARA LOS DATOS DEL CLIENTE *****
  // Lo inicializamos como nulo
  customerInfo = signal<CustomerInfo | null>(null);

  // ... signals computados (no cambian) ...

  // ***** NUEVO MÉTODO PARA GUARDAR LOS DATOS *****
  setCustomerInfo(info: CustomerInfo) {
    this.customerInfo.set(info);
  }
  
  addToCart(product: Product) {
    const normalizedProduct = {
      ...product,
      price: Number(product.price), // fuerza conversión a número
    };
    this.cartItems.update((items) => [...items, normalizedProduct]);

    this.cartItemsPedido.update((itemsCarrito) => {
      // Buscamos si el producto ya existe en el carrito
      const existingItem = itemsCarrito.find((item) => item.productoId === product.id);

      if (existingItem) {
        // Si existe, creamos un nuevo array mapeando y actualizando solo la cantidad del item encontrado
        return itemsCarrito.map((item) =>
          item.productoId === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        // Si no existe, lo añadimos al array con cantidad 1
        return [...itemsCarrito, { productoId: product.id, cantidad: 1 }];
      }
    });
  }

  removeFromCart(productId: number) {
    this.cartItems.update((items) => items.filter((item) => item.id !== productId));
    this.cartItemsPedido.update((items) => items.filter((item) => item.productoId !== productId));
  }

  // NUEVO MÉTODO
  clearCart() {
    this.cartItems.set([]);
    this.cartItemsPedido.set([]);
    this.customerInfo.set(null); // Limpiamos también la info del cliente
  }
}
