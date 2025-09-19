import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Button, Tabs, Collapse, Tree, message, Modal, Input, Select } from 'antd';
import { EyeOutlined, FolderOutlined, FileOutlined, PlayCircleOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { TextArea } = Input;

interface FileNode {
  title: string;
  key: string;
  icon?: React.ReactNode;
  children?: FileNode[];
  isLeaf?: boolean;
  content?: string;
}

const mockFileTree: FileNode[] = [
  {
    title: 'my-project',
    key: '0',
    icon: <FolderOutlined />,
    children: [
      {
        title: 'src',
        key: '0-0',
        icon: <FolderOutlined />,
        children: [
          {
            title: 'components',
            key: '0-0-0',
            icon: <FolderOutlined />,
            children: [
              {
                title: 'UserList.tsx',
                key: '0-0-0-0',
                icon: <FileOutlined />,
                isLeaf: true,
                content: `import React from 'react';
import { Table, Button, Space } from 'antd';

export const UserList: React.FC = () => {
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small">删除</Button>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={[]} />;
};`
              },
              {
                title: 'UserForm.tsx',
                key: '0-0-0-1',
                icon: <FileOutlined />,
                isLeaf: true,
                content: `import React from 'react';
import { Form, Input, Button, Select } from 'antd';

export const UserForm: React.FC = () => {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="role" label="角色">
        <Select>
          <Select.Option value="admin">管理员</Select.Option>
          <Select.Option value="user">用户</Select.Option>
        </Select>
      </Form.Item>
      <Button type="primary" htmlType="submit">保存</Button>
    </Form>
  );
};`
              },
            ],
          },
          {
            title: 'pages',
            key: '0-0-1',
            icon: <FolderOutlined />,
            children: [
              {
                title: 'Dashboard.tsx',
                key: '0-0-1-0',
                icon: <FileOutlined />,
                isLeaf: true,
                content: `import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, ProjectOutlined } from '@ant-design/icons';

export const Dashboard: React.FC = () => {
  return (
    <PageContainer title="仪表盘">
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总用户数"
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="项目数"
              value={93}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};`
              },
            ],
          },
          {
            title: 'App.tsx',
            key: '0-0-2',
            icon: <FileOutlined />,
            isLeaf: true,
            content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;`
          },
        ],
      },
      {
        title: 'package.json',
        key: '0-1',
        icon: <FileOutlined />,
        isLeaf: true,
        content: `{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.4.0",
    "@ant-design/pro-components": "^2.4.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}`
      },
      {
        title: 'README.md',
        key: '0-2',
        icon: <FileOutlined />,
        isLeaf: true,
        content: `# My Project

基于React + Ant Design Pro的管理系统

## 功能特性

- 用户管理
- 数据统计
- 响应式设计

## 安装运行

\`\`\`bash
npm install
npm start
\`\`\`

## 项目结构

\`\`\`
src/
  components/   # 通用组件
  pages/       # 页面组件
  App.tsx      # 应用入口
\`\`\``
      },
    ],
  },
];

const Preview: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [deployModalVisible, setDeployModalVisible] = useState(false);
  const [running, setRunning] = useState(false);

  const handleFileSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0 && info.node.isLeaf) {
      setSelectedFile(info.node);
    }
  };

  const handleRunProject = () => {
    setRunning(true);
    setPreviewUrl('http://localhost:3000');
    message.success('项目启动成功！正在本地运行...');

    // 模拟项目启动过程
    setTimeout(() => {
      setRunning(false);
    }, 3000);
  };

  const handleDeploy = () => {
    setDeployModalVisible(true);
  };

  const handleDeploySubmit = () => {
    message.success('项目部署成功！');
    setDeployModalVisible(false);
  };

  const renderFileContent = () => {
    if (!selectedFile?.content) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
          <FileOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <div>请选择文件查看内容</div>
        </div>
      );
    }

    return (
      <pre style={{
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 6,
        overflow: 'auto',
        fontSize: 13,
        lineHeight: 1.5
      }}>
        {selectedFile.content}
      </pre>
    );
  };

  const tabItems = [
    {
      key: 'files',
      label: '文件结构',
      children: (
        <Row gutter={16}>
          <Col span={8}>
            <Card title="项目文件" size="small">
              <Tree
                showIcon
                onSelect={handleFileSelect}
                treeData={mockFileTree}
                defaultExpandAll
              />
            </Card>
          </Col>
          <Col span={16}>
            <Card
              title={selectedFile ? selectedFile.title : '文件内容'}
              size="small"
              extra={
                selectedFile && (
                  <Button size="small" icon={<EditOutlined />}>
                    编辑
                  </Button>
                )
              }
            >
              {renderFileContent()}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'preview',
      label: '在线预览',
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRunProject}
              loading={running}
              style={{ marginRight: 8 }}
            >
              {running ? '启动中...' : '运行项目'}
            </Button>
            <Button icon={<DownloadOutlined />}>
              下载源码
            </Button>
          </div>

          {previewUrl ? (
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f0f0f0', padding: '8px 16px', borderBottom: '1px solid #d9d9d9' }}>
                <span>预览地址: </span>
                <span style={{ color: '#1890ff' }}>{previewUrl}</span>
              </div>
              <div style={{ height: 600, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <PlayCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                  <div>项目正在运行中...</div>
                  <div style={{ marginTop: 8, color: '#666' }}>实际项目会在此处显示预览效果</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              height: 400,
              border: '2px dashed #d9d9d9',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999'
            }}>
              <div style={{ textAlign: 'center' }}>
                <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>点击"运行项目"开始预览</div>
              </div>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: 'logs',
      label: '运行日志',
      children: (
        <Card>
          <div style={{
            backgroundColor: '#1f1f1f',
            color: '#fff',
            padding: 16,
            borderRadius: 6,
            height: 400,
            overflow: 'auto',
            fontFamily: 'monospace'
          }}>
            <div style={{ color: '#52c41a' }}>[INFO] 正在初始化项目...</div>
            <div style={{ color: '#52c41a' }}>[INFO] 安装依赖包...</div>
            <div style={{ color: '#1890ff' }}>[INFO] Dependencies installed successfully</div>
            <div style={{ color: '#52c41a' }}>[INFO] 启动开发服务器...</div>
            <div style={{ color: '#1890ff' }}>[INFO] webpack compiled successfully</div>
            <div style={{ color: '#52c41a' }}>[INFO] 本地服务器已启动: http://localhost:3000</div>
            <div style={{ color: '#faad14' }}>[WARN] Some warnings were found during compilation</div>
            <div style={{ color: '#52c41a' }}>[INFO] 项目运行正常</div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      title="预览测试"
      subTitle="查看生成的代码和在线预览效果"
      extra={[
        <Button key="deploy" type="primary" onClick={handleDeploy}>
          部署项目
        </Button>,
      ]}
    >
      <Tabs defaultActiveKey="files" items={tabItems} />

      <Modal
        title="部署项目"
        open={deployModalVisible}
        onOk={handleDeploySubmit}
        onCancel={() => setDeployModalVisible(false)}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <label>部署平台：</label>
          <Select defaultValue="vercel" style={{ width: '100%', marginTop: 8 }}>
            <Select.Option value="vercel">Vercel</Select.Option>
            <Select.Option value="netlify">Netlify</Select.Option>
            <Select.Option value="github-pages">GitHub Pages</Select.Option>
          </Select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>项目名称：</label>
          <Input placeholder="输入部署项目名称" style={{ marginTop: 8 }} />
        </div>
        <div>
          <label>部署说明：</label>
          <TextArea
            rows={3}
            placeholder="可选：添加部署说明"
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Preview;