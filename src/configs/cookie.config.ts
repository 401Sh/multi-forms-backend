type RefreshCookie = {
  httpOnly: boolean,
  secure: boolean,
  sameSite: 'strict' | 'lax' | 'none',
  path: string,
  maxAge: number
};

export const refreshCookieOptions: RefreshCookie = {
  httpOnly: false,
  secure: false,
  sameSite: "strict",
  path: '/',
  maxAge: 604800000
};

// лучше будет потом переработать на использование nest конфигуратора