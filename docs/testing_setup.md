# 📋 Hướng dẫn Testing + CI/CD cho GitFit

> **Dự án:** GitFit Mobile (React Native / Expo)  
> **Trạng thái hiện tại:** Đã cấu hình Jest, sample tests, GitHub Actions CI, và SonarCloud scan

---

## 📌 Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Jest & React Native Testing Library](#2-jest--react-native-testing-library)
3. [GitHub Actions CI/CD](#3-github-actions-cicd)
4. [SonarCloud](#4-sonarcloud)
5. [Luồng hoạt động end-to-end](#5-luồng-hoạt-động-end-to-end)
6. [Các lỗi thường gặp & cách fix](#6-các-lỗi-thường-gặp--cách-fix)

---

## 1. Tổng quan hệ thống

```text
Developer push code
        │
        ▼
┌──────────────────────────┐
│      GitHub Actions      │  ← trigger khi push main/develop hoặc PR vào main
│                          │
│  1. npm install          │
│  2. jest --coverage      │  ← sinh coverage/lcov.info
│  3. sonar-scanner        │  ← gửi kết quả lên SonarCloud
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│        SonarCloud        │
│                          │
│  • Coverage              │
│  • Bugs                  │
│  • Code Smells           │
│  • Quality Gate          │
└──────────────────────────┘
```

Hiện tại project đã có các thành phần sau:

- `jest.config.js`
- `jest.setup.js`
- `__mocks__/fileMock.js`
- `__mocks__/expoWinterMock.js`
- `__mocks__/styleMock.js`
- `__tests__/components/Button.test.tsx`
- `__tests__/components/Container.test.tsx`
- `__tests__/screens/HomeScreen.test.tsx`
- `__tests__/store/store.test.ts`
- `.github/workflows/ci.yml`
- `sonar-project.properties`

---

## 2. Jest & React Native Testing Library

### 2.1 Packages đang dùng

Trong `package.json`, testing stack hiện tại là:

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^13.3.3",
    "@types/jest": "^29.5.14",
    "jest": "^29.7.0",
    "jest-expo": "^54.0.13"
  }
}
```

Scripts đang có:

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage --coverageReporters=lcov --passWithNoTests"
  }
}
```

### 2.2 Cấu trúc file test thực tế

```text
gitfit-expo-app/
├── __tests__/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   └── Container.test.tsx
│   ├── screens/
│   │   └── HomeScreen.test.tsx
│   └── store/
│       └── store.test.ts
├── __mocks__/
│   ├── expoWinterMock.js
│   ├── fileMock.js
│   └── styleMock.js
├── jest.config.js
└── jest.setup.js
```

### 2.3 Cấu hình Jest hiện tại

Đây là cấu hình đang chạy thực tế trong project:

```js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(?:-community)?|expo(?:nent)?|@expo(?:nent)?/.*|expo-router|@expo-google-fonts/.*|nativewind|react-native-css-interop|react-native-safe-area-context|react-native-reanimated|react-native-worklets|@react-navigation/.*|@supabase/supabase-js))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo/src/winter(.*)$': '<rootDir>/__mocks__/expoWinterMock.js',
    '\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/dist/'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
};
```

### 2.4 Setup file hiện tại

`jest.setup.js` hiện đang xử lý 3 việc:

1. Gán placeholder env vars cho Supabase khi chạy test.
2. Mock `react-native-reanimated`.
3. Mock `expo-font` và `expo-splash-screen` để tránh phụ thuộc runtime thật của Expo.

```js
process.env.EXPO_PUBLIC_SUPABASE_URL ||= 'https://placeholder.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||= 'placeholder-anon-key';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}));
```

### 2.5 Mock files hiện tại

```js
// __mocks__/fileMock.js
module.exports = 'test-file-stub';
```

```js
// __mocks__/expoWinterMock.js
module.exports = {};
```

```js
// __mocks__/styleMock.js
module.exports = {};
```

### 2.6 Sample tests đang có

Project hiện có 4 test files mẫu:

- `Button.test.tsx`: kiểm tra render title và `onPress`
- `Container.test.tsx`: kiểm tra render children
- `HomeScreen.test.tsx`: kiểm tra screen render title và file path
- `store.test.ts`: kiểm tra các action của Zustand store

Ví dụ test screen hiện tại:

```tsx
import { render } from '@testing-library/react-native';

import Home from '@/app/(tabs)/index';

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

describe('Home screen', () => {
  it('renders the title and file path', () => {
    const { getByText } = render(<Home />);

    expect(getByText('Tab One')).toBeTruthy();
    expect(getByText('app/(tabs)/index.tsx')).toBeTruthy();
  });
});
```

### 2.7 Lệnh chạy test thực tế

```bash
# Chạy toàn bộ test
npm test

# Chạy coverage theo script của project
npm run test:coverage

# Chạy trực tiếp qua Jest
npx jest --runInBand

# Chạy coverage theo đúng lệnh CI
npx jest --coverage --coverageReporters=lcov --passWithNoTests --runInBand

# Chạy 1 file test cụ thể
npx jest __tests__/store/store.test.ts --runInBand
```

### 2.8 Kết quả xác minh local

Các lệnh sau đã chạy pass trong môi trường local:

```bash
npx jest __tests__/store/store.test.ts --runInBand
npx jest --runInBand
npx jest --coverage --coverageReporters=lcov --passWithNoTests --runInBand
```

---

## 3. GitHub Actions CI/CD

### 3.1 Workflow hiện tại

File `.github/workflows/ci.yml` đang có nội dung thực tế như sau:

```yaml
name: CI - Test and SonarCloud Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-and-analyze:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm install --legacy-peer-deps

      - name: Run Jest with coverage
        run: npx jest --coverage --coverageReporters=lcov --passWithNoTests --runInBand
        env:
          EXPO_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          EXPO_PUBLIC_SUPABASE_ANON_KEY: placeholder-anon-key

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/lcov.info
          retention-days: 7

      - name: Install SonarQube Scanner
        run: npm install -g sonarqube-scanner

      - name: SonarCloud Scan
        run: sonar-scanner
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: https://sonarcloud.io
```

### 3.2 Những điểm cần lưu ý

- Workflow dùng `npm install --legacy-peer-deps`, không dùng `npm ci`.
- Supabase env var đúng trong CI là `EXPO_PUBLIC_SUPABASE_URL` và `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Lệnh test trong CI dùng `--runInBand` để giảm rủi ro lỗi môi trường song song.
- File coverage được upload là `coverage/lcov.info`.

### 3.3 Secrets cần có trên GitHub

Bạn cần đảm bảo repo có secret sau:

- `SONAR_TOKEN`

`GITHUB_TOKEN` không cần tự tạo vì GitHub Actions cung cấp sẵn.

---

## 4. SonarCloud

### 4.1 Cấu hình hiện tại

`sonar-project.properties` hiện tại là:

```properties
sonar.projectKey=L01-GitFit_gitfit-app
sonar.organization=l01-gitfit

sonar.projectName=gitfit-app
sonar.projectVersion=1.0.0

sonar.sources=app,components,store,utils
sonar.tests=__tests__
sonar.test.inclusions=**/__tests__/**/*.test.ts,**/__tests__/**/*.test.tsx

sonar.exclusions=**/node_modules/**,**/coverage/**,**/*.d.ts,**/assets/**,**/.expo/**,**/dist/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.sourceEncoding=UTF-8
```

### 4.2 Ý nghĩa config hiện tại

- `sonar.projectKey=L01-GitFit_gitfit-app`: key đang dùng để scan project
- `sonar.organization=l01-gitfit`: organization đang cấu hình trong repo
- `sonar.sources=app,components,store,utils`: chỉ scan các thư mục mã nguồn chính
- `sonar.tests=__tests__`: toàn bộ test nằm trong `__tests__`
- `sonar.javascript.lcov.reportPaths=coverage/lcov.info`: đọc coverage report từ Jest

### 4.3 Cần kiểm tra gì trước khi push CI thật

Hai giá trị sau phải khớp đúng với project đã tạo trên SonarCloud:

- `sonar.projectKey`
- `sonar.organization`

Nếu project SonarCloud của bạn dùng key hoặc organization khác, cần sửa lại file `sonar-project.properties` trước khi push.

### 4.4 Thiết lập SonarCloud lần đầu

1. Đăng nhập vào `https://sonarcloud.io` bằng GitHub.
2. Tạo hoặc chọn project tương ứng với repo `L01-GitFit/gitfit-app`.
3. Tắt `Automatic Analysis` nếu đang bật.
4. Tạo token tại `My Account -> Security`.
5. Thêm token này vào GitHub Secrets với tên `SONAR_TOKEN`.

---

## 5. Luồng hoạt động end-to-end

```text
1. Developer viết code + test
        │
        ▼
2. Push code lên GitHub
        │
        ▼
3. GitHub Actions chạy workflow CI
   ├── npm install --legacy-peer-deps
   ├── npx jest --coverage --coverageReporters=lcov --passWithNoTests --runInBand
   ├── upload coverage/lcov.info
   └── sonar-scanner
        │
        ▼
4. SonarCloud hiển thị coverage + quality metrics
```

---

## 6. Các lỗi thường gặp & cách fix

### Lỗi 1: `npm ci` hoặc `npm install` fail do peer dependencies

```text
npm warn Could not resolve dependency
```

**Fix:** dùng đúng lệnh đang cấu hình trong CI:

```bash
npm install --legacy-peer-deps
```

### Lỗi 2: Expo ESM lỗi `import.meta` trong Jest

```text
ReferenceError: You are trying to import a file outside of the scope
at expo/src/winter/installGlobal.ts
```

**Fix:** đảm bảo `jest.config.js` có mapping sau:

```js
moduleNameMapper: {
  '^expo/src/winter(.*)$': '<rootDir>/__mocks__/expoWinterMock.js',
}
```

Và file mock:

```js
module.exports = {};
```

### Lỗi 3: Font hoặc SplashScreen làm screen test bị crash

**Fix:** giữ lại các mock trong `jest.setup.js`:

```js
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}));
```

### Lỗi 4: CI bị fail vì thiếu env vars Supabase

**Fix:** workflow hiện tại đã dùng placeholder:

```yaml
env:
  EXPO_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY: placeholder-anon-key
```

Không dùng `EXPO_PUBLIC_SUPABASE_KEY` trong config hiện tại.

### Lỗi 5: SonarCloud báo conflict với Automatic Analysis

```text
ERROR: You are running CI analysis while Automatic Analysis is enabled.
```

**Fix:** vào SonarCloud -> project -> `Administration -> Analysis Method` và tắt `Automatic Analysis`.

### Lỗi 6: `SONAR_TOKEN` chưa được cấu hình

**Fix:** thêm GitHub repository secret:

- Name: `SONAR_TOKEN`
- Value: token tạo từ SonarCloud

### Lỗi 7: Repo bị bẩn sau khi chạy coverage local

Hiện tại `coverage/` đã được thêm vào `.gitignore`, nên nếu còn xuất hiện trong git status thì chỉ cần xóa thư mục cũ rồi chạy lại:

```bash
Remove-Item -Recurse -Force coverage
```