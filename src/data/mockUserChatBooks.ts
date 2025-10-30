export interface UserChatBook {
  id: number;
  title: string;
  author: string;
  rating: number;
  reviews: number;
  status: 'available' | 'borrowed';
  bestMatch?: boolean;
}

export const userChatBooks: UserChatBook[] = [
  {
    id: 1,
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    rating: 4.8,
    reviews: 2341,
    status: 'available',
    bestMatch: true,
  },
  {
    id: 2,
    title: 'Automate the Boring Stuff',
    author: 'Al Sweigart',
    rating: 4.6,
    reviews: 1876,
    status: 'available',
  },
  {
    id: 3,
    title: 'Learning Python',
    author: 'Mark Lutz',
    rating: 4.5,
    reviews: 1543,
    status: 'borrowed',
  },
  {
    id: 4,
    title: 'Python for Data Analysis',
    author: 'Wes McKinney',
    rating: 4.7,
    reviews: 2154,
    status: 'available',
  },
];



