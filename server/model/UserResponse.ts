// models/UserResponse.ts
export class UserResponse {
    token?: string | undefined;
    name: string;
    email: string;
    planId?: boolean;
    plan?: number;
    isVerified?: boolean | undefined;
    
}