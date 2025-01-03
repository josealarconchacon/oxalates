import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  showBackToHome: boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      if (currentUrl === '/oxalate') {
        this.showBackToHome = true;
      } else {
        this.showBackToHome = false;
      }
    });
  }

  search() {
    this.router.navigate(['/oxalate']);
  }
}
