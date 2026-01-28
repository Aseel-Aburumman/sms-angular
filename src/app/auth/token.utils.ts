import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
    role?: string | string[];
    email?: string;
    sub?: string;
    fullName?: string;
};

export function getRolesFromToken(token: string): string[] {
    const payload = jwtDecode<JwtPayload>(token);

    const r = payload.role;
    if (!r) return [];
    return Array.isArray(r) ? r : [r];
}
