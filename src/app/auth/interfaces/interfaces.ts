export interface Login{
  email: string,
  password: string
}

export interface UserReponse {
  id:       string;
  fullName: string;
  email:    string;
  isActive: boolean;
  roles:    string[];
  token:    string;
  departaments: string[]
}
