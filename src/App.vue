<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: white;
  color: #333;
  transition: background-color 0.3s, color 0.3s;
}

/* 全局文本元素默认样式 */
h1, h2, h3, h4, h5, h6 {
  color: #333;
  transition: color 0.3s;
}

p, span, div, a, li, ul, ol {
  color: #333;
  transition: color 0.3s;
}

/* 深色模式下的全局样式 */
.layout-container.dark body {
  background-color: #1a1a1a;
  color: #fff;
}

.layout-container.dark h1,
.layout-container.dark h2,
.layout-container.dark h3,
.layout-container.dark h4,
.layout-container.dark h5,
.layout-container.dark h6 {
  color: #fff;
}

.layout-container.dark p,
.layout-container.dark span,
.layout-container.dark div,
.layout-container.dark a,
.layout-container.dark li,
.layout-container.dark ul,
.layout-container.dark ol {
  color: #ddd;
}

/* 确保布局容器也应用主题样式 */
.layout-container {
  transition: background-color 0.3s;
}

/* 链接样式 */
a {
  color: #409eff;
  text-decoration: none;
  transition: color 0.3s;
}

.layout-container.dark a {
  color: #66b1ff;
}

/* 主内容区域文本样式 */
.main-content {
  color: inherit;
}

.main-content * {
  color: inherit;
}
</style>
