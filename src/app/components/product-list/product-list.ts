import { Component, computed, inject, signal } from '@angular/core';
import { ProductoService } from '../../services/productService';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink,CurrencyPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export default class ProductList {
  // Signal para controlar qué filtro está activo
  filtro = signal<'con' | 'sin' | 'todos'>('sin');
productService=inject(ProductoService)
productosRs=this.productService.getProductsRs()
//misproductos=computed(()=>this.productos!.value())
// Computed: productos filtrados según el botón activo
  productosFiltrados = computed(() => {
    const productos = this.productosRs();
    const palabra = 'schmuck';

    if (this.filtro() === 'con') {
      return productos!.filter(p => 
        p.name.toLowerCase().includes(palabra)
      );
    }
    
    if (this.filtro() === 'sin') {
      return productos!.filter(p => 
        !p.name.toLowerCase().includes(palabra)
      );
    }

    return productos; // 'todos'
  });
  // Métodos para los botones
  mostrarConSchmuck() {
    this.filtro.set('con');
  }

  mostrarSinSchmuck() {
    this.filtro.set('sin');
  }

  mostrarTodos() {
    this.filtro.set('todos');
  }
}
