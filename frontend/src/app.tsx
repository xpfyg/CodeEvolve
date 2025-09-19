import { RunTimeLayoutConfig } from '@umijs/max';
import { UserOutlined, CodeOutlined, RobotOutlined, EyeOutlined, CloudUploadOutlined } from '@ant-design/icons';

export const layout: RunTimeLayoutConfig = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    menuDataRender: () => [
      {
        path: '/template',
        name: '模板管理',
        icon: <CodeOutlined />,
      },
      {
        path: '/codegen',
        name: '代码生成',
        icon: <CodeOutlined />,
      },
      {
        path: '/ai-custom',
        name: 'AI定制',
        icon: <RobotOutlined />,
      },
      {
        path: '/preview',
        name: '预览测试',
        icon: <EyeOutlined />,
      },
      {
        path: '/publish',
        name: '发布部署',
        icon: <CloudUploadOutlined />,
      },
    ],
    avatarProps: {
      icon: <UserOutlined />,
    },
  };
};

export async function getInitialState() {
  return {
    currentUser: {
      name: '开发者',
      avatar: '',
    },
  };
}