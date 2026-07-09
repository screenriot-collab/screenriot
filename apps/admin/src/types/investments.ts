export type FilmWithInvestments = {
  filmId: string;
  title: string;
  slug: string;
  status: string;
  totalRaised: number;
  investorsCount: number;
  lastDonationAt: string | null;
};

export type FilmDonationRow = {
  id: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: string;
  userEmail?: string;
};
