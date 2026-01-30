import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";

export interface StoredCredential {
  id: string;
  publicKey: Uint8Array;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
}

export interface User {
  id: string;
  name: string;
  credentials: StoredCredential[];
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
}
