import { Component } from '@angular/core';
import { Features } from '../features/features';
import { Footer } from '../footer/footer';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [Features,RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
