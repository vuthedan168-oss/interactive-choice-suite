# Nexus Choice Suite (Interactive Troll & Choice Engine)

Dự án tương tác web hiện đại gồm 2 phần chơi tách biệt hoàn toàn giữa **Creator Studio (Giao diện người tạo)** và **Player Mode (Giao diện người chơi)**:

---

## 1. Phần 1: Nút Chạy Trốn (Do You Love Me / Troll Choice)
- **Cơ chế:** Khi người chơi di chuột hoặc chạm vào nút từ chối (ví dụ "Không bao giờ"), nút sẽ tính toán vector né tránh ngược hướng con trỏ chuột và lập tức nhảy vị trí khắp màn hình kèm bóng thoại comic hài hước ("Đố bắt được!", "Hụt rồi nha!", "Nút này bị cấm rồi!").
- **Màn hình ăn mừng:** Khi bấm vào nút bắt buộc (ví dụ "Có ơi là có"), hệ thống bắn pháo hoa Confetti, phát âm thanh chúc mừng bằng Web Audio API và hiển thị GIF ăn mừng do người tạo chọn.
- **Tùy biến:** Chọn chủ đề màu sắc (Tình yêu lãng mạn, Tình bạn thân thiết, Hài hước/Meme, Thảm đỏ hoàng gia), tích hợp chọn GIF có sẵn hoặc link trực tiếp từ Pixabay GIF / Giphy.

---

## 2. Phần 2: Đấu Trường Thảm Đỏ - Vua Giữ Đài (Celebrity Knockout)
- **16 Nhân vật đa lĩnh vực:** Sơn Tùng M-TP, Cristiano Ronaldo, Lionel Messi, Lisa (Blackpink), Taylor Swift, Trấn Thành, HIEUTHUHAI, Mỹ Tâm, Faker, Tom Cruise, Zendaya, Leonardo DiCaprio, Độ Mixi, Elon Musk, IU, MONO.
- **Thể thức:** "Vua giữ đài" loại trực tiếp. Người thắng giữ đài, người thua bị loại và đấu với người tiếp theo trong hàng chờ.
- **Giao diện:** Phong cách VIP Red Carpet sang trọng, tông màu đen huyền bí kết hợp ánh kim vàng (Gold Foil), hiệu ứng hào quang thảm đỏ, thẻ bài kích thước lớn đối kháng trực tiếp, thanh tiến trình đếm vòng.
- **Tính năng Vượt trội - Vua Chỉ Định (Rigged Winner):**
  - Người tạo có thể chỉ định 1 nhân vật bất khả chiến bại (hoặc tự thêm ảnh và tên của mình vào làm Trùm Cuối).
  - Khi trận đấu có nhân vật này xuất hiện, nếu người chơi cố tình di chuột hoặc bấm vào thẻ bài đối thủ, **thẻ bài đối thủ sẽ lập tức né tránh và nhảy khắp màn hình** hệt như nút từ chối ở Phần 1!
  - Người chơi buộc phải bấm chọn nhân vật được người tạo chỉ định để đăng quang Quán quân.

---

## 3. Tách Biệt Tuyệt Đối Giữa Người Tạo và Người Chơi
- **Creator Studio:** Có đầy đủ bảng điều khiển, nhập câu hỏi, sửa danh sách nhân vật, tải ảnh lên, cài đặt người thắng ẩn, lấy link chia sẻ.
- **Player View:** Khi mở link chia sẻ (`?play=1...`), toàn bộ giao diện quản trị bị ẩn hoàn toàn. Người chơi chỉ thấy màn hình tương tác và thanh tiêu đề tối giản có tên trò chơi cùng nút dẫn tới trang dự án để họ tự tạo thử thách của riêng mình.

---

## Cách Chạy Thử Nghiệm

Mở terminal tại thư mục này và gõ:
```bash
python -m http.server 8080
```
Hoặc nhấp đúp chuột vào file `run.bat`, sau đó mở trình duyệt tại:
`http://localhost:8080`
