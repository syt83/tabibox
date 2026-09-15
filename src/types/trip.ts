export interface Trip {
  id: string;
  userId: string;

  title: string;

  country: string;
  year: number;

  startDate: string;
  endDate: string;

  cities: string[];

  coverImageUrl?: string;

  createdAt: string;
}
