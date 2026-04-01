export interface RegisterBody {
  username: string;
  email: string;
  password: string;
  companyId: string; 
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ResponseSchema {
  token: string;
}