import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { PRIMARY_NAV, NavLink } from '../../core/content/site-content';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'nh-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly navLinks: NavLink[] = PRIMARY_NAV;
  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);
  private currentUrl = signal(this.router.url);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl.set((event as NavigationEnd).urlAfterRedirects);
      this.menuOpen.set(false);
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(globalThis.scrollY > 8);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  isActive(link: NavLink): boolean {
    const [pathAndQuery] = this.currentUrl().split('#');
    const [path, rest] = pathAndQuery.split('?');
    if (link.path === '/') return path === '/' && !link.fragment;
    if (path !== link.path) return false;
    if (link.activeQueryParam) {
      const params = new URLSearchParams(rest ?? '');
      return params.get(link.activeQueryParam.key) === link.activeQueryParam.value;
    }
    if (link.path === '/rooms') {
      const params = new URLSearchParams(rest ?? '');
      return !params.get('category');
    }
    return true;
  }

  navigate(link: NavLink, event: Event): void {
    event.preventDefault();
    this.menuOpen.set(false);
    void this.router.navigate([link.path], {
      queryParams: link.queryParams ?? null,
      fragment: link.fragment,
    });
  }

  bookNow(event: Event): void {
    event.preventDefault();
    this.menuOpen.set(false);
    void this.router.navigate(['/'], { fragment: 'book' });
  }
}
