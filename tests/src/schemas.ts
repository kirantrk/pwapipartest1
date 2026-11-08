import { object, z } from "zod";
import { Booking } from "./types";

export const AuthResponseSchema = z.object({
  token: z.string(),
});

export const AuthErrorSchema = z.object({
  reason: z.string(),
});

export const BookingIdListSchema = z.array(z.object({ bookingid: z.number() }));

export const BookingDatesSchema = z.object({
  checkin: z.string(),
  checkout: z.string(),
});

export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  //totalprice: z.string(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const CreateBookingResponseSchema = z.object({
  bookingid: z.number(),
  booking: BookingSchema,
});

export type BookingFromSchema = z.infer<typeof BookingSchema>;

// const a:Booking = {} as BookingFromSchema
// const b:BookingFromSchema = {} as Booking
// BookingIdListSchema.safeParse([{ bookingid: 1 }]).success;   // true
// BookingIdListSchema.safeParse([]).success;                   // true (an empty list is valid)
// BookingIdListSchema.safeParse({ bookingid: 1 }).success;     // false (not an array)