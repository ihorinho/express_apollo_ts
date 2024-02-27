export interface AuthData {
    isAuth: boolean,
    userId?: string,
    email?: string
}
const doAuth = (token: string): AuthData => {
    return {
        isAuth: true,
        email: 'ihor.p+1@test.com'
    }
}

export default doAuth;