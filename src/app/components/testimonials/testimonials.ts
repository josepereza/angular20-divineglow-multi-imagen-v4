import { Component } from '@angular/core';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

@Component({
  selector: 'app-testimonials',
  imports: [ScrollAnimationDirective],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class Testimonials {
  testimonials: Testimonial[] = [
    {
      name: 'Anna K.',
      text: 'Die Tasche ist noch schöner als auf den Bildern! Perfekte Verarbeitung und ein echter Hingucker. Ich habe schon so viele Komplimente bekommen.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/80?img=1',
    },
    {
      name: 'Maria S.',
      text: 'Wunderschöne handgefertigte Qualität. Der Versand war schnell und die Verpackung sehr liebevoll. Ich werde auf jeden Fall wieder bestellen!',
      rating: 5,
      avatar: 'https://i.pravatar.cc/80?img=5',
    },
    {
      name: 'Laura B.',
      text: 'Absolut einzigartiges Design! Ich habe meine Clutch zur Hochzeit getragen und alle waren begeistert. Einfach magisch ✨',
      rating: 5,
      avatar: 'https://i.pravatar.cc/80?img=9',
    },
    {
      name: 'Sabrina M.',
      text: 'Genau das gewisse Etwas, das ich für mein Abendoutfit gesucht habe. Die Perlen glitzern wunderschön. Sehr empfehlenswert!',
      rating: 4,
      avatar: 'https://i.pravatar.cc/80?img=20',
    },
  ];
}
