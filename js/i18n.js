/**
 * i18n.js
 * Language toggle (English / Tiếng Việt) for the whole dashboard.
 *
 * Design:
 *  - One flat dictionary per language. Every static label in index.html gets
 *    a `data-i18n="key"` (textContent) or `data-i18n-attr="attr:key"` (for
 *    placeholder/aria-label/title) attribute; `translateStaticDom()` walks
 *    the DOM once per language change and fills them in.
 *  - Dynamic modules (kpi.js render labels are static HTML already; but
 *    analytics.js, insight.js, table.js, heatmap.js, timeline.js, upload.js,
 *    app.js generate text in JS) import `t()` / `formatMonth()` /
 *    `formatQuarter()` from here so both languages come from ONE source.
 *  - Preference persists in localStorage (this is a real deployed site, not
 *    a claude.ai artifact, so localStorage is the correct, expected choice).
 */

const STORAGE_KEY = 'hr-dashboard-lang';

const DICT = {
  en: {
    'app.title': 'HR Analytics',
    'app.subtitle': 'New Hire Dashboard',
    'nav.dashboard': 'Dashboard',
    'nav.newhire': 'New Hire',
    'nav.recruitment': 'Recruitment',
    'nav.training': 'Training',
    'nav.probation': 'Probation',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.comingsoon': 'This section is not available in the current dashboard yet.',
    'darkmode': 'Dark Mode',
    'nav.darkmode': 'Dark Mode',
    'header.title': 'New Hire Dashboard',
    'breadcrumb.home': 'Home',
    'breadcrumb.dashboard': 'Dashboard',
    'lastupdated': 'Last updated:',
    'search.placeholder': 'Search...',
    'search.aria': 'Search dashboard',
    'upload.aria': 'Import Excel or CSV file',
    'notifications.aria': 'Notifications',
    'avatar.aria': 'User account menu',
    'lang.toggle.aria': 'Switch language',
    'nav.openMenu': 'Open navigation menu',

    'filters.title': 'Filters',
    'filters.subtitle': 'All filters apply together across KPIs, charts, and the table',
    'filters.year': 'Year',
    'filters.month': 'Month',
    'filters.department': 'Department',
    'filters.position': 'Position',
    'filters.location': 'Location',
    'filters.manager': 'Manager',
    'filters.allyears': 'All years',
    'filters.allmonths': 'All months',
    'filters.alldepartments': 'All departments',
    'filters.allpositions': 'All positions',
    'filters.alllocations': 'All locations',
    'filters.allmanagers': 'All managers',
    'filters.reset': 'Reset Filters',
    'filters.active': 'Active filters',
    'filters.removeChip': 'Remove {{label}} filter: {{value}}',

    'drilldown.clear': 'Clear drill-down',
    'drilldown.text': 'Drilled down by {{label}} — every chart, KPI, and the table are filtered to match.',

    'advkpi.title': 'HR Analytics',
    'advkpi.subtitle': 'Growth, concentration, and workload metrics derived from the current selection',
    'advkpi.monthlyGrowth': 'Monthly Hiring Growth',
    'advkpi.monthlyGrowth.tip': 'Percentage change in new hires vs. the previous month.',
    'advkpi.quarterlyGrowth': 'Quarterly Hiring Growth',
    'advkpi.quarterlyGrowth.tip': 'Percentage change in new hires vs. the previous quarter.',
    'advkpi.yearlyGrowth': 'Yearly Hiring Growth',
    'advkpi.yearlyGrowth.tip': 'Percentage change in new hires vs. the previous year.',
    'advkpi.topDept': 'Top Hiring Department',
    'advkpi.topDept.tip': 'The department with the most new hires in the current selection.',
    'advkpi.fastestGrowing': 'Fastest Growing Department',
    'advkpi.fastestGrowing.tip': 'Department with the largest month-over-month percentage increase.',
    'advkpi.concentration': 'Department Concentration',
    'advkpi.concentration.tip': 'How concentrated hiring is across departments (0 = evenly spread, 100 = all in one department).',
    'advkpi.workload': 'Manager Workload (avg ± std dev)',
    'advkpi.workload.tip': 'Average number of hires per manager and how much that varies.',
    'advkpi.peakMonth': 'Hiring Peak Month',
    'advkpi.peakMonth.tip': 'The single month with the highest number of new hires.',

    'kpi.hires': 'Total New Hires',
    'kpi.dept': 'Departments',
    'kpi.pos': 'Positions',
    'kpi.mgr': 'Managers',
    'kpi.loc': 'Locations',
    'kpi.avg': 'Average Hiring / Month',
    'kpi.trend': 'Updated from current filters',
    'kpi.currentSelection': 'Current selection',
    'kpi.noChange': 'No change',
    'kpi.sinceLastView': 'since last view',

    'section.overview.title': 'Overview Charts',
    'section.overview.subtitle': 'Primary visualizations',
    'chart.hiringTrend': 'Hiring Trend',
    'chart.department': 'Department',

    'section.detailed.title': 'Detailed Breakdown',
    'section.detailed.subtitle': 'Secondary visualizations',
    'chart.position': 'Position',
    'chart.location': 'Location',
    'chart.manager': 'Manager',
    'chart.timeline': 'Timeline',

    'section.growth.title': 'Growth & Rankings',
    'section.growth.subtitle': 'Click a bar or slice to drill down across the entire dashboard',
    'chart.growth': 'Hiring Growth',
    'chart.newHiresLabel': 'New Hires',
    'chart.locationDist': 'Location Distribution',
    'chart.deptRanking': 'Department Ranking',
    'chart.managerRanking': 'Manager Ranking',
    'toggle.monthly': 'Monthly',
    'toggle.quarterly': 'Quarterly',
    'toggle.yearly': 'Yearly',
    'toggle.top10': 'Top 10',
    'toggle.top20': 'Top 20',
    'toggle.all': 'All',
    'export.aria': 'Export {{name}} chart as PNG',
    'export.growth.aria': 'Export Hiring Growth chart as PNG',
    'export.locationDist.aria': 'Export Location Distribution chart as PNG',
    'export.deptRanking.aria': 'Export Department Ranking chart as PNG',
    'export.managerRanking.aria': 'Export Manager Ranking chart as PNG',

    'section.heatmap.title': 'Hiring Heatmap',
    'section.heatmap.subtitle': 'Department × Month — click a cell to drill down',
    'heatmap.range6': 'Last 6 months',
    'heatmap.range12': 'Last 12 months',
    'heatmap.rangeAll': 'All time',
    'heatmap.less': 'Less',
    'heatmap.more': 'More',
    'heatmap.showAll': 'Show All',
    'heatmap.collapse': 'Collapse',
    'heatmap.showingDepartments': 'Showing {{visible}} / {{total}} departments',
    'heatmap.empty': 'No data available for the current filters.',
    'heatmap.cellAria': '{{dept}}, {{month}}: {{count}} hire(s)',

    'section.timeline.title': 'Onboarding Timeline',
    'section.timeline.subtitle': 'Most recent first — click a group header to drill down',
    'toggle.month': 'Month',
    'toggle.quarter': 'Quarter',
    'toggle.year': 'Year',
    'timeline.empty': 'No hires to display for the current filters.',

    'section.insight.title': 'AI Insights',
    'section.insight.subtitle': 'Automated analysis',
    'insight.placeholderTitle': 'Insights will appear here',
    'insight.placeholderText': 'Automated hiring insights and recommendations will be generated once data is connected. This panel will surface trends, anomalies, and actionable summaries for HR teams.',
    'insight.noMatch.title': 'No matching records',
    'insight.noMatch.text': 'Try adjusting or resetting the filters to see hiring insights.',
    'insight.noMatch.list': 'No records match the current filters — adjust or reset filters to see insights.',
    'insight.steady': 'Hiring activity is steady with no notable outliers in the current selection.',
    'warning.title': 'Data Quality & Workload Warnings',

    'section.table.title': 'New Hire Records',
    'section.table.subtitle': 'Detailed data table',
    'table.search.placeholder': 'Search records...',
    'table.col.name': 'Name',
    'table.col.department': 'Department',
    'table.col.position': 'Position',
    'table.col.manager': 'Manager',
    'table.col.location': 'Location',
    'table.col.hiredate': 'Hire Date',
    'table.col.status': 'Status',
    'table.empty': 'No records match the current filters',
    'table.showing': 'Showing {{from}}-{{to}} of {{total}} records',
    'table.prev': 'Prev',
    'table.next': 'Next',
    'table.page': 'Page {{page}} / {{totalPages}}',

    'footer.text': '© 2026 HR New Hire Analytics Dashboard. All rights reserved.',

    'upload.reading': 'Reading "{{name}}"…',
    'upload.unsupported': 'Unsupported file type ".{{ext}}". Please upload .xlsx, .xls, or .csv.',
    'upload.empty': 'The file appears to be empty — no rows were found.',
    'upload.missingRequired': 'Imported {{count}} row(s), but could not recognize required column(s): {{fields}}. Some data may be incomplete — check your column headers.',
    'upload.success': 'Imported {{count}} row(s) from "{{name}}". Dashboard refreshed.',
    'upload.failed': 'Failed to read "{{name}}": {{error}}',
    'upload.sampleFailed': 'Could not load sample data. Try uploading a file instead.',

    'insight.hiringIncreased': 'Hiring increased by {{percent}}% compared with the previous month.',
    'insight.hiringDecreased': 'Hiring decreased by {{percent}}% compared with the previous month.',
    'insight.topDepartment': 'Department "{{name}}" has the highest hiring demand with {{count}} new hire(s) ({{share}}% of total).',
    'insight.topLocation': '"{{name}}" office represents {{share}}% of new hires.',
    'insight.topQuarter': 'Most onboarding activity occurred during {{quarter}} with {{count}} new hire(s).',
    'insight.overloadedManagers': '{{count}} manager(s) are onboarding 10 or more employees simultaneously.',
    'insight.fastestGrowing': '"{{name}}" is the fastest growing department, up {{percent}}% month-over-month.',
    'insight.peakMonth': 'Hiring peaked in {{month}} with {{count}} new hire(s).',
    'insight.concentration': 'Hiring is fairly concentrated: a department-concentration score of {{score}}/100 suggests demand is not evenly spread.',
    'insight.trendUp': 'The overall hiring trend is trending upward across the selected period.',
    'insight.trendDown': 'The overall hiring trend is trending downward across the selected period.',

    'warning.deptConcentration': 'Hiring is heavily concentrated in one department (concentration score {{score}}/100).',
    'warning.managerImbalance': 'Manager workload is imbalanced — headcount per manager varies widely (avg {{mean}}, std dev {{stdDev}}).',
    'warning.missingManager': '{{count}} record(s) are missing a manager.',
    'warning.missingDepartment': '{{count}} record(s) are missing a department.',
    'warning.missingStartDate': '{{count}} record(s) are missing a start date.',
    'warning.futureStartDate': '{{count}} candidate(s) have a start date in the future (not yet started — treat as incoming hires, not active employees).',
    'warning.duplicates': '{{count}} possible duplicate employee record(s) detected (same name + start date).',

    'insight.leadsHiring': '"{{name}}" leads hiring with {{count}} new hire(s).',
    'insight.busiestMonth': 'The busiest month was {{month}} with {{count}} hire(s).',
    'insight.spans': 'Hires span {{locations}} location(s) and {{managers}} manager(s).',
    'insight.trendUpShort': ' Hiring is trending upward in the most recent month.',
    'insight.trendDownShort': ' Hiring has slowed slightly in the most recent month.',
    'insight.trendFlatShort': ' Hiring pace has stayed flat month over month.',
    'insight.titleSummary': '{{count}} new hires across {{depts}} departments'
  },

  vi: {
    'app.title': 'HR Analytics',
    'app.subtitle': 'Bảng điều khiển Nhân sự mới',
    'nav.dashboard': 'Tổng quan',
    'nav.newhire': 'Nhân sự mới',
    'nav.recruitment': 'Tuyển dụng',
    'nav.training': 'Đào tạo',
    'nav.probation': 'Thử việc',
    'nav.analytics': 'Phân tích',
    'nav.settings': 'Cài đặt',
    'nav.comingsoon': 'Mục này chưa có trong phiên bản dashboard hiện tại.',
    'darkmode': 'Chế độ tối',
    'nav.darkmode': 'Chế độ tối',
    'header.title': 'Bảng điều khiển Nhân sự mới',
    'breadcrumb.home': 'Trang chủ',
    'breadcrumb.dashboard': 'Tổng quan',
    'lastupdated': 'Cập nhật lần cuối:',
    'search.placeholder': 'Tìm kiếm...',
    'search.aria': 'Tìm kiếm trong dashboard',
    'upload.aria': 'Nhập dữ liệu từ file Excel hoặc CSV',
    'notifications.aria': 'Thông báo',
    'avatar.aria': 'Menu tài khoản',
    'lang.toggle.aria': 'Chuyển đổi ngôn ngữ',
    'nav.openMenu': 'Mở menu điều hướng',

    'filters.title': 'Bộ lọc',
    'filters.subtitle': 'Tất cả bộ lọc áp dụng đồng thời cho KPI, biểu đồ và bảng dữ liệu',
    'filters.year': 'Năm',
    'filters.month': 'Tháng',
    'filters.department': 'Phòng ban',
    'filters.position': 'Vị trí',
    'filters.location': 'Địa điểm',
    'filters.manager': 'Quản lý',
    'filters.allyears': 'Tất cả các năm',
    'filters.allmonths': 'Tất cả các tháng',
    'filters.alldepartments': 'Tất cả phòng ban',
    'filters.allpositions': 'Tất cả vị trí',
    'filters.alllocations': 'Tất cả địa điểm',
    'filters.allmanagers': 'Tất cả quản lý',
    'filters.reset': 'Đặt lại bộ lọc',
    'filters.active': 'Bộ lọc đang áp dụng',
    'filters.removeChip': 'Bỏ lọc {{label}}: {{value}}',

    'drilldown.clear': 'Bỏ chọn drill-down',
    'drilldown.text': 'Đang lọc theo {{label}} — toàn bộ biểu đồ, KPI và bảng dữ liệu đã được lọc tương ứng.',

    'advkpi.title': 'Phân tích Nhân sự',
    'advkpi.subtitle': 'Các chỉ số tăng trưởng, mức độ tập trung và khối lượng công việc dựa trên lựa chọn hiện tại',
    'advkpi.monthlyGrowth': 'Tăng trưởng tuyển dụng theo tháng',
    'advkpi.monthlyGrowth.tip': 'Phần trăm thay đổi số nhân sự mới so với tháng trước.',
    'advkpi.quarterlyGrowth': 'Tăng trưởng tuyển dụng theo quý',
    'advkpi.quarterlyGrowth.tip': 'Phần trăm thay đổi số nhân sự mới so với quý trước.',
    'advkpi.yearlyGrowth': 'Tăng trưởng tuyển dụng theo năm',
    'advkpi.yearlyGrowth.tip': 'Phần trăm thay đổi số nhân sự mới so với năm trước.',
    'advkpi.topDept': 'Phòng ban tuyển dụng nhiều nhất',
    'advkpi.topDept.tip': 'Phòng ban có số lượng nhân sự mới cao nhất trong lựa chọn hiện tại.',
    'advkpi.fastestGrowing': 'Phòng ban tăng trưởng nhanh nhất',
    'advkpi.fastestGrowing.tip': 'Phòng ban có mức tăng phần trăm theo tháng lớn nhất.',
    'advkpi.concentration': 'Mức độ tập trung phòng ban',
    'advkpi.concentration.tip': 'Mức độ tuyển dụng tập trung vào ít phòng ban (0 = phân bổ đều, 100 = dồn vào 1 phòng ban).',
    'advkpi.workload': 'Khối lượng công việc quản lý (TB ± độ lệch chuẩn)',
    'advkpi.workload.tip': 'Số nhân sự trung bình mỗi quản lý phụ trách và mức chênh lệch.',
    'advkpi.peakMonth': 'Tháng tuyển dụng cao điểm',
    'advkpi.peakMonth.tip': 'Tháng có số lượng nhân sự mới cao nhất.',

    'kpi.hires': 'Tổng nhân sự mới',
    'kpi.dept': 'Phòng ban',
    'kpi.pos': 'Vị trí',
    'kpi.mgr': 'Quản lý',
    'kpi.loc': 'Địa điểm',
    'kpi.avg': 'TB tuyển dụng / Tháng',
    'kpi.trend': 'Đã cập nhật theo bộ lọc hiện tại',
    'kpi.currentSelection': 'Lựa chọn hiện tại',
    'kpi.noChange': 'Không đổi',
    'kpi.sinceLastView': 'so với lần xem trước',

    'section.overview.title': 'Biểu đồ tổng quan',
    'section.overview.subtitle': 'Trực quan hoá chính',
    'chart.hiringTrend': 'Xu hướng tuyển dụng',
    'chart.department': 'Phòng ban',

    'section.detailed.title': 'Phân tích chi tiết',
    'section.detailed.subtitle': 'Trực quan hoá bổ sung',
    'chart.position': 'Vị trí',
    'chart.location': 'Địa điểm',
    'chart.manager': 'Quản lý',
    'chart.timeline': 'Dòng thời gian',

    'section.growth.title': 'Tăng trưởng & Xếp hạng',
    'section.growth.subtitle': 'Nhấp vào cột hoặc lát biểu đồ để lọc toàn bộ dashboard',
    'chart.growth': 'Tăng trưởng tuyển dụng',
    'chart.newHiresLabel': 'Nhân sự mới',
    'chart.locationDist': 'Phân bố địa điểm',
    'chart.deptRanking': 'Xếp hạng phòng ban',
    'chart.managerRanking': 'Xếp hạng quản lý',
    'toggle.monthly': 'Theo tháng',
    'toggle.quarterly': 'Theo quý',
    'toggle.yearly': 'Theo năm',
    'toggle.top10': 'Top 10',
    'toggle.top20': 'Top 20',
    'toggle.all': 'Tất cả',
    'export.aria': 'Xuất biểu đồ {{name}} dạng PNG',
    'export.growth.aria': 'Xuất biểu đồ Tăng trưởng tuyển dụng dạng PNG',
    'export.locationDist.aria': 'Xuất biểu đồ Phân bố địa điểm dạng PNG',
    'export.deptRanking.aria': 'Xuất biểu đồ Xếp hạng phòng ban dạng PNG',
    'export.managerRanking.aria': 'Xuất biểu đồ Xếp hạng quản lý dạng PNG',

    'section.heatmap.title': 'Bản đồ nhiệt tuyển dụng',
    'section.heatmap.subtitle': 'Phòng ban × Tháng — nhấp vào ô để lọc dữ liệu',
    'heatmap.range6': '6 tháng gần nhất',
    'heatmap.range12': '12 tháng gần nhất',
    'heatmap.rangeAll': 'Toàn bộ thời gian',
    'heatmap.less': 'Ít',
    'heatmap.more': 'Nhiều',
    'heatmap.showAll': 'Xem tất cả',
    'heatmap.collapse': 'Thu gọn',
    'heatmap.showingDepartments': 'Hiển thị {{visible}} / {{total}} phòng ban',
    'heatmap.empty': 'Không có dữ liệu cho bộ lọc hiện tại.',
    'heatmap.cellAria': '{{dept}}, {{month}}: {{count}} nhân sự mới',

    'section.timeline.title': 'Dòng thời gian Onboarding',
    'section.timeline.subtitle': 'Gần nhất trước — nhấp vào tiêu đề nhóm để lọc dữ liệu',
    'toggle.month': 'Tháng',
    'toggle.quarter': 'Quý',
    'toggle.year': 'Năm',
    'timeline.empty': 'Không có nhân sự mới nào phù hợp với bộ lọc hiện tại.',

    'section.insight.title': 'Thông tin phân tích (AI Insights)',
    'section.insight.subtitle': 'Phân tích tự động',
    'insight.placeholderTitle': 'Thông tin phân tích sẽ hiển thị ở đây',
    'insight.placeholderText': 'Thông tin và đề xuất tuyển dụng tự động sẽ được tạo khi có dữ liệu. Khu vực này sẽ hiển thị xu hướng, điểm bất thường và tóm tắt hữu ích cho đội ngũ HR.',
    'insight.noMatch.title': 'Không có bản ghi phù hợp',
    'insight.noMatch.text': 'Hãy điều chỉnh hoặc đặt lại bộ lọc để xem thông tin tuyển dụng.',
    'insight.noMatch.list': 'Không có bản ghi nào khớp với bộ lọc hiện tại — hãy điều chỉnh hoặc đặt lại bộ lọc để xem thông tin phân tích.',
    'insight.steady': 'Hoạt động tuyển dụng ổn định, không có điểm bất thường đáng chú ý trong lựa chọn hiện tại.',
    'warning.title': 'Cảnh báo chất lượng dữ liệu & khối lượng công việc',

    'section.table.title': 'Danh sách nhân sự mới',
    'section.table.subtitle': 'Bảng dữ liệu chi tiết',
    'table.search.placeholder': 'Tìm kiếm nhân sự...',
    'table.col.name': 'Họ và tên',
    'table.col.department': 'Phòng ban',
    'table.col.position': 'Vị trí',
    'table.col.manager': 'Quản lý',
    'table.col.location': 'Địa điểm',
    'table.col.hiredate': 'Ngày vào làm',
    'table.col.status': 'Trạng thái',
    'table.empty': 'Không có bản ghi nào khớp với bộ lọc hiện tại',
    'table.showing': 'Hiển thị {{from}}-{{to}} trong tổng số {{total}} bản ghi',
    'table.prev': 'Trước',
    'table.next': 'Sau',
    'table.page': 'Trang {{page}} / {{totalPages}}',

    'footer.text': '© 2026 HR New Hire Analytics Dashboard. Bảo lưu mọi quyền.',

    'upload.reading': 'Đang đọc "{{name}}"…',
    'upload.unsupported': 'Không hỗ trợ định dạng ".{{ext}}". Vui lòng tải lên file .xlsx, .xls hoặc .csv.',
    'upload.empty': 'File có vẻ trống — không tìm thấy dòng dữ liệu nào.',
    'upload.missingRequired': 'Đã nhập {{count}} dòng, nhưng không nhận diện được cột bắt buộc: {{fields}}. Một số dữ liệu có thể chưa đầy đủ — vui lòng kiểm tra lại tiêu đề cột.',
    'upload.success': 'Đã nhập {{count}} dòng từ "{{name}}". Dashboard đã được cập nhật.',
    'upload.failed': 'Không thể đọc "{{name}}": {{error}}',
    'upload.sampleFailed': 'Không thể tải dữ liệu mẫu. Hãy thử tải lên một file khác.',

    'insight.hiringIncreased': 'Tuyển dụng tăng {{percent}}% so với tháng trước.',
    'insight.hiringDecreased': 'Tuyển dụng giảm {{percent}}% so với tháng trước.',
    'insight.topDepartment': 'Phòng ban "{{name}}" có nhu cầu tuyển dụng cao nhất với {{count}} nhân sự mới ({{share}}% tổng số).',
    'insight.topLocation': 'Văn phòng "{{name}}" chiếm {{share}}% tổng số nhân sự mới.',
    'insight.topQuarter': 'Hoạt động onboarding diễn ra nhiều nhất trong {{quarter}} với {{count}} nhân sự mới.',
    'insight.overloadedManagers': '{{count}} quản lý đang onboard đồng thời từ 10 nhân sự trở lên.',
    'insight.fastestGrowing': '"{{name}}" là phòng ban tăng trưởng nhanh nhất, tăng {{percent}}% so với tháng trước.',
    'insight.peakMonth': 'Tuyển dụng đạt đỉnh vào {{month}} với {{count}} nhân sự mới.',
    'insight.concentration': 'Tuyển dụng khá tập trung: chỉ số tập trung phòng ban {{score}}/100 cho thấy nhu cầu không được phân bổ đồng đều.',
    'insight.trendUp': 'Xu hướng tuyển dụng tổng thể đang đi lên trong giai đoạn được chọn.',
    'insight.trendDown': 'Xu hướng tuyển dụng tổng thể đang đi xuống trong giai đoạn được chọn.',

    'warning.deptConcentration': 'Tuyển dụng đang tập trung quá mức vào một phòng ban (chỉ số tập trung {{score}}/100).',
    'warning.managerImbalance': 'Khối lượng công việc của quản lý không đồng đều — số nhân sự phụ trách chênh lệch lớn (TB {{mean}}, độ lệch chuẩn {{stdDev}}).',
    'warning.missingManager': '{{count}} bản ghi thiếu thông tin quản lý trực tiếp.',
    'warning.missingDepartment': '{{count}} bản ghi thiếu thông tin phòng ban.',
    'warning.missingStartDate': '{{count}} bản ghi thiếu ngày bắt đầu làm việc.',
    'warning.futureStartDate': '{{count}} Ứng viên có ngày bắt đầu làm việc trong tương lai (chưa chính thức vào làm — nên xem là ứng viên sắp onboard, không phải nhân sự đang hoạt động).',
    'warning.duplicates': 'Phát hiện {{count}} bản ghi nhân sự có thể bị trùng lặp (trùng tên + ngày bắt đầu).',

    'insight.leadsHiring': '"{{name}}" dẫn đầu tuyển dụng với {{count}} nhân sự mới.',
    'insight.busiestMonth': 'Tháng cao điểm là {{month}} với {{count}} nhân sự mới.',
    'insight.spans': 'Tuyển dụng trải rộng trên {{locations}} địa điểm và {{managers}} quản lý.',
    'insight.trendUpShort': ' Tuyển dụng đang có xu hướng tăng trong tháng gần nhất.',
    'insight.trendDownShort': ' Tuyển dụng đã chậm lại đôi chút trong tháng gần nhất.',
    'insight.trendFlatShort': ' Tốc độ tuyển dụng ổn định qua các tháng.',
    'insight.titleSummary': '{{count}} nhân sự mới trên {{depts}} phòng ban'
  }
};

const VN_MONTH_SHORT = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
const EN_MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let currentLang = loadInitialLang();
const listeners = new Set();

function loadInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  } catch (e) { /* localStorage unavailable — fall back to default */ }
  return 'vi';
}

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'vi') return;
  currentLang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  translateStaticDom();
  for (const cb of listeners) cb(lang);
}

/** Subscribe to language changes (dynamic renderers re-run themselves). */
export function onLanguageChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Translate a key with optional {{var}} interpolation. Falls back to the key itself if missing. */
export function t(key, vars) {
  const dict = DICT[currentLang] || DICT.en;
  let str = dict[key] ?? DICT.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`{{${k}}}`, 'g'), v);
    }
  }
  return str;
}

/** Language-aware short month label from a "YYYY-MM" key, e.g. "Jul 2026" / "Th7/2026". */
export function formatMonth(key) {
  const [y, m] = key.split('-').map(Number);
  const idx = m - 1;
  if (currentLang === 'vi') return `${VN_MONTH_SHORT[idx]}/${y}`;
  return `${EN_MONTH_SHORT[idx]} ${y}`;
}

/** Language-aware compact month label for tight spaces (heatmap columns), e.g. "Jul '26" / "T7 '26". */
export function formatMonthCompact(key) {
  const [y, m] = key.split('-').map(Number);
  const idx = m - 1;
  const yy = String(y).slice(2);
  if (currentLang === 'vi') return `T${m} '${yy}`;
  return `${EN_MONTH_SHORT[idx]} '${yy}`;
}

/** Language-aware full month label, e.g. "July 2026" / "Tháng 7/2026". */
export function formatMonthFull(key) {
  const [y, m] = key.split('-').map(Number);
  if (currentLang === 'vi') return `Tháng ${m}/${y}`;
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${names[m - 1]} ${y}`;
}

/** Language-aware quarter label from a "YYYY-Q#" key, e.g. "Q2 2026" / "Quý 2/2026". */
export function formatQuarter(key) {
  const [y, q] = key.split('-Q');
  if (currentLang === 'vi') return `Quý ${q}/${y}`;
  return `Q${q} ${y}`;
}

/** Walk the DOM applying data-i18n (textContent) and data-i18n-attr (attribute:key pairs). */
export function translateStaticDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const pairs = el.getAttribute('data-i18n-attr').split(';').map((p) => p.trim()).filter(Boolean);
    for (const pair of pairs) {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr, t(key));
    }
  });
  document.documentElement.lang = currentLang;
}
