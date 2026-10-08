export type SignInField = "email" | "password";

export interface FormProblem {
    field?: SignInField;
    message: string;
}

export interface Credentials {
    email: string;
    password: string;
}

export interface AuthLink {
    id: string;
    label: string;
    href: string;
}
