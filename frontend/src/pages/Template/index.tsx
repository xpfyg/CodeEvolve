import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Button, Tag, Space, Modal, Form, Input, Select, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, CodeOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { TextArea } = Input;

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  techStack: string[];
  previewImage?: string;
  downloadCount: number;
  createdAt: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'React + Ant Design 管理后台',
    description: '基于React 18 + Ant Design Pro的现代化管理后台模板',
    category: '前端',
    techStack: ['React', 'TypeScript', 'Ant Design', 'Umi'],
    downloadCount: 1234,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Golang + Gin REST API',
    description: '高性能Go后端API服务模板，包含JWT认证、CRUD操作',
    category: '后端',
    techStack: ['Golang', 'Gin', 'GORM', 'MySQL'],
    downloadCount: 890,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Vue3 + Element Plus 电商前端',
    description: 'Vue3 Composition API + Element Plus电商管理系统',
    category: '前端',
    techStack: ['Vue3', 'TypeScript', 'Element Plus', 'Vite'],
    downloadCount: 567,
    createdAt: '2024-01-08',
  },
];

const Template: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingTemplate(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模板吗？',
      onOk: () => {
        setTemplates(templates.filter(t => t.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTemplate) {
        setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...values } : t));
        message.success('更新成功');
      } else {
        const newTemplate: Template = {
          id: Date.now().toString(),
          ...values,
          downloadCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setTemplates([...templates, newTemplate]);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <PageContainer
      title="模板管理"
      extra={[
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增模板
        </Button>,
      ]}
    >
      <Row gutter={[16, 16]}>
        {templates.map((template) => (
          <Col key={template.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                template.previewImage ? (
                  <img alt={template.name} src={template.previewImage} style={{ height: 200 }} />
                ) : (
                  <div style={{ height: 200, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CodeOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  </div>
                )
              }
              actions={[
                <EyeOutlined key="preview" title="预览" />,
                <EditOutlined key="edit" title="编辑" onClick={() => handleEdit(template)} />,
                <DeleteOutlined key="delete" title="删除" onClick={() => handleDelete(template.id)} />,
              ]}
            >
              <Meta
                title={template.name}
                description={
                  <div>
                    <p style={{ margin: '0 0 8px 0', height: 40, overflow: 'hidden' }}>
                      {template.description}
                    </p>
                    <Space wrap>
                      {template.techStack.map((tech) => (
                        <Tag key={tech} color="blue" size="small">
                          {tech}
                        </Tag>
                      ))}
                    </Space>
                    <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                      下载: {template.downloadCount} | {template.createdAt}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingTemplate ? '编辑模板' : '新增模板'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
          <Form.Item
            name="category"
            label="模板分类"
            rules={[{ required: true, message: '请选择模板分类' }]}
          >
            <Select placeholder="请选择模板分类">
              <Select.Option value="前端">前端</Select.Option>
              <Select.Option value="后端">后端</Select.Option>
              <Select.Option value="全栈">全栈</Select.Option>
              <Select.Option value="移动端">移动端</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="techStack"
            label="技术栈"
            rules={[{ required: true, message: '请选择技术栈' }]}
          >
            <Select mode="tags" placeholder="请选择或输入技术栈">
              <Select.Option value="React">React</Select.Option>
              <Select.Option value="Vue">Vue</Select.Option>
              <Select.Option value="Angular">Angular</Select.Option>
              <Select.Option value="Golang">Golang</Select.Option>
              <Select.Option value="Java">Java</Select.Option>
              <Select.Option value="Python">Python</Select.Option>
              <Select.Option value="Node.js">Node.js</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="previewImage" label="预览图">
            <Upload
              name="avatar"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Template;