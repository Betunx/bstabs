export interface Donation {
  id: string;
  userId?: string;
  username?: string;
  amount: number;
  currency: string;
  message?: string;
  isPublic: boolean;
  showAmount: boolean;
  createdAt: Date;
}

export interface CreateDonationRequest {
  amount: number;
  currency: string;
  message?: string;
  isPublic: boolean;
  showAmount: boolean;
  paypalOrderId: string;
}
