# 基金合同管理系统 (Fund Contract Management System)

> 给私募公司运营人员用的合同管理平台，覆盖基金全生命周期，管理节点并基于 AI 提取合同关键信息。

---

## ✨ 功能概览

| 模块       | 功能                                                       |
| ---------- | ---------------------------------------------------------- |
| 基金列表页 | 新建/编辑/删除基金、按名称或代码搜索、查看基金详情          |
| 基金详情页 | 编辑基金、按节点类型（首次/变更/分红/临开/自定义）管理节点 |
| 节点管理   | 创建节点、上传文件、删除节点、查看节点详情                  |
| AI 智能提取 | 调用 DeepSeek 自动从合同文本提取关键字段，可编辑后保存      |
| 信息可视化 | 顶部 Dashboard 统计卡片（基金数、节点数、文件数、今日新增）  |

---

## 🧱 技术栈

- **后端**：Python 3 + Flask + SQLite（标准库，无需 ORM）
- **前端**：原生 HTML + CSS + 原生 JavaScript（无框架依赖）
- **AI**：DeepSeek Chat Completion API
- **依赖**：`flask`、`werkzeug`（用于文件名安全处理）

> 解析能力：支持 PDF（`pdfplumber`）、Word（`python-docx`）、图片（`pytesseract` OCR）。

---

## 🚀 快速开始

```bash
# 安装依赖
pip install flask werkzeug pdfplumber python-docx pytesseract

# 初始化数据库（如未运行过）
python init_db.py

# 启动服务
python app.py
```

启动后访问：**http://127.0.0.1:5000/**

---

## 📂 目录结构

```
合同解析/
├── app.py                 # Flask 主程序（所有 API）
├── init_db.py             # 初始化数据库脚本
├── insert_sample_data.py  # 示例数据插入脚本
├── fund_management.db     # SQLite 数据库文件
├── templates/             # Jinja2 模板
│   ├── index.html         # 基金列表页
│   └── detail.html        # 基金详情页
├── static/                # 静态资源
│   ├── css/style.css      # 全局样式（v2 现代化 + 多端适配）
│   └── js/app.js          # 全局前端交互逻辑
├── uploads/               # 用户上传的合同文件
└── readme.md              # 本文件
```

---

## 🎨 页面设计规范（v2）

- **现代化视觉**：渐变色 Hero、毛玻璃统计卡、卡片化布局
- **响应式优先**：
  - ≥1600px：容器放宽到 1560px、Hero 加宽
  - 1366×768 / 1440×900：标准布局
  - 1024 / 768 / <768：自动收紧、按钮堆叠、表格精简
- **跨系统兼容**：`font-family` 兼容 Windows / macOS / Linux
- **交互细节**：
  - Toast 改为可堆叠容器，3.5 秒自动淡出（可同时出现多条）
  - 模态框淡入缩放动画
  - 按钮 hover/active 反馈
  - 表格悬停高亮、节点卡片悬停微浮起

---

## 🔌 API 接口一览

| 方法   | 路径                                         | 说明                  |
| ------ | -------------------------------------------- | --------------------- |
| GET    | `/api/stats`                                 | 首页 Dashboard 统计   |
| GET    | `/api/funds?search=关键词`                   | 基金列表（支持搜索）  |
| POST   | `/api/funds`                                 | 新建基金              |
| GET    | `/api/funds/<id>`                            | 基金详情              |
| PUT    | `/api/funds/<id>`                            | 更新基金              |
| DELETE | `/api/funds/<id>`                            | 删除基金              |
| GET    | `/api/funds/<id>/nodes`                      | 节点的列表            |
| POST   | `/api/funds/<id>/nodes`                      | 创建节点              |
| GET    | `/api/nodes/<id>`                            | 节点详情              |
| DELETE | `/api/nodes/<id>`                            | 删除节点              |
| POST   | `/api/nodes/<id>/ai-extract`                 | AI 智能提取信息       |
| GET    | `/api/nodes/<id>/extraction`                 | 获取提取信息          |
| POST   | `/api/nodes/<id>/extraction`                 | 保存提取信息          |
| POST   | `/api/nodes/<id>/upload`                     | 上传合同文件          |
| GET    | `/api/nodes/<id>/files`                      | 文件列表              |
| DELETE | `/api/nodes/<id>/files/<file_id>`            | 删除文件              |
| GET    | `/api/nodes/<id>/files/<file_id>/download`   | 下载文件              |

返回结构（统一）：

```json
{ "code": 200, "message": "success", "data": ... }
```

---

## 📝 数据库表结构

- **funds**：基金主表（id / code / name / created_at / updated_at）
- **nodes**：节点表（id / fund_id / node_type / created_at / updated_at）
- **extractions**：提取信息表（按 node_type 存不同字段）
- **files**：上传文件元数据（id / node_id / filename / file_size / file_path / upload_time）

---

## 🧠 AI 提取字段映射

### 首次 / 变更 节点
产品全称、基金托管人、成立时间、投资经理、策略、认申购费、托管费&运营外包费、基金风险收益特征、锁定期、年管理费、业绩报酬、投资范围、投资比例

### 分红 节点
分红次数、分红日期、分红金额

### 自定义 节点
备注信息

---

## 🛠 常见问题

1. **端口被占用**：修改 `app.py` 末尾的 `port=5000` 即可。
2. **上传失败**：默认上限 16MB，可在 `app.py` 修改 `MAX_CONTENT_LENGTH`。
3. **AI 提取失败**：检查 `DEEPSEEK_API_KEY` 是否还有余额，或合同文本是否过短（< 50 字符）。

---

## 📌 后续可扩展

- [ ] 用户/权限系统（多运营人员隔离）
- [ ] 审计日志（关键操作追溯）
- [ ] 多份合同合并提取
- [ ] 提取信息导出 Excel / PDF
- [ ] 数据看板（基金规模、变更频率统计图）
