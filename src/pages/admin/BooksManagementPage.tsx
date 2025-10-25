import { useMemo, useState, useEffect } from "react";
import { Col, Grid, Row, Space, Spin } from "antd";
import { HeaderCard } from "../../components/admin/bookManagement/HeaderCard";
import { StatsOverview, type BookTotals } from "../../components/admin/bookManagement/StatsOverview";
import { BooksTablePanel } from "../../components/admin/bookManagement/BooksTablePanel";
import { CategoryDistributionCard } from "../../components/admin/bookManagement/CategoryDistributionCard";
import { BorrowTrendCard } from "../../components/admin/bookManagement/BorrowTrendCard";
import { ActivityCard } from "../../components/admin/bookManagement/ActivityCard";
import {
  adminBooks,
  categoryDistribution,
  latestBookActivities,
  monthlyBorrowTrend,
  type BookStatus,
} from "../../data/mockBooks";

const { useBreakpoint } = Grid;

export default function BooksManagementPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [statusFilter, setStatusFilter] = useState<"all" | BookStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
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
  }, []);

  const overviewTotals: BookTotals = {
    titles: totals.titles,
    totalBooks: totals.totalBooks,
    totalLoaned: totals.totalLoaned,
    totalOverdue: totals.totalOverdue,
  };

  const categories = useMemo(() => categoryDistribution.map((item) => item.category), []);

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
  }, [categoryFilter, statusFilter, searchValue]);

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
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh", 
        width: "100%" 
      }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <HeaderCard isMobile={isMobile} />

          <StatsOverview totals={overviewTotals} />

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <BooksTablePanel
                data={filteredBooks}
                statusFilter={statusFilter}
                categoryFilter={categoryFilter}
                searchValue={searchValue}
                categories={categories}
                onStatusChange={(value) => setStatusFilter(value)}
                onCategoryChange={(value) => setCategoryFilter(value)}
                onSearchChange={(value) => setSearchValue(value)}
                onSearchSubmit={(value) => setSearchValue(value)}
              />
            </Col>

            <Col xs={24} lg={8}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <CategoryDistributionCard
                  distribution={categoryDistribution}
                  totalBooks={totals.totalBooks}
                  totalAvailable={totals.totalAvailable}
                />

                <BorrowTrendCard trend={monthlyBorrowTrend} change={borrowChange} />
              </Space>
            </Col>
          </Row>

          <ActivityCard activities={latestBookActivities} />
        </Space>
    </div>
  );
}
