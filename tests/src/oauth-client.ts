import { APIRequestContext, APIResponse } from '@playwright/test';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;   // seconds
}

export class OAuthClient {
  private token?: string;
  private expiresAt = 0;   // time in milliseconds when the token stops being valid

  constructor(
    private request: APIRequestContext,
    private baseUrl: string,
    private clientId = 'my-client',
    private clientSecret = 'my-secret',
  ) {}

  // Raw call: returns the response as-is, so tests can check failures like a wrong secret
  requestToken(): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/oauth/token`, {
      form: {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      },
    });
  }

  // Setup helper: returns a usable token, fetching a new one only when needed
  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;   // cached and still valid
    }

    const response = await this.requestToken();
    if (!response.ok()) {
      throw new Error(`Token request failed: ${response.status()} ${await response.text()}`);
    }

    const body: TokenResponse = await response.json();
    this.token = body.access_token;
    this.expiresAt = Date.now() + body.expires_in * 1000 - 1000;   // 1 second safety margin
    return this.token;
  }

  async getData(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/api/data`, {
      headers: { Authorization: `Bearer ${await this.getToken()}` },
    });
  }
}
