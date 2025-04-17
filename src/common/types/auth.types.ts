export interface JwtUserAuthPayload {
  id: string;
}

export interface JwtUserCheckedPayload extends JwtUserAuthPayload {
  exp: number;
}
