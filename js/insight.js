/**
 * insight.js
 * Sprint 3/4 — Tóm tắt "AI Insight" được sinh hoàn toàn phía client từ dữ
 * liệu đã lọc hiện tại. Được làm mới mỗi khi đổi filter và sau mỗi lần
 * import Excel/CSV (yêu cầu Sprint 4).
 *
 * Sprint 5 (bổ sung bên dưới, hàm gốc không bị sửa):
 *  - generateInsightSentences(): danh sách câu tiếng Việt được sinh hoàn
 *    toàn từ số liệu tính trong analytics.js — không có câu nào hardcode.
 *  - generateWarnings(): engine cảnh báo chất lượng dữ liệu / mất cân bằng.
 *  - renderInsightsPanel(): render cả 2 danh sách vào DOM của Sprint 5.
 *
 * Cập nhật: toàn bộ câu chữ chuyển sang tiếng Việt.
 */
import { distinctValues } from './utils.js';
import { monthKey } from './utils.js';

/** "2026-07" -> "Tháng 7/2026" */
function monthLabelVN(key) {
  const [y, m] = key.split('-').map(Number);
  return `Tháng ${m}/${y}`;
}

/** "2026-Q2" -> "Quý 2/2026" */
function quarterLabelVN(key) {
  const [y, q] = key.split('-Q');
  return `Quý ${q}/${y}`;
}

export function renderInsight(filteredRecords) {
  const titleEl = document.getElementById('insight-title');
  const textEl = document.getElementById('insight-text');
  if (!titleEl || !textEl) return;

  if (filteredRecords.length === 0) {
    titleEl.textContent = 'Không có bản ghi phù hợp';
    textEl.textContent = 'Hãy điều chỉnh hoặc đặt lại bộ lọc để xem thông tin tuyển dụng.';
    return;
  }

  const byDept = new Map();
  const byMonth = new Map();
  for (const r of filteredRecords) {
    byDept.set(r.department, (byDept.get(r.department) || 0) + 1);
    const key = monthKey(r.startDate);
    if (key) byMonth.set(key, (byMonth.get(key) || 0) + 1);
  }

  const topDept = [...byDept.entries()].sort((a, b) => b[1] - a[1])[0];
  const months = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const topMonth = [...byMonth.entries()].sort((a, b) => b[1] - a[1])[0];

  const locations = distinctValues(filteredRecords, 'location').length;
  const managers = distinctValues(filteredRecords, 'manager').length;

  let trendPhrase = '';
  if (months.length >= 2) {
    const last = months[months.length - 1][1];
    const prev = months[months.length - 2][1];
    if (last > prev) trendPhrase = ' Tuyển dụng đang có xu hướng tăng trong tháng gần nhất.';
    else if (last < prev) trendPhrase = ' Tuyển dụng đã chậm lại đôi chút trong tháng gần nhất.';
    else trendPhrase = ' Tốc độ tuyển dụng ổn định qua các tháng.';
  }

  titleEl.textContent = `${filteredRecords.length} nhân sự mới trên ${byDept.size} phòng ban`;
  textEl.textContent =
    `${topDept ? `"${topDept[0]}" dẫn đầu tuyển dụng với ${topDept[1]} nhân sự mới. ` : ''}` +
    `${topMonth ? `Tháng cao điểm là ${monthLabelVN(topMonth[0])} với ${topMonth[1]} nhân sự mới. ` : ''}` +
    `Tuyển dụng trải rộng trên ${locations} địa điểm và ${managers} quản lý.` +
    trendPhrase;
}

/* ===================================================================
 * Sprint 5 — AI Insight Generator + Warning Engine (Tiếng Việt)
 * =================================================================== */

/**
 * Sinh các câu insight tiếng Việt hoàn toàn từ số liệu đã tính (analytics.js).
 * Mọi con số đều được nội suy từ `analytics` — không có câu nào hardcode.
 */
export function generateInsightSentences(analytics, totalRecords) {
  const sentences = [];
  if (!analytics || totalRecords === 0) {
    return ['Không có bản ghi nào khớp với bộ lọc hiện tại — hãy điều chỉnh hoặc đặt lại bộ lọc để xem thông tin phân tích.'];
  }

  const { totals, top, growth, fastestGrowingDepartment, peakMonth, concentration, managerWorkload } = analytics;

  if (growth.monthly.percent !== 0 && growth.monthly.current !== undefined) {
    const dir = growth.monthly.percent > 0 ? 'tăng' : 'giảm';
    sentences.push(`Tuyển dụng ${dir} ${Math.abs(growth.monthly.percent)}% so với tháng trước.`);
  }

  if (top.department) {
    const share = totals.employees ? Math.round((top.department.value / totals.employees) * 100) : 0;
    sentences.push(`Phòng ban "${top.department.label}" có nhu cầu tuyển dụng cao nhất với ${top.department.value} nhân sự mới (${share}% tổng số).`);
  }

  if (top.location) {
    const share = totals.employees ? Math.round((top.location.value / totals.employees) * 100) : 0;
    sentences.push(`Văn phòng "${top.location.label}" chiếm ${share}% tổng số nhân sự mới.`);
  }

  if (analytics.series.quarterly.length) {
    const topQuarter = [...analytics.series.quarterly].sort((a, b) => b.value - a.value)[0];
    sentences.push(`Hoạt động onboarding diễn ra nhiều nhất trong ${quarterLabelVN(topQuarter.key)} với ${topQuarter.value} nhân sự mới.`);
  }

  if (managerWorkload.overloaded.length > 0) {
    sentences.push(`${managerWorkload.overloaded.length} quản lý đang onboard đồng thời từ 10 nhân sự trở lên.`);
  }

  if (fastestGrowingDepartment && fastestGrowingDepartment.percent > 0) {
    sentences.push(`"${fastestGrowingDepartment.category}" là phòng ban tăng trưởng nhanh nhất, tăng ${fastestGrowingDepartment.percent}% so với tháng trước.`);
  }

  if (peakMonth) {
    sentences.push(`Tuyển dụng đạt đỉnh vào ${monthLabelVN(peakMonth.key)} với ${peakMonth.value} nhân sự mới.`);
  }

  if (concentration.department >= 40) {
    sentences.push(`Tuyển dụng khá tập trung: chỉ số tập trung phòng ban ${concentration.department}/100 cho thấy nhu cầu không được phân bổ đồng đều.`);
  }

  if (growth.trendDirection !== 'flat') {
    sentences.push(`Xu hướng tuyển dụng tổng thể đang ${growth.trendDirection === 'up' ? 'đi lên' : 'đi xuống'} trong giai đoạn được chọn.`);
  }

  return sentences.length ? sentences : ['Hoạt động tuyển dụng ổn định, không có điểm bất thường đáng chú ý trong lựa chọn hiện tại.'];
}

/**
 * Warning Engine — cảnh báo vấn đề chất lượng dữ liệu / mất cân bằng workload
 * dựa trên `issues` được tính một lần trong analytics.js (computeAnalytics()).
 * Trả về mảng { level: 'warning'|'error', message } bằng tiếng Việt.
 */
export function generateWarnings(analytics) {
  const warnings = [];
  if (!analytics) return warnings;
  const { issues, concentration, managerWorkload, totals } = analytics;

  if (concentration.department >= 50) {
    warnings.push({ level: 'warning', message: `Tuyển dụng đang tập trung quá mức vào một phòng ban (chỉ số tập trung ${concentration.department}/100).` });
  }
  if (managerWorkload.stdDev > managerWorkload.mean && totals.managers > 1) {
    warnings.push({ level: 'warning', message: `Khối lượng công việc của quản lý không đồng đều — số nhân sự phụ trách chênh lệch lớn (TB ${managerWorkload.mean}, độ lệch chuẩn ${managerWorkload.stdDev}).` });
  }
  if (issues.missingManager > 0) {
    warnings.push({ level: 'error', message: `${issues.missingManager} bản ghi thiếu thông tin quản lý trực tiếp.` });
  }
  if (issues.missingDepartment > 0) {
    warnings.push({ level: 'error', message: `${issues.missingDepartment} bản ghi thiếu thông tin phòng ban.` });
  }
  if (issues.missingStartDate > 0) {
    warnings.push({ level: 'error', message: `${issues.missingStartDate} bản ghi thiếu ngày bắt đầu làm việc.` });
  }
  if (issues.futureStartDate.length > 0) {
    warnings.push({ level: 'warning', message: `${issues.futureStartDate.length} bản ghi có ngày bắt đầu làm việc trong tương lai.` });
  }
  if (issues.duplicates.length > 0) {
    warnings.push({ level: 'warning', message: `Phát hiện ${issues.duplicates.length} bản ghi nhân sự có thể bị trùng lặp (trùng tên + ngày bắt đầu).` });
  }

  return warnings;
}

/** Render cả 2 danh sách vào khu vực "Analytics & Insights" (index.html, Sprint 5). */
export function renderInsightsPanel(analytics, totalRecords) {
  const insightList = document.getElementById('ai-insight-list');
  const warningList = document.getElementById('warning-list');
  const warningSection = document.getElementById('warning-section');
  if (insightList) {
    const sentences = generateInsightSentences(analytics, totalRecords);
    insightList.innerHTML = sentences.map((s) => `<li>${escapeHtmlLocal(s)}</li>`).join('');
  }
  if (warningList && warningSection) {
    const warnings = generateWarnings(analytics);
    if (warnings.length === 0) {
      warningSection.hidden = true;
    } else {
      warningSection.hidden = false;
      warningList.innerHTML = warnings
        .map((w) => `<li class="warning-item warning-item--${w.level}">${escapeHtmlLocal(w.message)}</li>`)
        .join('');
    }
  }
}

function escapeHtmlLocal(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
