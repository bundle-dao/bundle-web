// next.config.js
const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
  modifyVars: { '@primary-color': '#E7694C' },
  webpack(config) {
    return config;
  },
});