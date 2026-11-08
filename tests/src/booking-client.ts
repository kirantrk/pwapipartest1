import { APIRequestContext, APIResponse } from '@playwright/test';
import { AuthResponse, Booking } from './types';

export class BookingClient {
  private token?: string;

  constructor(private request: APIRequestContext , token?: string,) {
     this.token = token;
  }

  async getToken(): Promise<string> {
    if (this.token) return this.token;

    const response = await this.request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    if (!response.ok()) {
      throw new Error(`Auth request failed: ${response.status()} ${await response.text()}`);
    }

    const body: AuthResponse = await response.json();
    if (!body.token) {
      throw new Error(`Auth returned no token: ${JSON.stringify(body)}`);
    }

    this.token = body.token;
    return this.token;
  }

  // Cookie header for protected endpoints; empty when a test wants to skip auth
  private async authHeaders(withAuth: boolean): Promise<Record<string, string>> {
    return withAuth ? { Cookie: `token=${await this.getToken()}` } : {};
  }

  create(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async update(id: number, booking: Booking, withAuth = true): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: await this.authHeaders(withAuth),
    });
  }

  async patch(id: number, fields: Partial<Booking>, withAuth = true): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: fields,
      headers: await this.authHeaders(withAuth),
    });
  }

  async remove(id: number, withAuth = true): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: await this.authHeaders(withAuth),
    });
  }
}