import { useMemo, useState, useEffect } from "react";
import { Col, Grid, Row, Space, Spin, message, theme } from "antd";
import { 
  HeaderCard,
  FaqStatsOverview,
  FaqTablePanel,
  FaqCategoriesCard,
  FaqActivityCard,
  FaqEditModal,
} from "../../components/admin/faq";
import {
  mockFaqItems,
  faqCategories,
  faqCategoryDistribution,
  latestFaqActivities,
  type FaqItem,
} from "../../data";

const { useBreakpoint } = Grid;

export default function FaqPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { token } = theme.useToken();
  const mode = token.colorBgContainer === "#141414" ? "dark" : "light";

  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [faqData, setFaqData] = useState<FaqItem[]>(mockFaqItems);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  // Simulate loading data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
    return {
      totalQuestions: faqData.length,
      publishedQuestions: faqData.filter((item) => item.status === "published").length,
      draftQuestions: faqData.filter((item) => item.status === "draft").length,
      totalViews: faqData.reduce((sum, item) => sum + item.views, 0),
    };
  }, [faqData]);

  const categoriesForFilter = useMemo(
    () => faqCategories.map((cat) => ({ id: cat.id, name: cat.name })),
    []
  );

  const filteredFaqs = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();

    return faqData.filter((faq) => {
      const matchSearch =
        !normalized ||
        faq.question.toLowerCase().includes(normalized) ||
        faq.answer.toLowerCase().includes(normalized) ||
        faq.tags.some((tag) => tag.toLowerCase().includes(normalized));

      const matchStatus = statusFilter === "all" ? true : faq.status === statusFilter;
      const matchCategory = categoryFilter === "all" ? true : faq.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [categoryFilter, statusFilter, searchValue, faqData]);

  // Handle add new FAQ
  const handleAddFaq = () => {
    setEditingFaq(null);
    setEditModalVisible(true);
  };

  // Handle edit FAQ
  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setEditModalVisible(true);
  };

  // Handle save FAQ
  const handleSaveFaq = (faq: Partial<FaqItem>) => {
    if (editingFaq) {
      // Update existing FAQ
      setFaqData((prev) =>
        prev.map((item) => (item.id === faq.id ? { ...item, ...faq } : item))
      );
    } else {
      // Add new FAQ
      setFaqData((prev) => [faq as FaqItem, ...prev]);
    }
    setEditModalVisible(false);
  };

  // Handle delete FAQ
  const handleDeleteFaq = (id: string) => {
    setFaqData((prev) => prev.filter((item) => item.id !== id));
    message.success("Đã xóa FAQ thành công!");
  };

  // Close modal
  const handleCloseModal = () => {
    setEditModalVisible(false);
    setEditingFaq(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh",
        width: "100%" 
      }}>
        <Spin size="large" tip="">
          <div />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <HeaderCard isMobile={isMobile} onAddFaq={handleAddFaq} />

        <FaqStatsOverview totals={totals} />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <FaqTablePanel
              data={filteredFaqs}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              searchValue={searchValue}
              categories={categoriesForFilter}
              onStatusChange={(value) => setStatusFilter(value)}
              onCategoryChange={(value) => setCategoryFilter(value)}
              onSearchChange={(value) => setSearchValue(value)}
              onSearchSubmit={(value) => setSearchValue(value)}
              onEdit={handleEditFaq}
              onDelete={handleDeleteFaq}
            />
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <FaqCategoriesCard
                distribution={faqCategoryDistribution}
                totalFaqs={totals.totalQuestions}
                publishedFaqs={totals.publishedQuestions}
              />
            </Space>
          </Col>
        </Row>

        <FaqActivityCard activities={latestFaqActivities} />
      </Space>

      {/* Edit Modal */}
      <FaqEditModal
        visible={editModalVisible}
        faqItem={editingFaq}
        onClose={handleCloseModal}
        onSave={handleSaveFaq}
        mode={mode}
      />
    </div>
  );
}

