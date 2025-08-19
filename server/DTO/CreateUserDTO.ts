export class CreateUserDTO {
  name: string;
  email: string;
  password: string;
}
export class UpdateUserDTO {
  token:string;
  email: string;
  password: string;
}