import { useMemo, useState, useEffect } from "react";
import { Col, Grid, Row, Space, Spin, Tag, Input, message } from "antd";
import { 
  HeaderCard,
  FaqStatsOverview,
  FaqTablePanel,
  FaqCategoriesCard,
  FaqActivityCard,
} from "../../components/admin/faq";
import { GenericFormModal } from "../../components/admin/common";
import { categoryIcons } from "../../components/admin/faq/constants";
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

  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [faqData, setFaqData] = useState<FaqItem[]>(mockFaqItems);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [tempTags, setTempTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState("");

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
    setTempTags([]);
    setInputTag("");
    setEditModalVisible(true);
  };

  // Handle edit FAQ
  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setTempTags(faq.tags || []);
    setInputTag("");
    setEditModalVisible(true);
  };

  // Handle save FAQ
  const handleSaveFaq = (faq: Partial<FaqItem>) => {
    const faqWithTags = { ...faq, tags: tempTags };
    
    if (editingFaq) {
      // Update existing FAQ
      setFaqData((prev) =>
        prev.map((item) => (item.id === faq.id ? { ...item, ...faqWithTags } : item))
      );
    } else {
      // Add new FAQ with additional fields
      const newFaq = {
        ...faqWithTags,
        id: `faq-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: "La Thanh Toàn",
        views: 0,
        helpful: 0,
        notHelpful: 0,
      } as FaqItem;
      setFaqData((prev) => [newFaq, ...prev]);
    }
    setEditModalVisible(false);
    setTempTags([]);
    setInputTag("");
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
    setTempTags([]);
    setInputTag("");
  };

  // Tag handlers
  const handleAddTag = () => {
    if (inputTag && !tempTags.includes(inputTag)) {
      setTempTags([...tempTags, inputTag]);
      setInputTag("");
    }
  };

  const handleRemoveTag = (removedTag: string) => {
    setTempTags(tempTags.filter((tag) => tag !== removedTag));
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
      <GenericFormModal<FaqItem>
        title="FAQ"
        visible={editModalVisible}
        editItem={editingFaq}
        fields={[
          {
            name: "question",
            label: "Câu hỏi",
            type: "text",
            required: true,
            placeholder: "Nhập câu hỏi...",
            span: { xs: 24, sm: 24, md: 24 },
          },
          {
            name: "answer",
            label: "Câu trả lời",
            type: "textarea",
            required: true,
            placeholder: "Nhập câu trả lời chi tiết...",
            rows: 6,
            maxLength: 2000,
            span: { xs: 24, sm: 24, md: 24 },
          },
          {
            name: "category",
            label: "Danh mục",
            type: "select",
            required: true,
            span: { xs: 24, sm: 24, md: 8 },
            options: faqCategories.map((cat) => ({
              label: (
                <Space>
                  {categoryIcons[cat.id]}
                  <span>{cat.name}</span>
                </Space>
              ),
              value: cat.id,
            })),
          },
          {
            name: "status",
            label: "Trạng thái",
            type: "select",
            required: true,
            span: { xs: 24, sm: 12, md: 8 },
            options: [
              { label: "Xuất bản", value: "published" },
              { label: "Nháp", value: "draft" },
              { label: "Lưu trữ", value: "archived" },
            ],
          },
          {
            name: "priority",
            label: "Độ ưu tiên",
            type: "number",
            required: true,
            min: 1,
            max: 5,
            placeholder: "1-5",
            span: { xs: 24, sm: 12, md: 8 },
          },
          {
            name: "tags",
            label: "Thẻ tags",
            type: "custom",
            span: { xs: 24, sm: 24, md: 24 },
            render: () => {
              return (
              <div>
                <Space style={{ marginBottom: 8 }}>
                  <Input
                    placeholder="Nhập tag..."
                    value={inputTag}
                    onChange={(e) => setInputTag(e.target.value)}
                    onPressEnter={handleAddTag}
                    style={{ width: 200 }}
                  />
                  <a onClick={handleAddTag}>Thêm</a>
                </Space>
                <div>
                  {tempTags.map((tag) => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => handleRemoveTag(tag)}
                      style={{ marginBottom: 8 }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
              );
            },
          },
        ]}
        onClose={handleCloseModal}
        onSave={handleSaveFaq}
        initialValues={{
          status: "draft",
          priority: 3,
        }}
        width={800}
      />
    </div>
  );
}

