// next.config.js
const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
    lessVarsFilePath: './styles/variables.less',
    webpack(config) {
        return config;
    },
});
