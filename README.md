# GitFit 💪

> **Môn học:** CO3043 – Phát triển Ứng dụng trên Thiết bị Di động  
> **Trường:** Đại học Bách Khoa – ĐHQG TP.HCM (HCMUT)

[![CI – Test & SonarCloud](https://github.com/L01-GitFit/gitfit-app/actions/workflows/ci.yml/badge.svg)](https://github.com/L01-GitFit/gitfit-app/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=L01-GitFit_gitfit-app2&metric=alert_status)](https://sonarcloud.io/project/overview?id=L01-GitFit_gitfit-app2)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=L01-GitFit_gitfit-app2&metric=coverage)](https://sonarcloud.io/project/overview?id=L01-GitFit_gitfit-app2)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=L01-GitFit_gitfit-app2&metric=bugs)](https://sonarcloud.io/project/overview?id=L01-GitFit_gitfit-app2)

---

## 📖 Giới thiệu

**GitFit** là ứng dụng di động ghi chú tập luyện *(Fitness Tracking App)* được thiết kế dành cho người mới bắt đầu. Người dùng có thể:

- **Ghi nhật ký tập luyện** – log buổi tập nhanh chóng chỉ với vài thao tác
- **Lên kế hoạch cá nhân** – tạo lịch tập phù hợp với mục tiêu của bản thân

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | [Expo](https://expo.dev) (SDK 54) + [React Native](https://reactnative.dev) 0.81 |
| Routing | [Expo Router](https://expo.github.io/router) v6 |
| Styling | [NativeWind](https://www.nativewind.dev) (Tailwind CSS) |
| State Management | [Zustand](https://zustand-demo.pmnd.rs) |
| Backend / Auth | [NestJS + PostgreSQL](https://github.com/L01-GitFit/gitfit-webservice) |
| Form & Validation | TanStack Form + [Zod](https://zod.dev) |
| Testing | Jest 29 + [React Native Testing Library](https://callstack.github.io/react-native-testing-library) |
| CI/CD | GitHub Actions |
| Code Quality | SonarCloud |
| Language | TypeScript |

---

## 🚀 Cài đặt & Chạy ứng dụng

```bash
# 1. Clone repo
git clone https://github.com/L01-GitFit/gitfit-app.git
cd gitfit-app

# 2. Cài dependencies
npm install --legacy-peer-deps

# 3. Tạo file môi trường
cp .env.example .env
# Điền EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_ANON_KEY

# 4. Chạy app (cần Expo Dev Client)
npm start
```

---

## 🧪 Chạy Test Locally

### Chạy toàn bộ test

```bash
npm test
```

### Chạy với coverage report

```bash
npm run test:coverage
# hoặc đúng lệnh CI:
npx jest --coverage --coverageReporters=lcov --passWithNoTests --runInBand
```

### Chạy 1 file test cụ thể

```bash
npx jest __tests__/screens/HomeScreen.test.tsx --runInBand
```

### Cấu trúc thư mục test

```
__tests__/
├── components/
│   ├── BottomTabBar.test.tsx
│   ├── Button.test.tsx
│   ├── Container.test.tsx
│   └── MiscComponents.test.tsx   # HeaderButton, TabBarIcon
├── screens/
│   ├── HomeScreen.test.tsx
│   ├── TwoScreen.test.tsx
│   ├── ProfileScreen.test.tsx
│   ├── OnboardingScreens.test.tsx
│   ├── TabOnScreens.test.tsx
│   └── MiscScreens.test.tsx      # Modal, NotFound
├── store/
│   └── store.test.ts
└── utils/
    └── supabase.test.ts
```

> **Coverage hiện tại:** ~87% Statements · ~87% Functions · ~87% Lines

---

## ⚙️ CI/CD Pipeline

Mỗi lần push lên `main` / `develop` hoặc mở Pull Request vào `main`, GitHub Actions sẽ tự động:

1. Cài dependencies (`npm install --legacy-peer-deps`)
2. Chạy Jest với coverage (`--runInBand`)
3. Upload `coverage/lcov.info` lên SonarCloud

```
push / PR
   │
   ▼
GitHub Actions
   ├── npm install
   ├── jest --coverage
   └── sonar-scanner
          │
          ▼
      SonarCloud Dashboard
```

---

## 📁 Cấu trúc dự án

```
gitfit-expo-app/
├── app/                   # Màn hình (Expo Router file-based routing)
│   ├── (tabs)/            # Tab screens: Home, Workout, Profile
│   ├── onboarding.tsx
│   ├── onboarding2.tsx
│   └── onboarding3.tsx
├── components/            # Reusable UI components
├── store/                 # Zustand global state
├── utils/                 # Tiện ích (Supabase client, ...)
├── __tests__/             # Jest test suites
├── __mocks__/             # Jest mock files
├── docs/                  # Tài liệu kỹ thuật
│   └── testing_setup.md
└── .github/workflows/
    └── ci.yml             # GitHub Actions workflow
```

---

## 👥 Nhóm phát triển

Dự án thuộc **nhóm L01 – GitFit**, môn CO3043, HK 252, HCMUT.
