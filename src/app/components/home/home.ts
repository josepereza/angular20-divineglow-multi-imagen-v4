import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Features } from '../features/features';
import { RouterLink } from '@angular/router';
import { Testimonials } from '../testimonials/testimonials';

@Component({
  selector: 'app-home',
  imports: [Features, RouterLink, Testimonials],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private platformId = inject(PLATFORM_ID);
  scrollY = signal(0);
  private ticking = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.onScroll, { passive: true });
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  private onScroll = () => {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.scrollY.set(window.scrollY);
        this.ticking = false;
      });
      this.ticking = true;
    }
  };
}
