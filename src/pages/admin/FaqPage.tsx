import { useMemo, useState } from "react";
import { Col, Grid, Row, Space, Tag, Input, App as AntdApp } from "antd";
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
  useFaqs,
  useFaqCategories,
  useFaqCategoryDistribution,
  useFaqActivities,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
} from "../../hooks/useAdminQueries";
import type { FaqItem } from "../../data";

const { useBreakpoint } = Grid;

export default function FaqPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { notification } = AntdApp.useApp();

  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [searchValue, setSearchValue] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [tempTags, setTempTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState("");

  // Use react-query hooks
  const { data: initialFaqData = [], isLoading: tableLoading } = useFaqs();
  const { data: faqCategories = [], isLoading: categoriesLoading } = useFaqCategories();
  const { data: faqCategoryDistribution = [], isLoading: categoryDistributionLoading } = useFaqCategoryDistribution();
  const { data: latestFaqActivities = [], isLoading: activityLoading } = useFaqActivities();
  
  // Mutations
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();

  // Use FAQ data directly from API (no need for local state since we're using mutations)
  const faqData = initialFaqData;

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
    [faqCategories]
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
  const handleSaveFaq = async (faq: Partial<FaqItem>) => {
    try {
      const faqData = {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        status: faq.status,
        priority: faq.priority,
        tags: tempTags,
      };

      if (editingFaq) {
        // Update existing FAQ
        await updateFaqMutation.mutateAsync({
          faqId: editingFaq.id,
          data: faqData,
        });
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật FAQ thành công!',
          placement: 'topRight',
        });
      } else {
        // Create new FAQ
        await createFaqMutation.mutateAsync(faqData);
        notification.success({
          message: 'Thành công',
          description: 'Tạo FAQ thành công!',
          placement: 'topRight',
        });
      }
      
      setEditModalVisible(false);
      setTempTags([]);
      setInputTag("");
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi lưu FAQ!',
        placement: 'topRight',
      });
    }
  };

  // Handle delete FAQ
  const handleDeleteFaq = async (id: string) => {
    try {
      await deleteFaqMutation.mutateAsync(id);
      notification.success({
        message: 'Thành công',
        description: 'Đã xóa FAQ thành công!',
        placement: 'topRight',
      });
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi xóa FAQ!',
        placement: 'topRight',
      });
    }
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

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <HeaderCard isMobile={isMobile} onAddFaq={handleAddFaq} />

        <FaqStatsOverview totals={totals} />

        {/* Danh sách câu hỏi - 100% width */}
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
          loading={tableLoading}
        />

        {/* Phân bổ theo danh mục và Hoạt động mới nhất - 50/50 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <FaqCategoriesCard
              distribution={faqCategoryDistribution}
              totalFaqs={totals.totalQuestions}
              publishedFaqs={totals.publishedQuestions}
              loading={categoriesLoading || categoryDistributionLoading}
            />
          </Col>
          <Col xs={24} lg={12}>
            <FaqActivityCard activities={latestFaqActivities} loading={activityLoading} />
          </Col>
        </Row>
      </Space>

      {/* Edit Modal */}
      <GenericFormModal<FaqItem>
        title="FAQ"
        visible={editModalVisible}
        editItem={editingFaq}
        showNotification={false}
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

