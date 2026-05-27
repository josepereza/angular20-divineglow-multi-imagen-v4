import { Directive, ElementRef, inject, input, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { afterNextRender } from '@angular/core';

@Directive({
  selector: '[appScrollAnimation]',
})
export class ScrollAnimationDirective implements OnDestroy {
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  delay = input('0ms', { alias: 'appScrollAnimation' });
  threshold = input(0);

  private observer: IntersectionObserver | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const native = this.el.nativeElement as HTMLElement;
      native.style.opacity = '0';
      native.style.transform = 'translateY(30px)';
      native.style.willChange = 'opacity, transform';
      native.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
      native.style.transitionDelay = this.delay();

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            native.style.opacity = '1';
            native.style.transform = 'translateY(0)';
            observer.unobserve(native);
          }
        },
        { threshold: this.threshold() }
      );
      observer.observe(native);
      this.observer = observer;
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
