// Mock data for Dashboard components

export interface BookIssuedRecord {
  key: number;
  userId: string;
  bookCover: string;
  bookTitle: string;
  author: string;
  issueDate: string;
  returnDate: string;
}

export interface UserRecord {
  key: number;
  id: string;
  name: string;
  issued: number;
  dept: string;
}

export interface BookRecord {
  key: number;
  bid: string;
  title: string;
  author: string;
  stock: number;
}

export interface TopChoiceBook {
  title: string;
  author: string;
  image: string;
}

export interface ChartData {
  day: string;
  visitors: number;
  borrowers: number;
}

export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  booksIssued: number;
  revenue: number;
}

// Books Issued Data
export const bookIssuedData: BookIssuedRecord[] = [
  {
    key: 1,
    userId: "10021",
    bookCover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1627096766i/58558175.jpg",
    bookTitle: "Ancestor Trouble",
    author: "Maud Newton",
    issueDate: "20 Dec, 2022",
    returnDate: "21 Dec, 2022",
  },
  {
    key: 2,
    userId: "12034",
    bookCover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUPLsGYHER1uwmPfcCejQBE-fOQ9rHe_chXA&s",
    bookTitle: "Life is Everywhere",
    author: "Lucy Ives",
    issueDate: "23 Dec, 2022",
    returnDate: "26 Dec, 2022",
  },
  {
    key: 3,
    userId: "22987",
    bookCover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1443812562i/6402775.jpg",
    bookTitle: "Stroller",
    author: "Amanda Parrish",
    issueDate: "23 Dec, 2022",
    returnDate: "28 Dec, 2022",
  },
  {
    key: 4,
    userId: "53272",
    bookCover: "https://images.booksense.com/images/404/224/9780691224404.jpg",
    bookTitle: "The Secret Syllabus",
    author: "Terence C. Burnham",
    issueDate: "31 Dec, 2022",
    returnDate: "3 Jan, 2023",
  },
  {
    key: 5,
    userId: "06787",
    bookCover: "https://assets.isu.pub/document-structure/240321203246-57949da22f7fc411000b78023af3891a/v1/47ba45a04af1aa43b238949805004625.jpeg",
    bookTitle: "A Brief History of Time",
    author: "Stephen Hawking",
    issueDate: "1 Jan, 2023",
    returnDate: "6 Jan, 2023",
  },
];

// Users Data
export const dashboardUsers: UserRecord[] = [
  { key: 1, id: "10021", name: "Toàn asdads asdada đá ", issued: 12, dept: "Psychology asd asd ad ada sd" },
  { key: 2, id: "12034", name: "Bảo", issued: 7, dept: "Business" },
  { key: 3, id: "29387", name: "Sơn", issued: 17, dept: "Computer Science" },
  { key: 4, id: "53272", name: "Long", issued: 25, dept: "Pharmacy" },
];

// Books Data
export const dashboardBooks: BookRecord[] = [
  { key: 1, bid: "#B-10021-30", title: "Ancestor Trouble", author: "Maud Newton", stock: 30 },
  { key: 2, bid: "#B-39521-31", title: "Life is Everywhere", author: "Lucy Ives", stock: 23 },
  { key: 3, bid: "#G-95501-51", title: "Stroller", author: "Amanda Parrish", stock: 90 },
  { key: 4, bid: "#R-773521-67", title: "The Secret Syllabus", author: "Burnham", stock: 6 },
];

// Top Choices Data
export const topChoices: TopChoiceBook[] = [
  { 
    title: "The Critique of Pure Reason", 
    author: "Immanuel Kant", 
    image: "https://m.media-amazon.com/images/I/91z55teNfbL._UF1000,1000_QL80_.jpg"
  },
  { 
    title: "Stroller", 
    author: "Amanda Parrish Morgan", 
    image: "https://res.cloudinary.com/bloomsbury-atlas/image/upload/w_568,c_scale,dpr_1.5/jackets/9781501386664.jpg"
  },
  { 
    title: "The Design of Everyday Things", 
    author: "Don Norman", 
    image: "https://minh.la/wp-content/uploads/2020/06/Design-of-Everyday-Things.jpg.webp" 
  },
  { 
    title: "LEAN UX", 
    author: "Jeff Gothelf", 
    image: "https://m.media-amazon.com/images/I/81qJb1LmkBL.jpg" 
  },
  { 
    title: "The Republic", 
    author: "Plato", 
    image: "https://bookowlsbd.com/cdn/shop/files/TheRepublicBookbyPlato.jpg?v=1754895313" 
  },
  { 
    title: "Ancestor Trouble", 
    author: "Maud Newton", 
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5i7sOhjLwQz9ZT_t_cgjCS0t_zROqx2aa1g&s" 
  },
];

// Visitors & Borrowers Chart Data
export const visitorsBorrowersData: ChartData[] = [
  { day: "SAT", visitors: 25, borrowers: 48 },
  { day: "SUN", visitors: 75, borrowers: 40 },
  { day: "MON", visitors: 12, borrowers: 65 },
  { day: "TUE", visitors: 98, borrowers: 75 },
  { day: "WED", visitors: 15, borrowers: 12 },
  { day: "THU", visitors: 8, borrowers: 28 },
  { day: "FRI", visitors: 35, borrowers: 90 },
];

// Dashboard Statistics
export const dashboardStats: DashboardStats = {
  totalBooks: 1248,
  totalMembers: 945,
  booksIssued: 356,
  revenue: 12500000,
};

