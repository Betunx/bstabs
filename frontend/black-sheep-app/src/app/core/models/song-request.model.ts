export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface SongRequest {
  id: string;
  userId: string;
  username: string;
  songTitle: string;
  artist: string;
  message?: string;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSongRequestDto {
  songTitle: string;
  artist: string;
  message?: string;
}
