# Tài Liệu Nghiệp Vụ - Hệ Thống Bán Vé Đường Sắt Cao Tốc
## Hệ Thống Đặt Vé Tàu Điện cao tốp (Ví dụ: Tuyến Cat Linh - Hà Đông)

---

## 1. TỔNG QUAN NGHIỆP VỤ

### 1.1 Mô Tả Chung
Hệ thống bán vé đường sắt cao tốc là nền tảng cho phép hành khách:
- Xem thông tin tuyến đường, tàu và lịch trình
- Đặt vé trực tuyến
- Thanh toán an toàn
- Quản lý vé của họ
- Hỗ trợ khách hàng

### 1.2 Quy Trình Chính
```
Khách hàng → Tìm chuyến → Chọn ghế → Thanh toán → Nhận vé → Lên tàu
```

---

## 2. CÁC THÀNH PHẦN CHÍNH CỦA HỆ THỐNG

### 2.1 Quản Lý Tuyến Đường (Routes Management)
- Lưu trữ thông tin các tuyến đường (ví dụ: Cat Linh - Hà Đông)
- Quản lý các trạm dừng/ga
- Khoảng cách, thời gian di chuyển
- Giá vé theo tuyến

### 2.2 Quản Lý Tàu (Train Management)
- Thông tin chi tiết tàu (mã tàu, loại tàu, sức chứa)
- Cấu hình ghế (layout ghế, số lượng ghế)
- Trạng thái tàu (hoạt động, bảo trì)

### 2.3 Quản Lý Chuyến Tàu (Schedule/Trip Management)
- Lịch trình hàng ngày/tuần/tháng
- Giờ khởi hành, dự kiến tới
- Giá vé theo mùa (cao điểm/thấp điểm)

### 2.4 Quản Lý Vé & Ghế (Ticket & Seat Management)
- Cấu hình ghế trên mỗi tàu
- Theo dõi vé đã bán, vé còn trống
- Tính toán giá vé dựa trên:
  - Loại ghế (thường, ghế đôi)
  - Khoảng cách
  - Thời gian (giờ cao điểm, ngoài giờ)
  - Khách hàng đặc biệt (trẻ em, người cao tuổi, người khuyết tật)

### 2.5 Quản Lý Người Dùng (User Management)
- Đăng ký/Đăng nhập
- Hồ sơ khách hàng
- Lịch sử đặt vé
- Danh sách yêu thích

### 2.6 Thanh Toán (Payment Management)
- Hỗ trợ nhiều phương thức thanh toán:
  - Thẻ tín dụng/ghi nợ
  - Ví điện tử (Momo, Zalopay, etc.)
  - Chuyển khoản ngân hàng
  - Tiền mặt (qua quầy)
- Xử lý giao dịch an toàn
- Hoàn tiền/Hủy vé

### 2.7 Quản Lý Đơn Hàng (Order Management)
- Tạo đơn hàng
- Theo dõi trạng thái đơn hàng
- Lưu giữ vé
- Hủy/Hoàn tiền

---

## 3. CÁC CHỨC NĂNG CHI TIẾT

### 3.1 Chức Năng Cho Khách Hàng (Customer)

#### 3.1.1 Tìm Kiếm & Xem Chuyến
- [ ] Tìm kiếm chuyến tàu theo:
  - Điểm đi, điểm đến
  - Ngày khởi hành
  - Loại vé (một chiều, khứ hồi)
- [ ] Hiển thị danh sách chuyến khách tìm kiếm
- [ ] Xem chi tiết chuyến (giờ, giá, ghế còn trống)
- [ ] So sánh giá vé

#### 3.1.2 Đặt Vé
- [ ] Chọn chuyến tàu
- [ ] Chọn ghế/loại ghế
- [ ] Xem sơ đồ ghế trên tàu
- [ ] Nhập thông tin hành khách:
  - Tên, số điện thoại, email
  - Loại khách (người lớn, trẻ em, người cao tuổi)
  - CCCD/Hộ chiếu (tuỳ chọn)
- [ ] Xác nhận thông tin trước thanh toán
- [ ] Lưu vé (draft vé chưa thanh toán)

#### 3.1.3 Thanh Toán
- [ ] Chọn phương thức thanh toán
- [ ] Nhập thông tin thanh toán
- [ ] Xác nhận thanh toán
- [ ] Nhận xác nhận thanh toán

#### 3.1.4 Quản Lý Vé
- [ ] Xem danh sách vé đã mua
- [ ] Xem chi tiết vé (mã vé, ghế, giờ tàu)
- [ ] In vé (PDF)
- [ ] Chia sẻ vé qua email/SMS
- [ ] Nhận vé qua email/SMS

#### 3.1.5 Hủy & Hoàn Tiền
- [ ] Hủy vé (tuỳ vào chính sách)
- [ ] Yêu cầu hoàn tiền
- [ ] Theo dõi trạng thái hoàn tiền
- [ ] Chính sách hủy vé (tuỳ thời gian hủy)

#### 3.1.6 Quản Lý Tài Khoản
- [ ] Cập nhật hồ sơ
- [ ] Thay đổi mật khẩu
- [ ] Danh sách địa chỉ
- [ ] Phương thức thanh toán yêu thích

#### 3.1.7 Hỗ Trợ Khách Hàng
- [ ] FAQ
- [ ] Chat/Email hỗ trợ
- [ ] Theo dõi yêu cầu hỗ trợ

---

### 3.2 Chức Năng Cho Quản Lý (Admin)

#### 3.2.1 Quản Lý Tuyến Đường
- [ ] Tạo/Sửa/Xóa tuyến đường
- [ ] Quản lý ga/trạm dừng
- [ ] Thiết lập giá cơ bản
- [ ] Khoảng cách, thời gian di chuyển

#### 3.2.2 Quản Lý Tàu
- [ ] Tạo/Sửa/Xóa tàu
- [ ] Cấu hình sơ đồ ghế
- [ ] Loại ghế (thường, ghế đôi, ghế khuyết tật)
- [ ] Sức chứa tàu

#### 3.2.3 Quản Lý Chuyến Tàu
- [ ] Tạo lịch trình tàu
- [ ] Thiết lập giá theo mùa/thời gian
- [ ] Quản lý trạng thái chuyến (hủy, trì hoãn, bình thường)
- [ ] Xem danh sách ghế đã bán

#### 3.2.4 Quản Lý Vé & Ghế
- [ ] Xem trạng thái ghế (trống, bán, giữ)
- [ ] Tạo vé thủ công
- [ ] Quản lý các vé được giữ
- [ ] Thống kê tỷ lệ bán vé

#### 3.2.5 Quản Lý Đơn Hàng
- [ ] Xem tất cả đơn hàng
- [ ] Xem chi tiết từng đơn hàng
- [ ] Lọc/Tìm kiếm đơn hàng
- [ ] Thay đổi trạng thái đơn hàng
- [ ] Xử lý yêu cầu hoàn tiền

#### 3.2.6 Quản Lý Khách Hàng
- [ ] Xem danh sách khách hàng
- [ ] Xem lịch sử mua vé
- [ ] Từ chối/Chặn khách hàng
- [ ] Gửi thông báo/khuyến mãi

#### 3.2.7 Quản Lý Cơ Sở Dữ Liệu
- [ ] Tạo/Sửa/Xóa loại khách hàng
- [ ] Cấu hình phí hủy vé
- [ ] Quản lý mã khuyến mãi
- [ ] Thiết lập thời gian bán vé

#### 3.2.8 Báo Cáo & Thống Kê
- [ ] Doanh thu theo ngày/tháng/năm
- [ ] Tỷ lệ bán vé
- [ ] Khách hàng top
- [ ] Chuyến tàu bán chạy
- [ ] Xuất báo cáo PDF/Excel

---

### 3.3 Chức Năng Cho Nhân Viên (Staff/Operator)

#### 3.3.1 Kiểm Duyệt Vé
- [ ] Quét mã QR/Barcode vé
- [ ] Xác minh thông tin hành khách
- [ ] Cập nhật trạng thái vé (đã sử dụng)
- [ ] Lịch sử kiểm duyệt

#### 3.3.2 Quản Lý Lên Tàu
- [ ] Danh sách hành khách
- [ ] Kiểm tra số lượng hành khách
- [ ] Quản lý vé mất/bị hư

#### 3.3.3 Quản Lý Bán Vé Quầy
- [ ] Tìm/Xem chuyến tàu
- [ ] Tạo đơn hàng bán trực tiếp
- [ ] Thanh toán tiền mặt
- [ ] In vé tại quầy

#### 3.3.4 Yêu Cầu Hỗ Trợ
- [ ] Quản lý yêu cầu khách hàng
- [ ] Xử lý vé mất/bị hư
- [ ] Đổi vé
- [ ] Hoàn tiền

---

## 4. CÁC TÍNH NĂNG QUAN TRỌNG

### 4.1 Bảo Mật
- [ ] Mã hóa mật khẩu (bcrypt/argon2)
- [ ] JWT/OAuth2 cho xác thực
- [ ] Rate limiting để chống DDoS
- [ ] Xác minh email/SMS
- [ ] 2FA (tuỳ chọn)

### 4.2 Hiệu Năng
- [ ] Cache vé để giảm tải DB
- [ ] Pagination cho danh sách lớn
- [ ] CDN cho hình ảnh
- [ ] Database query optimization

### 4.3 Tính Tin Cậy
- [ ] Ghi log chi tiết
- [ ] Monitoring hệ thống
- [ ] Backup dữ liệu
- [ ] Error handling toàn diện
- [ ] Transaction an toàn cho thanh toán

### 4.4 Trải Nghiệm Người Dùng
- [ ] Giao diện responsive
- [ ] Mobile app (tuỳ chọn)
- [ ] Tối ưu tốc độ tải trang
- [ ] UX trực quan

### 4.5 Tính Mở Rộng
- [ ] API RESTful/GraphQL
- [ ] Hỗ trợ nhiều tuyến đường
- [ ] Microservices (tuỳ chọn)

---

## 5. CƠNG NGHỆ ĐỀ XUẤT

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL/MongoDB
- **Cache**: Redis
- **Queue**: Bull/RabbitMQ
- **Payment**: Stripe/2Checkout
- **Email**: Nodemailer/SendGrid
- **Logging**: Winston/Pino

### Frontend
- **Framework**: React/Vue.js/Next.js
- **UI**: Material-UI/Ant Design
- **State Management**: Redux/Zustand
- **Http Client**: Axios/Fetch

### DevOps
- **Container**: Docker
- **Orchestration**: Kubernetes (tuỳ chọn)
- **CI/CD**: GitHub Actions/Jenkins
- **Hosting**: AWS/Azure/GCP

---

## 6. QUYỀN TRUY CẬP DỰA TRÊN VAI TRÒ (RBAC)

| Chức Năng | Customer | Staff | Admin | Super Admin |
|-----------|----------|-------|-------|-------------|
| Tìm kiếm chuyến | ✓ | ✓ | ✓ | ✓ |
| Đặt vé | ✓ | ✓ | ✓ | ✓ |
| Hủy vé | ✓ | ✓ | ✓ | ✓ |
| Quản lý tuyến | ✗ | ✗ | ✓ | ✓ |
| Quản lý tàu | ✗ | ✗ | ✓ | ✓ |
| Quản lý chuyến | ✗ | ✗ | ✓ | ✓ |
| Kiểm duyệt vé | ✗ | ✓ | ✓ | ✓ |
| Báo cáo | ✗ | ✗ | ✓ | ✓ |
| Quản lý người dùng | ✗ | ✗ | ✓ | ✓ |

---

## 7. CÁC QUYẾT ĐỊNH KINH DOANH QUAN TRỌNG

### 7.1 Chính Sách Hủy Vé
```
- Hủy >= 24h trước chuyến: Hoàn 100% - 10% phí hủy
- Hủy 12-24h trước: Hoàn 80% - 20% phí hủy
- Hủy < 12h trước: Hoàn 50%
- Hủy sau giờ khởi hành: Không hoàn tiền
```

### 7.2 Giá Vé
```
- Giá cơ bản = (Khoảng cách × Hằng số) + Lợi nhuận cơ bản
- Giá cao điểm (Thứ 2-5): Giá cơ bản × 1.2
- Giá giao động (Thứ 6-7, Lễ): Giá cơ bản × 1.5
- Giảm giá: Trẻ em (-30%), Người cao tuổi (-20%), Người khuyết tật (-50%)
```

### 7.3 Giữ Vé
```
- Thời gian giữ vé: 15 phút
- Tự động hủy giữ nếu không thanh toán
```

---

## 8. TIMELINE PHÁT TRIỂN ĐỀ XUẤT

### Phase 1 (Tuần 1-2): MVP
- [ ] Tuyến đường, tàu, chuyến tàu
- [ ] Đặt vé cơ bản
- [ ] Thanh toán
- [ ] Quản lý vé cơ bản

### Phase 2 (Tuần 3-4): Mở Rộng
- [ ] Hủy/hoàn tiền
- [ ] Báo cáo
- [ ] Hỗ trợ khách hàng
- [ ] Kiểm duyệt vé

### Phase 3 (Tuần 5-6): Tối Ưu
- [ ] Mobile app
- [ ] Caching/Performance
- [ ] Advanced reporting
- [ ] Integration các dịch vụ khác

---

## 9. ĐỊA ĐIỂM THAM CHIẾU: TUYẾN CAT LINH - HÀ ĐÔNG

### Thông Tin Cơ Bản
- **Tuyến**: Cat Linh - Hà Đông
- **Loại**: Đường sắt cao tốc (Elevated Railway)
- **Độ dài**: 13.05 km
- **Số ga**: 13 ga
- **Công suất thiết kế**: 120.000 hành khách/ngày
- **Thời gian chuyến**: ~30 phút (từ Cat Linh đến Hà Đông)

### Các Ga Chính
1. Cat Linh
2. Yên Phương
3. Vĩnh Tuy
4. Kim Mã
5. Cầu Giấy
6. Núi Trúc
7. Thái Thịnh
8. Minh Khai
9. Giáp Bát
10. Sài Đồng
11. Gia Lâm
12. Bắc Từ Liêm
13. Hà Đông

### Định Giá Tham Khảo
| Loại Vé | Giá (VND) |
|---------|----------|
| Vé lẻ | 20.000 |
| Vé 10 lượt | 180.000 |
| Vé 30 lượt | 500.000 |
| Vé tháng | 1.000.000 |

---

## 10. KPI THEO DÕI

- **Doanh thu hàng ngày/tuần/tháng**
- **Tỷ lệ bán vé (% ghế đã bán)**
- **Số lượng khách hàng mới/lặp lại**
- **Thời gian phản hồi hỗ trợ**
- **Tỷ lệ hủy vé**
- **Thời gian tải trang**
- **Tỷ lệ lỗi thanh toán**
- **Độ hài lòng khách hàng (NPS)**

---

## 11. LIÊN HỆ & BẢNG KIỂM

Sử dụng danh sách kiểm tra này để theo dõi tiến độ phát triển:

- [ ] Backend API hoàn thành
- [ ] Database schema hoàn thành
- [ ] Authentication/Authorization
- [ ] Frontend UI hoàn thành
- [ ] Intergration thanh toán
- [ ] Testing toàn diện
- [ ] Deployment
- [ ] Documentation hoàn thành
- [ ] Training nhân viên
- [ ] Go-live

---

**Cập nhật lần cuối**: Tháng 2, 2026
