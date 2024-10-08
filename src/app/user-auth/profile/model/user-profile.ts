export interface UserProfile {
  id: string;
  name: string;
  profileImage: string | Promise<string | null>; // Adjust type here if necessary
}
