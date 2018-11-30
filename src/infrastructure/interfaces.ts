export interface IUser {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    bio?: string;
    phoneNumber?: string;
}

export interface IOrder {
    title: string;
    description: string;
    user: IUser;
}

export interface  IJwtPayload {
    email: string;
    isAdmin: boolean;
}

export interface ISignInOptions {
    email: string;
    password: string;
}
