// ========================================
// 基金合同管理系统 - 前端交互逻辑
// ========================================

// API 基础路径
const API_BASE = '/api';

// 全局变量
let currentDeleteTarget = null;  // 当前删除目标
let currentExtractionNodeId = null;  // 当前提取信息的节点ID
let currentNodeType = null;  // 当前节点类型

// ========================================
// 工具函数
// ========================================

/**
 * 显示消息提示（写入 toast-container，可堆叠）
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: success, error, warning, info
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        // 兜底：找不到容器则直接 alert
        console.log(`[Toast ${type}] ${message}`);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    // 3.5 秒后淡出并移除
    setTimeout(() => {
        toast.style.transition = 'opacity .3s, transform .3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 320);
    }, 3500);
}

/**
 * 格式化日期时间
 * @param {string} datetime - ISO 格式的日期时间字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDateTime(datetime) {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 格式化日期
 * @param {string} date - ISO 格式的日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN');
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的大小字符串
 */
function formatFileSize(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * 获取文件图标
 * @param {string} filename - 文件名
 * @returns {string} 图标字符
 */
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📕',
        'doc': '📘',
        'docx': '📘',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️'
    };
    return icons[ext] || '📄';
}

// ========================================
// API 请求函数
// ========================================

/**
 * 发送 GET 请求
 */
async function apiGet(url) {
    const response = await fetch(API_BASE + url);
    const result = await response.json();
    if (result.code !== 200) {
        throw new Error(result.message || '请求失败');
    }
    return result.data;
}

/**
 * 发送 POST 请求
 */
async function apiPost(url, data) {
    const response = await fetch(API_BASE + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.code !== 200) {
        throw new Error(result.message || '请求失败');
    }
    return result.data;
}

/**
 * 发送 PUT 请求
 */
async function apiPut(url, data) {
    const response = await fetch(API_BASE + url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.code !== 200) {
        throw new Error(result.message || '请求失败');
    }
    return result.data;
}

/**
 * 发送 DELETE 请求
 */
async function apiDelete(url) {
    const response = await fetch(API_BASE + url, { method: 'DELETE' });
    const result = await response.json();
    if (result.code !== 200) {
        throw new Error(result.message || '请求失败');
    }
    return result.data;
}

// ========================================
// 基金列表页函数 (index.html)
// ========================================

/**
 * 加载基金列表
 */
async function loadFunds() {
    const tbody = document.getElementById('fundTableBody');
    if (!tbody) return;
    
    try {
        const funds = await apiGet('/funds');
        
        if (funds.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="icon">📁</div>
                            <p>暂无基金数据</p>
                            <button class="btn btn-primary" onclick="showCreateFundModal()">创建第一个基金</button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = funds.map(fund => `
            <tr>
                <td><span class="code-badge">${escapeHtml(fund.code)}</span></td>
                <td><strong>${escapeHtml(fund.name)}</strong></td>
                <td>${formatDateTime(fund.created_at)}</td>
                <td>${formatDateTime(fund.updated_at)}</td>
                <td style="text-align:right">
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="viewFund(${fund.id})">查看详情</button>
                        <button class="btn btn-sm btn-default" onclick="editFund(${fund.id})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteFund(${fund.id}, '${escapeHtml(fund.name)}')">删除</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="color: red; text-align: center;">
                    加载失败: ${error.message}
                </td>
            </tr>
        `;
        showToast('加载基金列表失败', 'error');
    }
}

/**
 * HTML 转义，防止 XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 处理搜索
 */
function handleSearch(event) {
    if (event.key === 'Enter') {
        const keyword = document.getElementById('searchInput').value.trim();
        loadFundsBySearch(keyword);
    }
}

/**
 * 按关键词搜索基金
 */
async function loadFundsBySearch(keyword) {
    const tbody = document.getElementById('fundTableBody');
    if (!tbody) return;
    
    try {
        const url = keyword ? `/funds?search=${encodeURIComponent(keyword)}` : '/funds';
        const funds = await apiGet(url);
        
        if (funds.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="icon">🔍</div>
                            <p>没有找到匹配的基金</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = funds.map(fund => `
            <tr>
                <td><span class="code-badge">${escapeHtml(fund.code)}</span></td>
                <td><strong>${escapeHtml(fund.name)}</strong></td>
                <td>${formatDateTime(fund.created_at)}</td>
                <td>${formatDateTime(fund.updated_at)}</td>
                <td style="text-align:right">
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="viewFund(${fund.id})">查看详情</button>
                        <button class="btn btn-sm btn-default" onclick="editFund(${fund.id})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteFund(${fund.id}, '${escapeHtml(fund.name)}')">删除</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('搜索失败: ' + error.message, 'error');
    }
}

// ========================================
// 基金模态框函数
// ========================================

/**
 * 显示新建基金模态框
 */
function showCreateFundModal() {
    document.getElementById('fundModalTitle').textContent = '新建基金';
    document.getElementById('fundId').value = '';
    document.getElementById('fundCode').value = '';
    document.getElementById('fundName').value = '';
    document.getElementById('fundCode').disabled = false;
    document.getElementById('fundModal').classList.add('active');
}

/**
 * 关闭基金模态框
 */
function closeFundModal() {
    document.getElementById('fundModal').classList.remove('active');
}

/**
 * 编辑基金
 */
async function editFund(fundId) {
    try {
        const fund = await apiGet(`/funds/${fundId}`);
        document.getElementById('fundModalTitle').textContent = '编辑基金';
        document.getElementById('fundId').value = fund.id;
        document.getElementById('fundCode').value = fund.code;
        document.getElementById('fundName').value = fund.name;
        document.getElementById('fundCode').disabled = true;  // 禁止修改代码
        document.getElementById('fundModal').classList.add('active');
    } catch (error) {
        showToast('获取基金信息失败', 'error');
    }
}

/**
 * 保存基金（新建或更新）
 */
async function saveFund() {
    const fundId = document.getElementById('fundId').value;
    const code = document.getElementById('fundCode').value.trim();
    const name = document.getElementById('fundName').value.trim();
    
    if (!code || !name) {
        showToast('请填写完整信息', 'warning');
        return;
    }
    
    try {
        if (fundId) {
            // 更新
            await apiPut(`/funds/${fundId}`, { name, code });
            showToast('基金更新成功', 'success');
        } else {
            // 新建
            await apiPost('/funds', { name, code });
            showToast('基金创建成功', 'success');
        }
        
        closeFundModal();
        loadFunds();
    } catch (error) {
        showToast('保存失败: ' + error.message, 'error');
    }
}

/**
 * 查看基金详情
 */
function viewFund(fundId) {
    window.location.href = `/detail/${fundId}`;
}

// ========================================
// 顶部统计 (index.html)
// ========================================

/**
 * 加载首页顶部统计数据
 */
async function loadHeaderStats() {
    if (!document.getElementById('statTotal')) return;
    try {
        const stats = await apiGet('/stats');
        document.getElementById('statTotal').textContent = stats.total_funds ?? 0;
        document.getElementById('statToday').textContent = stats.today_funds ?? 0;
        document.getElementById('statNodes').textContent = stats.total_nodes ?? 0;
        document.getElementById('statFiles').textContent = stats.total_files ?? 0;
    } catch (e) {
        // 失败时不阻塞页面展示
        document.getElementById('statTotal').textContent = '0';
        document.getElementById('statToday').textContent = '0';
        document.getElementById('statNodes').textContent = '0';
        document.getElementById('statFiles').textContent = '0';
    }
}

// ========================================
// 删除确认函数
// ========================================

/**
 * 删除基金
 */
function deleteFund(fundId, fundName) {
    currentDeleteTarget = { type: 'fund', id: fundId };
    document.getElementById('deleteMessage').textContent = 
        `确定要删除基金「${fundName}」吗？此操作会同时删除所有节点和文件，且不可恢复。`;
    document.getElementById('deleteModal').classList.add('active');
}

/**
 * 关闭删除确认模态框
 */
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentDeleteTarget = null;
}

/**
 * 确认删除
 */
async function confirmDelete() {
    if (!currentDeleteTarget) return;
    
    try {
        if (currentDeleteTarget.type === 'fund') {
            await apiDelete(`/funds/${currentDeleteTarget.id}`);
            showToast('基金删除成功', 'success');
            loadFunds();
        } else if (currentDeleteTarget.type === 'node') {
            await apiDelete(`/nodes/${currentDeleteTarget.id}`);
            showToast('节点删除成功', 'success');
            loadNodes(currentFundId);
        }
    } catch (error) {
        showToast('删除失败: ' + error.message, 'error');
    }
    
    closeDeleteModal();
}

// ========================================
// 基金详情页函数 (detail.html)
// ========================================

/**
 * 加载基金详情
 */
async function loadFundDetail(fundId) {
    try {
        const fund = await apiGet(`/funds/${fundId}`);
        
        // 更新面包屑
        document.getElementById('fundBreadcrumb').textContent = fund.name;
        document.title = `${fund.name} - 基金详情`;
        
        // 更新基金信息显示
        const grid = document.getElementById('fundInfoGrid');
        grid.innerHTML = `
            <div class="info-item">
                <span class="label">基金代码</span>
                <span class="value">${escapeHtml(fund.code)}</span>
            </div>
            <div class="info-item">
                <span class="label">基金名称</span>
                <span class="value">${escapeHtml(fund.name)}</span>
            </div>
            <div class="info-item">
                <span class="label">创建时间</span>
                <span class="value">${formatDateTime(fund.created_at)}</span>
            </div>
            <div class="info-item">
                <span class="label">更新时间</span>
                <span class="value">${formatDateTime(fund.updated_at)}</span>
            </div>
        `;
        
        // 更新编辑模态框
        document.getElementById('fundId').value = fund.id;
        document.getElementById('fundCode').value = fund.code;
        document.getElementById('fundName').value = fund.name;
        
    } catch (error) {
        showToast('加载基金详情失败', 'error');
    }
}

/**
 * 显示编辑基金模态框（从详情页）
 */
function showEditFundModal() {
    document.getElementById('fundModalTitle').textContent = '编辑基金';
    document.getElementById('fundCode').disabled = true;
    document.getElementById('fundModal').classList.add('active');
}

// ========================================
// 节点列表函数
// ========================================

/**
 * 加载节点列表
 */
async function loadNodes(fundId) {
    const container = document.getElementById('nodesContainer');
    if (!container) return;
    
    try {
        const nodes = await apiGet(`/funds/${fundId}/nodes`);
        
        if (nodes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <p>暂无节点数据</p>
                    <button class="btn btn-primary" onclick="showCreateNodeModal()">创建第一个节点</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = nodes.map(node => `
            <div class="node-card">
                <div class="node-card-header">
                    <div class="node-card-title">
                        <span class="tag ${node.node_type}">${node.node_type}</span>
                        <span style="color: #999">${formatDateTime(node.created_at)}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="viewNodeDetail(${node.id})">查看详情</button>
                        <button class="btn btn-sm btn-default" onclick="deleteNode(${node.id})">删除</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color: red; text-align: center;">加载失败: ${error.message}</div>`;
        showToast('加载节点列表失败', 'error');
    }
}

/**
 * 显示创建节点模态框
 */
function showCreateNodeModal() {
    document.getElementById('nodeType').value = '';
    document.getElementById('nodeModal').classList.add('active');
}

/**
 * 关闭节点模态框
 */
function closeNodeModal() {
    document.getElementById('nodeModal').classList.remove('active');
}

/**
 * 保存节点
 */
async function saveNode() {
    const nodeType = document.getElementById('nodeType').value;
    
    if (!nodeType) {
        showToast('请选择节点类型', 'warning');
        return;
    }
    
    try {
        const node = await apiPost(`/funds/${currentFundId}/nodes`, { node_type: nodeType });
        showToast('节点创建成功', 'success');
        closeNodeModal();
        
        // 自动打开上传模态框
        showUploadModal(node.id);
    } catch (error) {
        showToast('创建节点失败: ' + error.message, 'error');
    }
}

/**
 * 删除节点
 */
function deleteNode(nodeId) {
    currentDeleteTarget = { type: 'node', id: nodeId };
    document.getElementById('deleteMessage').textContent = '确定要删除这个节点吗？此操作不可恢复。';
    document.getElementById('deleteModal').classList.add('active');
}

// ========================================
// 节点详情函数
// ========================================

/**
 * 查看节点详情
 */
async function viewNodeDetail(nodeId) {
    const content = document.getElementById('nodeDetailContent');
    content.innerHTML = '<div class="loading">加载中...</div>';
    document.getElementById('nodeDetailModal').classList.add('active');
    
    try {
        const node = await apiGet(`/nodes/${nodeId}`);
        currentNodeType = node.node_type;
        
        let extractionHtml = '';
        if (node.extraction) {
            extractionHtml = renderExtractionInfo(node.extraction, node.node_type);
        } else {
            extractionHtml = '<p style="color: #999; text-align: center;">暂无提取信息</p>';
        }
        
        let filesHtml = '';
        if (node.files && node.files.length > 0) {
            filesHtml = node.files.map(f => `
                <div class="file-item">
                    <span class="file-icon">${getFileIcon(f.filename)}</span>
                    <span class="file-name">${escapeHtml(f.filename)}</span>
                    <span class="file-size">${formatFileSize(f.file_size)}</span>
                    <span style="color: #999; font-size: 12px;">${formatDateTime(f.upload_time)}</span>
                </div>
            `).join('');
        } else {
            filesHtml = '<p style="color: #999; text-align: center;">暂无上传文件</p>';
        }
        
        content.innerHTML = `
            <div class="info-grid" style="margin-bottom: 20px;">
                <div class="info-item">
                    <span class="label">节点类型</span>
                    <span class="value"><span class="tag ${node.node_type}">${node.node_type}</span></span>
                </div>
                <div class="info-item">
                    <span class="label">创建时间</span>
                    <span class="value">${formatDateTime(node.created_at)}</span>
                </div>
            </div>
            
            <div class="extraction-section">
                <div class="extraction-title">📊 提取信息</div>
                ${extractionHtml}
                <div style="margin-top: 16px; display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="editExtraction(${nodeId})">
                        ${node.extraction ? '编辑提取信息' : '添加提取信息'}
                    </button>
                    <button class="btn btn-success" onclick="extractWithAI(${nodeId})">
                        🤖 AI智能提取
                    </button>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <div class="extraction-title">📎 上传文件</div>
                <div class="file-list">
                    ${filesHtml}
                </div>
                <div style="margin-top: 12px;">
                    <button class="btn btn-default" onclick="showUploadModal(${nodeId})">上传文件</button>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div style="color: red; text-align: center;">加载失败: ${error.message}</div>`;
    }
}

/**
 * 关闭节点详情模态框
 */
function closeNodeDetailModal() {
    document.getElementById('nodeDetailModal').classList.remove('active');
}

/**
 * 渲染提取信息
 */
function renderExtractionInfo(extraction, nodeType) {
    if (nodeType === '首次' || nodeType === '变更') {
        return `
            <div class="info-grid">
                <div class="info-item"><span class="label">产品全称</span><span class="value">${extraction.product_name || '-'}</span></div>
                <div class="info-item"><span class="label">基金托管人</span><span class="value">${extraction.custodian || '-'}</span></div>
                <div class="info-item"><span class="label">成立时间</span><span class="value">${formatDate(extraction.establish_date)}</span></div>
                <div class="info-item"><span class="label">投资经理</span><span class="value">${extraction.investment_manager || '-'}</span></div>
                <div class="info-item"><span class="label">策略</span><span class="value">${extraction.strategy || '-'}</span></div>
                <div class="info-item"><span class="label">认申购费</span><span class="value">${extraction.subscription_fee || '-'}</span></div>
                <div class="info-item"><span class="label">托管费</span><span class="value">${extraction.custody_fee || '-'}</span></div>
                <div class="info-item"><span class="label">风险收益</span><span class="value">${extraction.risk_return || '-'}</span></div>
                <div class="info-item"><span class="label">锁定期</span><span class="value">${extraction.lock_period || '-'}</span></div>
                <div class="info-item"><span class="label">年管理费</span><span class="value">${extraction.annual_fee || '-'}</span></div>
                <div class="info-item"><span class="label">业绩报酬</span><span class="value">${extraction.performance_fee || '-'}</span></div>
                <div class="info-item"><span class="label">投资范围</span><span class="value">${extraction.investment_scope || '-'}</span></div>
                <div class="info-item" style="grid-column: span 2;"><span class="label">投资比例</span><span class="value">${extraction.investment_ratio || '-'}</span></div>
            </div>
        `;
    } else if (nodeType === '分红') {
        return `
            <div class="info-grid">
                <div class="info-item"><span class="label">分红次数</span><span class="value">${extraction.dividend_count || '-'}</span></div>
                <div class="info-item"><span class="label">分红日期</span><span class="value">${formatDate(extraction.dividend_date)}</span></div>
                <div class="info-item"><span class="label">分红金额</span><span class="value">${extraction.dividend_amount ? extraction.dividend_amount.toLocaleString() : '-'}</span></div>
            </div>
        `;
    } else {
        return `
            <div class="info-grid">
                <div class="info-item" style="grid-column: span 2;"><span class="label">备注</span><span class="value">${extraction.remark || '-'}</span></div>
            </div>
        `;
    }
}

// ========================================
// 文件上传函数
// ========================================

/**
 * 显示上传模态框
 */
function showUploadModal(nodeId) {
    document.getElementById('uploadNodeId').value = nodeId;
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadModal').classList.add('active');
}

/**
 * 关闭上传模态框
 */
function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
}

/**
 * 执行文件上传
 */
async function doUpload() {
    const nodeId = document.getElementById('uploadNodeId').value;
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('请选择文件', 'warning');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/nodes/${nodeId}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.code !== 200) {
            throw new Error(result.message || '上传失败');
        }
        
        showToast('文件上传成功', 'success');
        closeUploadModal();
        
        // 如果是查看详情后上传，刷新详情
        if (document.getElementById('nodeDetailModal').classList.contains('active')) {
            viewNodeDetail(nodeId);
        }
    } catch (error) {
        showToast('上传失败: ' + error.message, 'error');
    }
}

// ========================================
// 提取信息编辑函数
// ========================================

/**
 * 使用 AI 提取信息
 */
async function extractWithAI(nodeId) {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🤖 AI提取中...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/nodes/${nodeId}/ai-extract`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.code !== 200) {
            throw new Error(result.message || '提取失败');
        }
        
        showToast('AI 提取成功，请核对信息', 'success');
        
        // 打开编辑表单并填充数据
        await editExtractionWithData(nodeId, result.data);
        
    } catch (error) {
        showToast('提取失败: ' + error.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/**
 * 使用提取的数据打开编辑表单
 */
async function editExtractionWithData(nodeId, extractedData) {
    currentExtractionNodeId = nodeId;
    
    const container = document.getElementById('extractionFormContainer');
    const title = document.getElementById('extractionModalTitle');
    
    if (currentNodeType === '首次' || currentNodeType === '变更') {
        title.textContent = `${currentNodeType} - 提取信息（可编辑）`;
        container.innerHTML = getFirstChangeFormHtml(extractedData);
    } else if (currentNodeType === '分红') {
        title.textContent = '分红 - 提取信息（可编辑）';
        container.innerHTML = getDividendFormHtml(extractedData);
    } else {
        title.textContent = '自定义 - 提取信息（可编辑）';
        container.innerHTML = getCustomFormHtml(extractedData);
    }
    
    document.getElementById('extractionModal').classList.add('active');
}

/**
 * 编辑提取信息
 */
async function editExtraction(nodeId) {
    currentExtractionNodeId = nodeId;
    
    try {
        const extraction = await apiGet(`/nodes/${nodeId}/extraction`);
        
        // 根据节点类型显示不同表单
        const container = document.getElementById('extractionFormContainer');
        const title = document.getElementById('extractionModalTitle');
        
        if (currentNodeType === '首次' || currentNodeType === '变更') {
            title.textContent = `${currentNodeType} - 提取信息`;
            container.innerHTML = getFirstChangeFormHtml(extraction);
        } else if (currentNodeType === '分红') {
            title.textContent = '分红 - 提取信息';
            container.innerHTML = getDividendFormHtml(extraction);
        } else {
            title.textContent = '自定义 - 提取信息';
            container.innerHTML = getCustomFormHtml(extraction);
        }
        
        document.getElementById('extractionModal').classList.add('active');
    } catch (error) {
        showToast('加载提取信息失败', 'error');
    }
}

/**
 * 获取首次/变更节点的表单HTML
 */
function getFirstChangeFormHtml(extraction) {
    const data = extraction || {};
    return `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">产品全称</label>
                <input type="text" id="ext_product_name" value="${escapeHtml(data.product_name || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">基金托管人</label>
                <input type="text" id="ext_custodian" value="${escapeHtml(data.custodian || '')}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">成立时间</label>
                <input type="date" id="ext_establish_date" value="${data.establish_date || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">投资经理</label>
                <input type="text" id="ext_investment_manager" value="${escapeHtml(data.investment_manager || '')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">策略</label>
            <input type="text" id="ext_strategy" value="${escapeHtml(data.strategy || '')}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">认申购费</label>
                <input type="text" id="ext_subscription_fee" value="${escapeHtml(data.subscription_fee || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">托管费&运营外包费</label>
                <input type="text" id="ext_custody_fee" value="${escapeHtml(data.custody_fee || '')}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">基金风险收益特征</label>
                <input type="text" id="ext_risk_return" value="${escapeHtml(data.risk_return || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">锁定期</label>
                <input type="text" id="ext_lock_period" value="${escapeHtml(data.lock_period || '')}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">年管理费</label>
                <input type="text" id="ext_annual_fee" value="${escapeHtml(data.annual_fee || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">业绩报酬</label>
                <input type="text" id="ext_performance_fee" value="${escapeHtml(data.performance_fee || '')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">投资范围</label>
            <textarea id="ext_investment_scope" rows="2">${escapeHtml(data.investment_scope || '')}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">投资比例</label>
            <textarea id="ext_investment_ratio" rows="2">${escapeHtml(data.investment_ratio || '')}</textarea>
        </div>
    `;
}

/**
 * 获取分红节点的表单HTML
 */
function getDividendFormHtml(extraction) {
    const data = extraction || {};
    return `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">分红次数</label>
                <input type="number" id="ext_dividend_count" value="${data.dividend_count || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">分红日期</label>
                <input type="date" id="ext_dividend_date" value="${data.dividend_date || ''}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">分红金额</label>
            <input type="number" id="ext_dividend_amount" value="${data.dividend_amount || ''}" step="0.01">
        </div>
    `;
}

/**
 * 获取自定义节点的表单HTML
 */
function getCustomFormHtml(extraction) {
    const data = extraction || {};
    return `
        <div class="form-group">
            <label class="form-label">备注信息</label>
            <textarea id="ext_remark" rows="6" placeholder="请输入备注信息...">${escapeHtml(data.remark || '')}</textarea>
        </div>
    `;
}

/**
 * 关闭提取信息模态框
 */
function closeExtractionModal() {
    document.getElementById('extractionModal').classList.remove('active');
    currentExtractionNodeId = null;
}

/**
 * 保存提取信息
 */
async function saveExtraction() {
    if (!currentExtractionNodeId) return;
    
    let data = {};
    
    if (currentNodeType === '首次' || currentNodeType === '变更') {
        data = {
            product_name: document.getElementById('ext_product_name').value.trim(),
            custodian: document.getElementById('ext_custodian').value.trim(),
            establish_date: document.getElementById('ext_establish_date').value,
            investment_manager: document.getElementById('ext_investment_manager').value.trim(),
            strategy: document.getElementById('ext_strategy').value.trim(),
            subscription_fee: document.getElementById('ext_subscription_fee').value.trim(),
            custody_fee: document.getElementById('ext_custody_fee').value.trim(),
            risk_return: document.getElementById('ext_risk_return').value.trim(),
            lock_period: document.getElementById('ext_lock_period').value.trim(),
            annual_fee: document.getElementById('ext_annual_fee').value.trim(),
            performance_fee: document.getElementById('ext_performance_fee').value.trim(),
            investment_scope: document.getElementById('ext_investment_scope').value.trim(),
            investment_ratio: document.getElementById('ext_investment_ratio').value.trim()
        };
    } else if (currentNodeType === '分红') {
        data = {
            dividend_count: document.getElementById('ext_dividend_count').value,
            dividend_date: document.getElementById('ext_dividend_date').value,
            dividend_amount: document.getElementById('ext_dividend_amount').value
        };
    } else {
        data = {
            remark: document.getElementById('ext_remark').value.trim()
        };
    }
    
    try {
        await apiPost(`/nodes/${currentExtractionNodeId}/extraction`, data);
        showToast('提取信息保存成功', 'success');

        // 注意：closeExtractionModal() 会把 currentExtractionNodeId 清空，
        // 所以必须先把 nodeId 缓存起来，再去刷新详情
        const nodeIdToRefresh = currentExtractionNodeId;
        closeExtractionModal();

        // 刷新节点详情
        viewNodeDetail(nodeIdToRefresh);
    } catch (error) {
        showToast('保存失败: ' + error.message, 'error');
    }
}
