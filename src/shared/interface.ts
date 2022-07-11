export interface LoginApiBody {
    Username: string,
    Password: string
}

export interface LoginApiSuccessResponse {
    id: number,
    firstName: string,
    lastName: string,
    username: string,
    token: string
}

export interface LoginApiFailure {
    message: string
}

export interface KeyString {
    [key: string]: string | number;
}

export interface KeyArray {
    [key: string]: Array<any>;
}






