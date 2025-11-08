import { useMemo, useState } from "react";
import { Col, Grid, Row, Space } from "antd";
import { HeaderCard } from "../../components/admin/bookManagement/HeaderCard";
import { StatsOverview, type BookTotals } from "../../components/admin/bookManagement/StatsOverview";
import { BooksTablePanel } from "../../components/admin/bookManagement/BooksTablePanel";
import { CategoryDistributionCard } from "../../components/admin/bookManagement/CategoryDistributionCard";
import { BorrowTrendCard } from "../../components/admin/bookManagement/BorrowTrendCard";
import { ActivityCard } from "../../components/admin/bookManagement/ActivityCard";
import {
  useBooks,
  useBookCategories,
  useBookActivities,
  useBorrowTrend,
} from "../../hooks/useAdminQueries";
import type { BookStatus } from "../../data";

const { useBreakpoint } = Grid;

export default function BooksManagementPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [statusFilter, setStatusFilter] = useState<"all" | BookStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [searchValue, setSearchValue] = useState("");

  // Use react-query hooks
  const { data: adminBooks = [], isLoading: booksLoading } = useBooks();
  const { data: categoryDistribution = [] } = useBookCategories();
  const { data: latestBookActivities = [] } = useBookActivities();
  const { data: monthlyBorrowTrend = [] } = useBorrowTrend();

  const totals = useMemo(() => {
    if (adminBooks.length === 0) {
      return {
        titles: 0,
        totalBooks: 0,
        totalAvailable: 0,
        totalLoaned: 0,
        totalOverdue: 0,
      };
    }
    const totalBooks = adminBooks.reduce((accumulator, book) => accumulator + book.totalCopies, 0);
    const totalAvailable = adminBooks.reduce((accumulator, book) => accumulator + book.availableCopies, 0);
    const totalLoaned = adminBooks.reduce(
      (accumulator, book) => accumulator + (book.totalCopies - book.availableCopies),
      0,
    );
    const totalOverdue = adminBooks.reduce((accumulator, book) => accumulator + book.overdueCount, 0);

    return {
      titles: adminBooks.length,
      totalBooks,
      totalAvailable,
      totalLoaned,
      totalOverdue,
    };
  }, [adminBooks]);

  const overviewTotals: BookTotals = {
    titles: totals.titles,
    totalBooks: totals.totalBooks,
    totalLoaned: totals.totalLoaned,
    totalOverdue: totals.totalOverdue,
  };

  const categories = useMemo(() => categoryDistribution.map((item) => item.category), [categoryDistribution]);

  const filteredBooks = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();

    return adminBooks.filter((book) => {
      const matchSearch =
        !normalized ||
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized) ||
        book.isbn.toLowerCase().includes(normalized);

      const matchStatus = statusFilter === "all" ? true : book.status === statusFilter;
      const matchCategory = categoryFilter === "all" ? true : book.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [categoryFilter, statusFilter, searchValue, adminBooks]);

  const borrowChange = useMemo(() => {
    if (monthlyBorrowTrend.length < 2) {
      return { borrowed: 0, returned: 0 };
    }
    const last = monthlyBorrowTrend.at(-1)!;
    const prev = monthlyBorrowTrend.at(-2)!;
    return {
      borrowed: last.borrowed - prev.borrowed,
      returned: last.returned - prev.returned,
    };
  }, [monthlyBorrowTrend]);

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <HeaderCard isMobile={isMobile} />

          <StatsOverview totals={overviewTotals} />

          {/* Books Table - Full Width */}
          <BooksTablePanel
            data={filteredBooks}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            searchValue={searchValue}
            categories={categories}
            loading={booksLoading}
            onStatusChange={(value) => setStatusFilter(value)}
            onCategoryChange={(value) => setCategoryFilter(value)}
            onSearchChange={(value) => setSearchValue(value)}
            onSearchSubmit={(value) => setSearchValue(value)}
          />

          {/* Metrics Cards Row - 50/50 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <CategoryDistributionCard
                distribution={categoryDistribution}
                totalBooks={totals.totalBooks}
                totalAvailable={totals.totalAvailable}
              />
            </Col>
            <Col xs={24} lg={12}>
              <BorrowTrendCard trend={monthlyBorrowTrend} change={borrowChange} />
            </Col>
          </Row>

          {/* Activity Card - Full Width */}
          <ActivityCard activities={latestBookActivities} />
        </Space>
    </div>
  );
}
