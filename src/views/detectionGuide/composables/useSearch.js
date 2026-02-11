import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';

/**
 * 搜索功能组合式函数
 * 用于处理检测项目的搜索逻辑
 */
export function useSearch() {
  // 搜索关键词
  const searchKeyword = ref('');
  // 搜索结果
  const searchResults = ref([]);
  // 搜索中状态
  const isSearching = ref(false);
  // 搜索模式状态
  const isSearchMode = ref(false);

  /**
   * 执行搜索
   * @param {string} keyword - 搜索关键词
   * @returns {Promise<Array>} 搜索结果
   */
  const performSearch = async (keyword) => {
    // 确保keyword是字符串类型
    const searchTerm = typeof keyword === 'string' ? keyword : '';
    
    // 禁止空参搜索
    if (!searchTerm || !searchTerm.trim()) {
      ElMessage.warning('请输入搜索关键词');
      return [];
    }

    isSearching.value = true;

    try {
      // 构建搜索URL
      const searchUrl = `/api/public/detection/items/search?keyword=${encodeURIComponent(searchTerm)}`;
      
      // 使用公开接口进行搜索
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.code === 200) {
        searchResults.value = data.data;
        isSearchMode.value = true;
        return data.data;
      } else {
        ElMessage.error('搜索失败：' + data.message);
        searchResults.value = [];
        isSearchMode.value = false;
        return [];
      }
    } catch (error) {
      ElMessage.error('搜索请求失败，请稍后重试');
      searchResults.value = [];
      isSearchMode.value = false;
      return [];
    } finally {
      isSearching.value = false;
    }
  };

  /**
   * 处理搜索表单提交
   * @returns {Promise<void>}
   */
  const handleSearch = async () => {
    // 确保搜索关键词是字符串类型
    if (typeof searchKeyword.value !== 'string') {
      searchKeyword.value = '';
    }
    // 执行搜索操作
    await performSearch(searchKeyword.value);
  };

  /**
   * 清除搜索
   */
  const clearSearch = () => {
    searchKeyword.value = '';
    searchResults.value = [];
    isSearchMode.value = false;
  };

  /**
   * 退出搜索模式
   */
  const exitSearchMode = () => {
    isSearchMode.value = false;
  };

  /**
   * 设置搜索关键词
   * @param {string} keyword - 搜索关键词
   */
  const setSearchKeyword = (keyword) => {
    searchKeyword.value = typeof keyword === 'string' ? keyword : '';
  };

  /**
   * 获取搜索结果数量
   * @returns {number} 搜索结果数量
   */
  const getSearchResultsCount = () => {
    return searchResults.value.length;
  };

  return {
    searchKeyword,
    searchResults,
    isSearching,
    isSearchMode,
    performSearch,
    handleSearch,
    clearSearch,
    exitSearchMode,
    setSearchKeyword,
    getSearchResultsCount
  };
}
