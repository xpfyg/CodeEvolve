import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Steps, Form, Select, Input, Button, Row, Col, Space, message, Spin } from 'antd';
import { DownloadOutlined, EyeOutlined, RobotOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { TextArea } = Input;

interface GenerationConfig {
  templateId: string;
  projectName: string;
  description: string;
  dbConfig?: {
    host: string;
    port: string;
    database: string;
    username: string;
  };
  features: string[];
}

const CodeGen: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const templates = [
    { id: '1', name: 'React + Ant Design 管理后台', category: '前端' },
    { id: '2', name: 'Golang + Gin REST API', category: '后端' },
    { id: '3', name: 'Vue3 + Element Plus 电商前端', category: '前端' },
    { id: '4', name: 'Spring Boot + MyBatis API', category: '后端' },
  ];

  const handleNext = () => {
    form.validateFields().then(() => {
      setCurrent(current + 1);
    });
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const values = await form.validateFields();

      // 模拟代码生成
      await new Promise(resolve => setTimeout(resolve, 3000));

      setGeneratedCode('code-package-' + Date.now() + '.zip');
      message.success('代码生成成功！');
      setCurrent(current + 1);
    } catch (error) {
      message.error('代码生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    // 模拟下载
    message.success('开始下载代码包');
  };

  const handlePreview = () => {
    // 跳转到预览页面
    window.open('/preview', '_blank');
  };

  const handleAICustom = () => {
    // 跳转到AI定制页面
    window.open('/ai-custom', '_blank');
  };

  const steps = [
    {
      title: '选择模板',
      content: (
        <Card title="选择代码模板">
          <Form form={form} layout="vertical">
            <Form.Item
              name="templateId"
              label="代码模板"
              rules={[{ required: true, message: '请选择代码模板' }]}
            >
              <Select placeholder="请选择代码模板">
                {templates.map(template => (
                  <Select.Option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="projectName"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>
            <Form.Item
              name="description"
              label="项目描述"
            >
              <TextArea rows={3} placeholder="请输入项目描述" />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: '配置参数',
      content: (
        <Card title="配置生成参数">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={['dbConfig', 'host']} label="数据库地址">
                  <Input placeholder="localhost" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['dbConfig', 'port']} label="端口">
                  <Input placeholder="3306" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={['dbConfig', 'database']} label="数据库名">
                  <Input placeholder="database_name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['dbConfig', 'username']} label="用户名">
                  <Input placeholder="root" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="features" label="功能模块">
              <Select mode="multiple" placeholder="请选择需要的功能模块">
                <Select.Option value="auth">用户认证</Select.Option>
                <Select.Option value="crud">CRUD操作</Select.Option>
                <Select.Option value="file">文件上传</Select.Option>
                <Select.Option value="export">数据导出</Select.Option>
                <Select.Option value="log">日志记录</Select.Option>
                <Select.Option value="cache">缓存管理</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: '生成代码',
      content: (
        <Card title="生成代码">
          {generating ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>正在生成代码，请稍候...</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Button type="primary" size="large" onClick={handleGenerate}>
                开始生成代码
              </Button>
            </div>
          )}
        </Card>
      ),
    },
    {
      title: '完成',
      content: (
        <Card title="生成完成">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: 24 }}>
              <h3>🎉 代码生成成功！</h3>
              <p>代码包: {generatedCode}</p>
            </div>
            <Space size="large">
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
                下载代码包
              </Button>
              <Button icon={<EyeOutlined />} onClick={handlePreview}>
                在线预览
              </Button>
              <Button icon={<RobotOutlined />} onClick={handleAICustom}>
                AI定制
              </Button>
            </Space>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer title="代码生成">
      <Card>
        <Steps current={current} style={{ marginBottom: 24 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div style={{ marginBottom: 24 }}>
          {steps[current].content}
        </div>

        <div style={{ textAlign: 'center' }}>
          {current > 0 && current < steps.length - 1 && (
            <Button style={{ marginRight: 8 }} onClick={handlePrev}>
              上一步
            </Button>
          )}
          {current < steps.length - 2 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => setCurrent(0)}>
              重新生成
            </Button>
          )}
        </div>
      </Card>
    </PageContainer>
  );
};

export default CodeGen;