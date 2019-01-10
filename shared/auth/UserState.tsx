
export interface UserState {
  loggedIn: boolean;
  id: string;
  name: string;
  image: string;
  email: string;
  lastLogin: Date;
  loginCount: number;
  lootPoints: number;
}

export const loggedOutUser: UserState = {
  name: '',
  email: '',
  id: '',
  image: '',
  loggedIn: false,
  lootPoints: 0,
  lastLogin: new Date(),
  loginCount: 0,
};
