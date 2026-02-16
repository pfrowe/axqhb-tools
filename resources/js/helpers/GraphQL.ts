export interface IRallySinger {
  id: number;
  is_guest_singer: boolean;
  rally_id: string;
  singer: ISinger;
  stickers_received?: ISticker[];
  stickers_sent?: ISticker[];
  unique_id: string;
  voice_part: string;
}

export interface ISinger {
  can_receive_texts: boolean;
  city: string;
  country: string;
  email: string;
  family_name: string;
  geo_division_1: string;
  given_name: string;
  id: number;
  image: string;
  phone: string;
  postal_code: string;
  preferred_name: string;
  street_line_1: string;
  street_line_2: string;
  user: IUser;
  user_id: number;
}

export type StickerStatus = "accepted" | "declined" | "received" | "sent" | "send";

export interface ISticker {
  id: string;
  recipient: IRallySinger;
  sender: IRallySinger;
  status: StickerStatus;
  updated_at: Date | string | null;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}