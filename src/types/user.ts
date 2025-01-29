export const enum Role {
  Admin = 'admin',
  User = 'user',
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  fullName:string;
  avatarUrl: string ;
  createdAt: string;
  role:Role
}