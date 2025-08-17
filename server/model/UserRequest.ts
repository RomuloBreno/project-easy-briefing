// models/UserRequest.ts
export class UserRequest {
    token?: string | undefined;
    nameUser:string
    password: string;
    email: string;
    planId?: boolean;
    plan?: number;
    
}