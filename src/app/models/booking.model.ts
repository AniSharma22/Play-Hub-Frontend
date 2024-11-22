export type Booking = {
  booking_id: string;
  game_id: string;
  game: string;
  image_url: string;
  date: Date;
  start_time: Date;
  end_time: Date;
  booked_users: string[];
};

export type BookingResponse = {
  code: number;
  bookings: Booking[] | null;
  message: string;
};

export enum BookingType {
  upcoming = 'upcoming',
  pendingResults = 'pending-results',
}

export enum BookingResult {
  win = 'win',
  loss = 'loss',
}
