/**
 * upload.js
 * Sprint 4 — Excel/CSV import using SheetJS (loaded globally as `XLSX` via CDN in index.html).
 *
 * Responsibilities:
 *  - Read the first sheet of an uploaded .xlsx/.xls/.csv file
 *  - Auto-map columns (English + Vietnamese header variants) to the canonical
 *    record shape used everywhere else in the app (see data.js normalizeRecords)
 *  - Warn if required columns are missing
 *  - Replace the single dataset via data.js#setRecords (never a second data source)
 *  - Support large files (5000+ rows) without blocking the UI for long
 */
import { setRecords } from './data.js';
import { normalizeText } from './utils.js';

// Canonical field -> list of recognized header variants (English + Vietnamese), normalized.
const FIELD_ALIASES = {
  employeeName: ['employeename', 'employee', 'name', 'fullname', 'ho va ten', 'ten', 'nhan vien', 'ten nhan vien'],
  gender: ['gender', 'sex', 'gioi tinh'],
  birthday: ['birthday', 'dateofbirth', 'dob', 'ngay sinh'],
  department: ['department', 'dept', 'phong', 'phong ban', 'nhom', 'bo phan'],
  position: ['position', 'jobtitle', 'title', 'role', 'vi tri', 'chuc danh', 'chuc vu'],
  manager: ['manager', 'directmanager', 'supervisor', 'cap tren', 'cap tren truc tiep', 'quan ly'],
  location: ['location', 'office', 'site', 'workplace', 'noi lam viec', 'dia diem'],
  startDate: ['startdate', 'hiredate', 'dateofjoining', 'joindate', 'ngay bat dau lam viec', 'ngay vao', 'ngay vao lam', 'ngay nhan viec'],
  status: ['status', 'trang thai'],
  note: ['note', 'notes', 'comment', 'ghi chu'],
  id: ['id', 'employeeid', 'maso', 'ma nhan vien', 'ma so nhan vien']
};

const REQUIRED_FIELDS = ['employeeName', 'department', 'position', 'startDate'];

/** Build a lookup from normalized header text -> canonical field name. */
function buildAliasLookup() {
  const lookup = new Map();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) lookup.set(normalizeText(alias), field);
  }
  return lookup;
}
const ALIAS_LOOKUP = buildAliasLookup();

function mapHeaderToField(header) {
  const norm = normalizeText(header);
  if (ALIAS_LOOKUP.has(norm)) return ALIAS_LOOKUP.get(norm);

  // Loose fallback for slightly different phrasing (e.g. "Phòng ban" vs "Phòng/Nhóm").
  // IMPORTANT: match only at the START of the header, not "contains anywhere".
  // Vietnamese diacritic-stripping collapses distinct words to the same ASCII form
  // (e.g. "phòng" [room/department] and "phỏng" [as in "phỏng vấn" = interview] both
  // normalize to "phong"), so a naive `.includes()` check would wrongly map a column
  // like "Ngày phỏng vấn" (interview date) onto the "department" field. Requiring the
  // match to anchor at the start of the header keeps short, common aliases (like
  // "phong") useful for real department headers while rejecting incidental matches
  // buried in the middle of an unrelated header.
  let bestMatch = null;
  for (const [alias, field] of ALIAS_LOOKUP.entries()) {
    if (norm.startsWith(alias) || alias.startsWith(norm)) {
      // Prefer the longest matching alias so more specific phrases win over short ones.
      if (!bestMatch || alias.length > bestMatch.alias.length) bestMatch = { alias, field };
    }
  }
  return bestMatch ? bestMatch.field : null;
}

/** Convert an Excel serial date or arbitrary date string/Date to "YYYY-MM-DD". */
function toIsoDate(value) {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) return isoFromDate(value);
  if (typeof value === 'number') {
    // Excel serial date (days since 1899-12-30)
    const parsed = XLSX.SSF ? XLSX.SSF.parse_date_code(value) : null;
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
  }
  const str = String(value).trim();
  // Find DD/MM/YYYY (or D-M-YYYY, D.M.YYYY) ANYWHERE in the string — not anchored —
  // because real-world exports often prefix the date with a Vietnamese weekday label,
  // e.g. "Thứ Hai, ngày 13/10/2025" or "Ngày 05/01/1982".
  const dmy = str.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (dmy) {
    let [, d, m, y] = dmy;
    if (y.length === 2) y = `20${y}`;
    const dNum = parseInt(d, 10);
    const mNum = parseInt(m, 10);
    // Guard against false-positive matches (e.g. stray numbers) with basic range checks.
    if (dNum >= 1 && dNum <= 31 && mNum >= 1 && mNum <= 12) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) return isoFromDate(parsedDate);
  return '';
}

function isoFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Parse a workbook's first sheet into { records, mappedFields, missingRequired }.
 */
function parseWorkbook(workbook) {
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });

  if (rows.length === 0) {
    return { records: [], mappedFields: [], missingRequired: REQUIRED_FIELDS };
  }

  const headers = Object.keys(rows[0]);
  const headerFieldMap = {}; // original header -> canonical field
  for (const header of headers) {
    const field = mapHeaderToField(header);
    if (field) headerFieldMap[header] = field;
  }
  const mappedFields = Object.values(headerFieldMap);
  const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedFields.includes(f));

  const records = rows.map((row, idx) => {
    const rec = { id: `IMP${idx + 1}` };
    for (const [header, field] of Object.entries(headerFieldMap)) {
      const value = row[header];
      rec[field] = field === 'startDate' || field === 'birthday' ? toIsoDate(value) : String(value ?? '').trim();
    }
    return rec;
  });

  return { records, mappedFields, missingRequired };
}

function showStatus(message, kind = 'loading') {
  const el = document.getElementById('upload-status');
  if (!el) return;
  el.hidden = false;
  el.className = `upload-status upload-status--${kind}`;
  el.textContent = message;
}

function hideStatus() {
  const el = document.getElementById('upload-status');
  if (el) el.hidden = true;
}

/** Reads a File as an ArrayBuffer (large-file friendly, non-blocking). */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Handle a File chosen by the user. Emits the new dataset via data.js#setRecords
 * (app.js listens to onDataChanged and refreshes KPIs/charts/filters/table/insight).
 */
export async function handleUploadedFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['xlsx', 'xls', 'csv'].includes(ext)) {
    showStatus(`Unsupported file type ".${ext}". Please upload .xlsx, .xls, or .csv.`, 'error');
    return;
  }

  showStatus(`Reading "${file.name}"…`, 'loading');

  try {
    const buffer = await readFileAsArrayBuffer(file);
    // dense: false / cellDates true keeps memory reasonable for large sheets.
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const { records, missingRequired } = parseWorkbook(workbook);

    if (records.length === 0) {
      showStatus('The file appears to be empty — no rows were found.', 'error');
      return;
    }

    if (missingRequired.length > 0) {
      showStatus(
        `Imported ${records.length} row(s), but could not recognize required column(s): ${missingRequired.join(', ')}. ` +
        `Some data may be incomplete — check your column headers.`,
        'error'
      );
    } else {
      showStatus(`Imported ${records.length} row(s) from "${file.name}". Dashboard refreshed.`, 'success');
    }

    // Single source of truth: this replaces the sample data entirely.
    setRecords(records, 'upload');

    setTimeout(hideStatus, 6000);
  } catch (err) {
    console.error(err);
    showStatus(`Failed to read "${file.name}": ${err.message}`, 'error');
  }
}

/** Wires the Upload button + hidden file input. Call once from app.js. */
export function initUpload() {
  const btn = document.getElementById('upload-btn');
  const input = document.getElementById('upload-input');
  if (!btn || !input) return;

  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    handleUploadedFile(file);
    input.value = ''; // allow re-uploading the same file name later
  });
}
