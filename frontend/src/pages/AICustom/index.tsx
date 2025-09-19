import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Input, Button, Select, Slider, Switch, Form, message, Spin } from 'antd';
import { RobotOutlined, SendOutlined, HistoryOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AICustom: React.FC = () => {
  const [form] = Form.useForm();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    enableCodeGeneration: true,
    enableExplanation: true,
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // 模拟AI响应
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `基于您的需求"${inputMessage}"，我建议采用以下技术方案：

1. 前端架构：React + TypeScript + Ant Design Pro
2. 状态管理：使用 Redux Toolkit 进行全局状态管理
3. 路由管理：React Router v6
4. 数据请求：Axios + React Query
5. 样式方案：Less + CSS Modules

具体实现建议：
- 组件设计采用原子化设计理念
- 使用 ESLint + Prettier 保证代码质量
- 集成单元测试和E2E测试
- 采用响应式设计，支持移动端适配

需要我为您生成具体的代码示例吗？`,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, aiMessage]);
      message.success('AI回复成功');
    } catch (error) {
      message.error('AI服务请求失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    message.success('聊天记录已清空');
  };

  return (
    <PageContainer
      title="AI定制"
      subTitle="基于AI的智能代码定制和建议"
      extra={[
        <Button key="clear" icon={<HistoryOutlined />} onClick={handleClearChat}>
          清空记录
        </Button>,
      ]}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Card title="AI聊天助手" extra={<RobotOutlined />}>
            <div style={{ height: 400, overflowY: 'auto', border: '1px solid #f0f0f0', padding: 16, borderRadius: 6, marginBottom: 16 }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '50px 0' }}>
                  <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>请描述您的需求，我会为您提供定制化的解决方案</div>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        backgroundColor: message.type === 'user' ? '#1890ff' : '#f0f0f0',
                        color: message.type === 'user' ? '#fff' : '#000',
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.7,
                          marginTop: 4,
                          textAlign: 'right',
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin />
                  <div style={{ marginTop: 8 }}>AI正在思考中...</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <TextArea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="描述您的需求，如：我想创建一个电商管理系统..."
                rows={3}
                onPressEnter={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={loading}
                disabled={!inputMessage.trim()}
              >
                发送
              </Button>
            </div>
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              提示：按 Ctrl+Enter 快速发送
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="AI配置">
            <Form form={form} layout="vertical">
              <Form.Item label="AI模型">
                <Select
                  value={aiConfig.model}
                  onChange={(value) => setAiConfig({...aiConfig, model: value})}
                >
                  <Select.Option value="gpt-4">GPT-4 (推荐)</Select.Option>
                  <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
                  <Select.Option value="claude-3">Claude-3</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label={`创造性: ${aiConfig.temperature}`}>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={aiConfig.temperature}
                  onChange={(value) => setAiConfig({...aiConfig, temperature: value})}
                />
                <div style={{ fontSize: 12, color: '#666' }}>
                  较低值更保守，较高值更有创造性
                </div>
              </Form.Item>

              <Form.Item label={`最大响应长度: ${aiConfig.maxTokens}`}>
                <Slider
                  min={500}
                  max={4000}
                  step={100}
                  value={aiConfig.maxTokens}
                  onChange={(value) => setAiConfig({...aiConfig, maxTokens: value})}
                />
              </Form.Item>

              <Form.Item label="功能开关">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>代码生成</span>
                    <Switch
                      checked={aiConfig.enableCodeGeneration}
                      onChange={(checked) => setAiConfig({...aiConfig, enableCodeGeneration: checked})}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>代码解释</span>
                    <Switch
                      checked={aiConfig.enableExplanation}
                      onChange={(checked) => setAiConfig({...aiConfig, enableExplanation: checked})}
                    />
                  </div>
                </div>
              </Form.Item>
            </Form>
          </Card>

          <Card title="常用提示" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                '帮我设计一个用户管理系统',
                '生成一个React组件的最佳实践',
                '如何优化我的数据库查询性能',
                '设计一个微服务架构方案',
                '创建一个响应式的表单组件'
              ].map((prompt, index) => (
                <Button
                  key={index}
                  size="small"
                  style={{ textAlign: 'left' }}
                  onClick={() => setInputMessage(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default AICustom;