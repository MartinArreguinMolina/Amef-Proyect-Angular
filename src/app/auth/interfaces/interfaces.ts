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


export interface Register{
  fullName: string,
  email: string,
  password: string,
  roles: string[],
  departments: string[]
}

export interface Roles {
  id: string,
  rol: string
}

export interface Departaments {
  id: string,
  department: string
}
