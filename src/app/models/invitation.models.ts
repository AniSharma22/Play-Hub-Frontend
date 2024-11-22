export type Invitation = {
  invitation_id: string;
  slotId: string;
  game_id: string;
  game: string;
  image_url: string;
  date: Date;
  start_time: Date;
  end_time: Date;
  booked_users: {
    user_name: string;
    user_image: string;
  }[];
  invited_by: string;
};

export type InvitationResponse = {
  code: number;
  invitations: Invitation[];
  message: string;
};

export enum InvitationType {
  pending = 'pending',
  sent = 'sent',
}

export enum BookingType {
  upcoming = 'upcoming',
  pendingResults = 'pending-results',
}
