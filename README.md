# HR New Hire Dashboard

> Dashboard quản lý và phân tích dữ liệu **nhân sự mới (New Hire)** dành
> cho bộ phận Nhân sự (HR) và Talent Acquisition (TA).

------------------------------------------------------------------------

# 1. Giới thiệu

## Tổng quan

**HR New Hire Dashboard** là một ứng dụng Dashboard được xây dựng nhằm
trực quan hóa dữ liệu tuyển dụng và nhân sự mới, giúp HR và Ban quản lý
nhanh chóng nắm bắt tình hình onboarding, hiệu quả tuyển dụng và các chỉ
số quan trọng.

Thay vì phải tổng hợp dữ liệu thủ công từ nhiều file Excel, Dashboard
cung cấp giao diện trực quan, hiện đại và dễ sử dụng, hỗ trợ theo dõi
toàn bộ quá trình tuyển mới theo thời gian thực (hoặc dữ liệu được cập
nhật định kỳ).

Dự án được phát triển theo mô hình **Static Web Application**, không yêu
cầu cài đặt backend và có thể chạy trực tiếp trên trình duyệt.

------------------------------------------------------------------------

# 2. Mục tiêu

-   Theo dõi số lượng nhân sự mới.
-   Phân tích dữ liệu tuyển dụng theo nhiều chiều.
-   Hỗ trợ báo cáo nhanh.
-   Chuẩn hóa dữ liệu tuyển dụng.
-   Nâng cao khả năng ra quyết định dựa trên dữ liệu.

------------------------------------------------------------------------

# 3. Đối tượng sử dụng

-   Talent Acquisition
-   HRBP
-   HR Executive
-   HR Manager
-   Ban Giám đốc
-   Bộ phận Điều hành

------------------------------------------------------------------------

# 4. Tính năng

## Dashboard tổng quan

-   KPI tổng số nhân sự mới
-   Biểu đồ xu hướng
-   Dashboard responsive
-   Giao diện hiện đại

## Bộ lọc

-   Theo năm
-   Theo tháng
-   Theo phòng ban
-   Theo vị trí
-   Theo trạng thái

## Trực quan dữ liệu

-   Bar Chart
-   Line Chart
-   Pie Chart (nếu được triển khai)
-   KPI Card

## Khả năng mở rộng

-   Thêm Dashboard mới
-   Kết nối API
-   Đọc dữ liệu Excel/CSV/JSON
-   Export dữ liệu

------------------------------------------------------------------------

# 5. Kiến trúc dự án

``` text
HR-NewHire-Dashboard/
│
├── css/
│   ├── style.css
│   └── ...
│
├── js/
│   ├── app.js
│   ├── chart.js
│   └── ...
│
├── data/
│   ├── *.json
│   ├── *.csv
│   └── ...
│
├── docs/
│
├── index.html
├── CHANGELOG.md
└── README.md
```

------------------------------------------------------------------------

# 6. Công nghệ sử dụng

  Công nghệ       Mục đích
  --------------- -----------------------
  HTML5           Giao diện
  CSS3            Thiết kế
  JavaScript      Xử lý logic
  Chart Library   Trực quan hóa dữ liệu
  Git & GitHub    Quản lý mã nguồn

------------------------------------------------------------------------

# 7. Cách chạy dự án

## Clone

``` bash
git clone https://github.com/haro185/HR-NewHire-Dashboard.git
```

``` bash
cd HR-NewHire-Dashboard
```

### Cách 1

Mở trực tiếp `index.html`.

### Cách 2

Sử dụng VS Code + Live Server.

------------------------------------------------------------------------

# 8. Luồng hoạt động

1.  Người dùng mở Dashboard.
2.  Dashboard đọc dữ liệu từ thư mục `data`.
3.  JavaScript xử lý dữ liệu.
4.  Dashboard render KPI và biểu đồ.
5.  Người dùng lọc dữ liệu và xem báo cáo.

------------------------------------------------------------------------

# 9. Dữ liệu

Khuyến nghị:

-   Chuẩn hóa định dạng.
-   Không chứa dữ liệu nhạy cảm.
-   Có dữ liệu mẫu để demo.

------------------------------------------------------------------------

# 10. Roadmap

-   [ ] Dark Mode
-   [ ] Xuất Excel
-   [ ] Xuất PDF
-   [ ] Kết nối Google Sheets
-   [ ] Kết nối API
-   [ ] Dashboard theo phòng ban
-   [ ] Dashboard theo nguồn tuyển dụng
-   [ ] Dashboard theo tỷ lệ nghỉ việc
-   [ ] Responsive Mobile

------------------------------------------------------------------------

# 11. Quy trình đóng góp

``` text
Fork
   ↓
Create Branch
   ↓
Coding
   ↓
Testing
   ↓
Commit
   ↓
Push
   ↓
Pull Request
```

------------------------------------------------------------------------

# 12. Changelog

Lịch sử thay đổi được ghi tại `CHANGELOG.md`.

------------------------------------------------------------------------

# 13. License

Hiện tại dự án chưa khai báo License.

Khuyến nghị sử dụng:

-   MIT License (Open Source)
-   Proprietary (Nội bộ doanh nghiệp)

------------------------------------------------------------------------

# 14. Tác giả

**Hảo Trần (Haro)**

Talent Acquisition \| HR Analytics \| HR Tech

LinkedIn: https://www.linkedin.com/in/haotx/
GitHub: https://github.com/haro185

------------------------------------------------------------------------

> Nếu dự án hữu ích, hãy ⭐ repository để ủng hộ quá trình phát triển.
