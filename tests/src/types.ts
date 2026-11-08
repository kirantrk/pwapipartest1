export interface BookingDates {
  checkin: string;
  checkout: string;
}

export type Booking ={
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface CreateBookingResponse {
  bookingid: number;
  booking: Booking;
}

export interface AuthResponse {
  token: string;
}

export function newBooking(): Booking {
  return {
    firstname: 'Kiran',
    lastname: 'Test',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
    additionalneeds: 'Breakfast',
  };
}