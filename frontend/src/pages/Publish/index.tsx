import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Steps, Form, Input, Select, Button, Upload, Progress, Table, Tag, message, Modal, Space } from 'antd';
import { CloudUploadOutlined, RocketOutlined, CheckCircleOutlined, ExclamationCircleOutlined, EyeOutlined, SettingOutlined, HistoryOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { TextArea } = Input;

interface DeployRecord {
  id: string;
  projectName: string;
  platform: string;
  status: 'success' | 'failed' | 'deploying';
  url?: string;
  deployTime: string;
  version: string;
}

const Publish: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployRecords, setDeployRecords] = useState<DeployRecord[]>([
    {
      id: '1',
      projectName: 'react-admin-v1.0',
      platform: 'Vercel',
      status: 'success',
      url: 'https://my-project-abc123.vercel.app',
      deployTime: '2024-01-15 14:30:22',
      version: 'v1.0.0',
    },
    {
      id: '2',
      projectName: 'vue-dashboard-v2.1',
      platform: 'Netlify',
      status: 'success',
      url: 'https://gracious-curie-abc123.netlify.app',
      deployTime: '2024-01-14 09:15:10',
      version: 'v2.1.0',
    },
    {
      id: '3',
      projectName: 'go-api-service',
      platform: 'Railway',
      status: 'failed',
      deployTime: '2024-01-13 16:45:33',
      version: 'v1.2.0',
    },
  ]);

  const [configModalVisible, setConfigModalVisible] = useState(false);

  const handleNext = () => {
    form.validateFields().then(() => {
      setCurrent(current + 1);
    });
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const handleDeploy = async () => {
    try {
      setDeploying(true);
      setDeployProgress(0);

      const values = await form.validateFields();

      // 模拟部署过程
      const steps = [
        { step: 20, message: '正在构建项目...' },
        { step: 40, message: '正在上传文件...' },
        { step: 60, message: '正在配置服务器...' },
        { step: 80, message: '正在启动服务...' },
        { step: 100, message: '部署完成！' },
      ];

      for (const { step, message } of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDeployProgress(step);
        if (step < 100) {
          message.info(message);
        }
      }

      // 添加部署记录
      const newRecord: DeployRecord = {
        id: Date.now().toString(),
        projectName: values.projectName,
        platform: values.platform,
        status: 'success',
        url: `https://${values.projectName.toLowerCase()}-${Math.random().toString(36).substr(2, 6)}.${values.platform.toLowerCase()}.app`,
        deployTime: new Date().toLocaleString(),
        version: values.version || 'v1.0.0',
      };

      setDeployRecords([newRecord, ...deployRecords]);
      message.success('项目部署成功！');
      setCurrent(current + 1);

    } catch (error) {
      message.error('部署失败，请检查配置');
    } finally {
      setDeploying(false);
      setDeployProgress(0);
    }
  };

  const handleViewProject = (url: string) => {
    window.open(url, '_blank');
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => <Tag color="blue">{platform}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          success: 'green',
          failed: 'red',
          deploying: 'orange',
        };
        const icons = {
          success: <CheckCircleOutlined />,
          failed: <ExclamationCircleOutlined />,
          deploying: <CloudUploadOutlined />,
        };
        return (
          <Tag color={colors[status as keyof typeof colors]} icon={icons[status as keyof typeof icons]}>
            {status === 'success' ? '成功' : status === 'failed' ? '失败' : '部署中'}
          </Tag>
        );
      },
    },
    {
      title: '访问地址',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ) : '-',
    },
    {
      title: '部署时间',
      dataIndex: 'deployTime',
      key: 'deployTime',
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <Tag>{version}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: DeployRecord) => (
        <Space>
          {record.url && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewProject(record.url!)}
            >
              访问
            </Button>
          )}
          <Button size="small" icon={<SettingOutlined />}>
            配置
          </Button>
        </Space>
      ),
    },
  ];

  const steps = [
    {
      title: '项目配置',
      icon: <SettingOutlined />,
      content: (
        <Card title="配置项目信息">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="projectName"
                  label="项目名称"
                  rules={[{ required: true, message: '请输入项目名称' }]}
                >
                  <Input placeholder="输入项目名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="version"
                  label="版本号"
                  rules={[{ required: true, message: '请输入版本号' }]}
                >
                  <Input placeholder="如：v1.0.0" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="项目描述"
            >
              <TextArea rows={3} placeholder="输入项目描述" />
            </Form.Item>
            <Form.Item
              name="platform"
              label="部署平台"
              rules={[{ required: true, message: '请选择部署平台' }]}
            >
              <Select placeholder="选择部署平台">
                <Select.Option value="Vercel">
                  <Space>
                    <span>Vercel</span>
                    <Tag color="blue">推荐</Tag>
                  </Space>
                </Select.Option>
                <Select.Option value="Netlify">Netlify</Select.Option>
                <Select.Option value="GitHub Pages">GitHub Pages</Select.Option>
                <Select.Option value="Railway">Railway</Select.Option>
                <Select.Option value="Heroku">Heroku</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: '环境变量',
      icon: <SettingOutlined />,
      content: (
        <Card title="配置环境变量">
          <Form form={form} layout="vertical">
            <Form.Item label="环境变量配置">
              <TextArea
                rows={8}
                placeholder={`请输入环境变量，每行一个，格式如下：
REACT_APP_API_URL=https://api.example.com
REACT_APP_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key`}
              />
            </Form.Item>
            <Form.Item name="buildCommand" label="构建命令">
              <Input placeholder="npm run build" />
            </Form.Item>
            <Form.Item name="startCommand" label="启动命令">
              <Input placeholder="npm start" />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: '部署执行',
      icon: <RocketOutlined />,
      content: (
        <Card title="执行部署">
          {deploying ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Progress
                type="circle"
                percent={deployProgress}
                style={{ marginBottom: 16 }}
              />
              <div>正在部署项目，请稍候...</div>
              <div style={{ marginTop: 8, color: '#666' }}>
                预计需要 2-3 分钟
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                onClick={handleDeploy}
              >
                开始部署
              </Button>
              <div style={{ marginTop: 16, color: '#666' }}>
                点击开始部署项目到选定平台
              </div>
            </div>
          )}
        </Card>
      ),
    },
    {
      title: '部署完成',
      icon: <CheckCircleOutlined />,
      content: (
        <Card title="部署成功">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircleOutlined
              style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }}
            />
            <h3>🎉 项目部署成功！</h3>
            <p>您的项目已成功部署到生产环境</p>
            <div style={{ marginTop: 24 }}>
              <Space size="large">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    const latestRecord = deployRecords[0];
                    if (latestRecord?.url) {
                      handleViewProject(latestRecord.url);
                    }
                  }}
                >
                  访问项目
                </Button>
                <Button onClick={() => setCurrent(0)}>
                  部署新项目
                </Button>
                <Button
                  icon={<HistoryOutlined />}
                  onClick={() => setCurrent(4)}
                >
                  查看记录
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      ),
    },
    {
      title: '部署历史',
      icon: <HistoryOutlined />,
      content: (
        <Card
          title="部署历史记录"
          extra={
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => setConfigModalVisible(true)}
            >
              平台配置
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={deployRecords}
            rowKey="id"
            pagination={false}
          />
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      title="发布部署"
      subTitle="将生成的项目部署到云平台"
      extra={[
        <Button key="history" icon={<HistoryOutlined />} onClick={() => setCurrent(4)}>
          部署历史
        </Button>,
      ]}
    >
      <Card>
        <Steps current={current} style={{ marginBottom: 24 }}>
          {steps.map((item, index) => (
            <Step
              key={item.title}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </Steps>

        <div style={{ marginBottom: 24 }}>
          {steps[current].content}
        </div>

        <div style={{ textAlign: 'center' }}>
          {current > 0 && current < steps.length - 1 && current !== 2 && (
            <Button style={{ marginRight: 8 }} onClick={handlePrev}>
              上一步
            </Button>
          )}
          {current < steps.length - 2 && current !== 2 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => setCurrent(0)}>
              部署新项目
            </Button>
          )}
        </div>
      </Card>

      <Modal
        title="平台配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            message.success('配置保存成功');
            setConfigModalVisible(false);
          }}>
            保存
          </Button>,
        ]}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Vercel Token">
            <Input.Password placeholder="输入 Vercel API Token" />
          </Form.Item>
          <Form.Item label="GitHub Token">
            <Input.Password placeholder="输入 GitHub Personal Access Token" />
          </Form.Item>
          <Form.Item label="Netlify Token">
            <Input.Password placeholder="输入 Netlify API Token" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Publish;