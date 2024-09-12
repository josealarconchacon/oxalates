import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth-service.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  activeSection: string = 'profile';
  userProfile: any;
  isChangePasswordVisible: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo() {
    this.authService.getUserProfile().subscribe((response) => {
      this.userProfile = response;
    });
  }

  showSection(section: string): void {
    this.activeSection = section;
  }

  toggleChangePassword(): void {
    this.isChangePasswordVisible = !this.isChangePasswordVisible;
  }

  onLogout(): void {
    this.authService.signOut();
  }
}
