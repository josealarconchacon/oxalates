import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth-service.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  activeSection: string = 'profile';
  isAddressModalVisible: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Fetch and display user profile details
  }

  showSection(section: string): void {
    this.activeSection = section;
  }

  toggleAddressModal(): void {
    this.isAddressModalVisible = !this.isAddressModalVisible;
  }

  onLogout(): void {
    this.authService.signOut();
  }
}
