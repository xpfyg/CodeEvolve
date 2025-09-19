import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'CodeEvolve',
    locale: false,
  },
  routes: [
    {
      path: '/',
      redirect: '/template',
    },
    {
      name: '模板管理',
      path: '/template',
      component: './Template',
    },
    {
      name: '代码生成',
      path: '/codegen',
      component: './CodeGen',
    },
    {
      name: 'AI定制',
      path: '/ai-custom',
      component: './AICustom',
    },
    {
      name: '预览测试',
      path: '/preview',
      component: './Preview',
    },
    {
      name: '发布部署',
      path: '/publish',
      component: './Publish',
    },
  ],
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' },
    },
    '/ai-api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: { '^/ai-api': '' },
    },
  },
});