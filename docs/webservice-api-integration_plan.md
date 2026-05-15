Hiện trạng mình đã rà soát nhanh:
1. Backend đã có đủ module chính cho app mobile, và tất cả response đi qua envelope success/data/meta tại gitfit-webservice/src/common/interceptors/transform.interceptor.ts và bootstrap ở gitfit-webservice/src/main.ts.
2. Frontend đã có nền tảng gọi API qua Axios interceptor tại gitfit-expo-app/utils/apiClient.ts, nhưng mới tích hợp một phần endpoint ở gitfit-expo-app/services/gitfit.service.ts.
3. Nhiều màn vẫn dùng mock/local state: gitfit-expo-app/app/(tabs)/home/index.tsx/home/index.tsx), gitfit-expo-app/app/(tabs)/profile/index.tsx/profile/index.tsx), gitfit-expo-app/app/workout-detail.tsx, gitfit-expo-app/app/(tabs)/workout/index.tsx/workout/index.tsx), gitfit-expo-app/store/routine.store.ts, gitfit-expo-app/store/workoutSession.store.ts.

Kế hoạch tích hợp API webservice vào frontend (đề xuất theo phase)

**Phase 0: Chốt contract và quy ước dữ liệu**
1. Chốt chuẩn response frontend sẽ đọc theo envelope success/data/meta cho toàn bộ call backend.
2. Chốt chuẩn error message từ backend để map UI toast/alert theo statusCode ở gitfit-webservice/src/common/filters/prisma-exception.filter.ts.
3. Chốt mapping kiểu dữ liệu giữa DTO backend và types frontend, đặc biệt:
- Profile update DTO: gitfit-webservice/src/modules/users/dto/update-profile.dto.ts
- Add exercise vào routine: gitfit-webservice/src/modules/routines/dto/add-exercise-to-routine.dto.ts
- Create session/log set: gitfit-webservice/src/modules/workout-sessions/dto/create-workout-session.dto.ts, gitfit-webservice/src/modules/workout-sessions/dto/create-set.dto.ts

**Phase 1: Auth và session lifecycle (ưu tiên cao nhất)**
1. Giữ flow login hiện tại (test account) tại gitfit-expo-app/hooks/useGoogleLogin.ts, vẫn giữ nguyên việc command gg oauth để có thể build và chạy trên expo go.
2. Chuẩn hóa refresh token theo endpoint auth refresh ở gitfit-webservice/src/modules/auth/auth.controller.ts.
3. Thêm luồng logout gọi backend auth logout trước khi clear local auth.
4. Đảm bảo router guard ở gitfit-expo-app/app/_layout.tsx xử lý đúng khi token hết hạn.

**Phase 2: Routine + Exercise picker**
1. Thay local routine store bằng dữ liệu backend cho các thao tác:
- GET/POST/PATCH/DELETE routines
- POST/PATCH/DELETE routine exercises
2. Điểm tích hợp UI chính:
- gitfit-expo-app/app/(tabs)/workout/index.tsx/workout/index.tsx)
- gitfit-expo-app/app/create-routine.tsx
- gitfit-expo-app/app/add-exercise.tsx
3. Giữ external ExerciseDB ở client để browse/search, nhưng khi gắn vào routine thì gửi payload exercise đầy đủ theo backend DTO (đã đúng hướng hiện tại).

**Phase 3: Workout session real-time**
1. Khi Start Empty Workout hoặc Start Routine:
- Tạo session thật qua POST workout-sessions
- Lưu sessionId backend vào state
2. Khi tick set hoàn thành:
- Dùng endpoint log set POST workout-sessions/:id/sets
- Đồng bộ PR flag và invalidate query
3. Khi Finish/Discard:
- Finish gọi PATCH :id/finish
- Discard gọi PATCH :id/cancel
4. Màn liên quan:
- gitfit-expo-app/app/workout-log.tsx
- gitfit-expo-app/hooks/useLogSet.ts

**Phase 4: History/Home/Detail**
1. Home chuyển từ mock sang dữ liệu completed sessions + summary.
2. Workout detail chuyển từ MOCK_WORKOUTS sang session detail thật.
3. Endpoint dùng:
- GET workout-sessions
- GET workout-sessions/:id
- Có thể bổ sung workout-sets nested CRUD nếu cần edit set sau khi log.
4. Màn liên quan:
- gitfit-expo-app/app/(tabs)/home/index.tsx/home/index.tsx)
- gitfit-expo-app/app/workout-detail.tsx

**Phase 5: Profile và thống kê**
1. Profile:
- GET users/me để bind dữ liệu thật
- PATCH users/me để lưu form
- Màn: gitfit-expo-app/app/(tabs)/profile/index.tsx/profile/index.tsx)
2. Stats/PR:
- Tận dụng stats module và personal-records để thay phần records mock bằng dữ liệu thật.
3. Có thể để Programs ở phase sau nếu UI chưa sẵn.

Danh sách endpoint ưu tiên tích hợp trước
1. Auth: POST auth/login, POST auth/refresh, POST auth/logout
2. User: GET users/me, PATCH users/me
3. Routines: GET/POST/PATCH/DELETE routines, POST/PATCH/DELETE routines/:id/exercises/:exerciseId
4. Workout sessions: GET list, GET detail, POST create, PATCH finish, PATCH cancel, POST :id/sets
5. Workout sets nested: GET/POST/PATCH/DELETE workout-sessions/:sessionId/workout-sets (cho nhu cầu chỉnh set chi tiết)

Rủi ro cần xử lý sớm
1. Sai lệch schema response giữa backend envelope và kiểu trả về frontend hiện tại.
2. Trùng luồng quản lý state local và backend gây lệch dữ liệu nếu không định nghĩa single source of truth.
3. Race condition khi refresh token nếu nhiều request 401 cùng lúc.
4. Màn Home/Detail đang phụ thuộc mock image/url Figma, cần fallback khi data thật không có avatar/gif.

Definition of Done cho tích hợp
1. Toàn bộ màn chính Home/Workout/Profile không còn mock dữ liệu cốt lõi.
2. Start workout, log set, finish session chạy end-to-end với backend.
3. Sau restart app vẫn giữ phiên đăng nhập đúng.
4. Lỗi API hiển thị thông điệp rõ ràng theo từng case 401/403/404/409/422.
5. Test smoke cho các flow: login, create routine, add exercise, log workout, xem history, update profile.

Nếu bạn muốn, bước tiếp theo mình có thể chuyển kế hoạch này thành checklist triển khai theo từng file cụ thể (task breakdown theo ngày/sprint) để team frontend làm ngay.