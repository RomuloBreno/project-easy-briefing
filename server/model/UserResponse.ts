// models/UserResponse.ts
export class UserResponse {
    token?: string | undefined;
    nameUser: string;
    email: string;
    planId?: boolean;
    plan?: number;
    isVerified?: boolean | undefined;
    
}