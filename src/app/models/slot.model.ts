export type Slot = {
  slot_id: string;
  game_id: string;
  slot_date: Date;
  start_time: Date;
  end_time: Date;
  is_booked: boolean;
  booked_users: string[] | null;
  created_at: Date;
};

export type SlotResponse = {
  code: number;
  message: string;
  slots: Slot[];
};

