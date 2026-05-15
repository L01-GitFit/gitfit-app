# GitFit 💪

> **Môn học:** CO3043 – Phát triển Ứng dụng trên Thiết bị Di động  
> **Trường:** Đại học Bách Khoa – ĐHQG TP.HCM (HCMUT)  
> **Nhóm:** L01 – GitFit

[![CI – Test & SonarCloud](https://github.com/L01-GitFit/gitfit-app/actions/workflows/ci.yml/badge.svg)](https://github.com/L01-GitFit/gitfit-app/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=L01-GitFit_gitfit-app2&metric=alert_status)](https://sonarcloud.io/project/overview?id=L01-GitFit_gitfit-app2)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=L01-GitFit_gitfit-app2&metric=coverage)](https://sonarcloud.io/project/overview?id=L01-GitFit_gitfit-app2)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=L01-GitFit_gitfit-app2&metric=bugs)](https://sonarcloud.io/project/overview?id=L01-GitFit_gitfit-app2)

---

## 📖 Giới thiệu

**GitFit** là ứng dụng di động ghi chú tập luyện *(Fitness Tracking App)* được thiết kế dành cho người yêu thích fitness. Người dùng có thể:

- 🏋️ **Ghi nhật ký tập luyện** – Log buổi tập nhanh chóng với tracking sets, reps, weight
- 📋 **Lên kế hoạch cá nhân** – Tạo và quản lý workout routines theo mục tiêu
- 📊 **Theo dõi tiến độ** – Xem lịch sử tập luyện, personal records, và thống kê chi tiết
- 🎯 **Bảng tập tối ưu** – Tìm kiếm exercises với bộ lọc theo muscle group, body part, equipment

---

## 🛠️ Công nghệ Stack

### Frontend & UI
| Package | Version | Mục đích |
|---|---|---|
| **Expo** | ^54.0.0 | Managed React Native framework |
| **React Native** | 0.81.5 | Cross-platform mobile framework |
| **Expo Router** | ~6.0.10 | File-based routing (Expo Router v6) |
| **NativeWind** | latest | Tailwind CSS cho React Native |
| **Tailwind CSS** | ^3.4.0 | Styling utility framework |
| **React Native Reanimated** | ~4.1.1 | Smooth animations & gestures |
| **React Native Gesture Handler** | ~2.28.0 | Native gesture support |
| **React Native Web** | ^0.21.0 | Web support |

### State Management & Data Fetching
| Package | Version | Mục đích |
|---|---|---|
| **Zustand** | ^4.5.1 | Lightweight state management |
| **Immer** | ^11.1.6 | Immutable state updates |
| **TanStack React Query** | ^5.99.0 | Server state management & caching |
| **TanStack React Form** | ^1.29.0 | Form state management |
| **Zod** | ^3.25.76 | Schema validation |
| **Axios** | ^1.15.2 | HTTP client |

### Authentication & Storage
| Package | Version | Mục đích |
|---|---|---|
| **@react-native-async-storage** | 2.2.0 | AsyncStorage |
| **expo-secure-store** | ~15.0.8 | Secure token storage |

### Error Tracking & Analytics
| Package | Version | Mục đích |
|---|---|---|
| **@sentry/react-native** | ^8.11.1 | Error tracking & performance monitoring |

### Navigation & UI Components
| Package | Version | Mục đích |
|---|---|---|
| **@react-navigation/native** | ^7.1.6 | React Navigation |
| **react-native-screens** | ~4.16.0 | Native screen components |
| **react-native-safe-area-context** | ~5.6.0 | Safe area context |
| **@expo/vector-icons** | ^15.0.2 | Vector icons library |

### Development & Testing
| Package | Version | Mục đích |
|---|---|---|
| **TypeScript** | ~5.9.2 | Type safety |
| **Jest** | ^29.7.0 | Testing framework |
| **jest-expo** | ^54.0.13 | Expo Jest preset |
| **@testing-library/react-native** | ^13.3.3 | React Native testing utilities |
| **ESLint** | ^9.25.1 | Code linting (flat config) |
| **Prettier** | ^3.2.5 | Code formatting |
| **Babel** | ^7.x | JavaScript transpiler |

### Build & Deployment
| Tool | Mục đích |
|---|---|
| **EAS Build** | Managed builds (iOS/Android) |
| **Metro** | React Native bundler (integrated Sentry) |
| **SonarCloud** | Code quality analysis |
| **GitHub Actions** | CI/CD automation |

---

## 🚀 Cài đặt & Chạy ứng dụng

### Prerequisites

- **Node.js** 18+ và npm/pnpm
- **Expo CLI** (cài tự động với Expo SDK)
- **iOS**: Xcode 15+ (macOS) + iOS 15+
- **Android**: Android Studio + SDK level 31+
- **Development Device/Emulator** hoặc Expo Go app

### 1. Clone Repository

```bash
git clone https://github.com/L01-GitFit/gitfit-app.git
cd gitfit-app
```

### 2. Cài Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` được sử dụng vì React 19 và một số packages chưa update peer dependencies.

### 3. Tạo Environment File

```bash
cp .env .env.local
```

Cấu trúc `.env.local` (để credentials riêng):

```env
# Backend API
EXPO_PUBLIC_BACKEND_URL=https://gitfit-webservice.onrender.com

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=32856902299-b1fbn9teftap8ue1h6h7s8fms0jmpgmd.apps.googleusercontent.com

# Sentry Error Tracking (optional, dev token in .env.local)
SENTRY_AUTH_TOKEN=sntrys_eyJ...

# Test Credentials (test user)
EXPO_PUBLIC_TEST_EMAIL=test@gmail.com
EXPO_PUBLIC_TEST_PASSWORD=test123
```

### 4. Chạy Development Server

#### iOS (macOS)

```bash
npm start
# Hoặc
expo start --dev-client

# Sau đó nhấn 'i' để chạy iOS simulator
npm run ios
```

#### Android

```bash
npm start
npm run android
```

#### Web

```bash
npm run web
```

### 5. Build để Testing/Deployment

#### Development Build (with Expo Dev Client)

```bash
npm run build:dev
# hoặc
eas build --profile development
```

#### Preview Build

```bash
npm run build:preview
eas build --profile preview
```

#### Production Build

```bash
npm run build:prod
eas build --profile production
```

---

## 🧪 Testing & Code Quality

### Chạy Test

#### Toàn bộ Test Suite

```bash
npm test
# hoặc
npm run test
```

#### Test Coverage Report

```bash
npm run test:coverage
```

Kết quả:
- Coverage report: `coverage/lcov.info` (LCOV format)
- HTML report: `coverage/lcov-report/index.html`

#### Test File Cụ Thể

```bash
npm test -- __tests__/screens/HomeScreen.test.tsx
# hoặc chỉ định pattern
npm test -- workout
```

#### Watch Mode

```bash
npm test -- --watch
```

### Linting & Code Formatting

#### Check Linting

```bash
npm run lint
```

#### Format Code

```bash
npm run format
```

### Current Test Coverage

- **Statements:** 89.43%
- **Functions:** 84.69%
- **Branches:** 75.54%
- **Lines:** 89.43%
- **Total Tests:** 284 passing

---

## 📁 Project Structure

```
gitfit-expo-app/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (auth)/
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── signin.tsx            # Login screen
│   │   ├── signup.tsx            # Registration screen
│   │   ├── forgot-password.tsx   # Password recovery request
│   │   ├── reset-password.tsx    # Password reset flow
│   │   └── onboarding.tsx        # Onboarding screens
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── home/                 # Home tab
│   │   ├── workout/              # Workout tab
│   │   └── profile/              # Profile tab
│   ├── _layout.tsx               # Root layout (Sentry, QueryClient, Router setup)
│   ├── +html.tsx                 # Web entry point
│   ├── +not-found.tsx            # 404 page
│   ├── modal.tsx                 # Modal wrapper
│   ├── create-routine.tsx        # Create workout routine workflow
│   ├── add-exercise.tsx          # Add exercise to routine workflow
│   ├── workout-detail.tsx        # View workout details
│   └── workout-log.tsx           # Log workout session
│
├── components/                   # Reusable UI components
│   ├── ApiErrorDialog.tsx        # Error display modal
│   ├── AuthScreens.tsx           # Auth component wrappers
│   ├── BottomTabBar.tsx          # Custom tab bar
│   ├── Button.tsx                # Reusable button
│   ├── Container.tsx             # Safe area wrapper
│   ├── HeaderButton.tsx          # Header action buttons
│   ├── ScreenContent.tsx         # Screen content layout
│   ├── TabBarIcon.tsx            # Tab bar icons
│   └── workout/
│       ├── DiscardWorkoutDialog.tsx    # Discard confirmation
│       ├── ExerciseCard.tsx            # Exercise display
│       ├── ExerciseLogCard.tsx         # Set logging UI
│       ├── ExerciseSelectCard.tsx      # Exercise selector
│       ├── FloatingWorkoutBanner.tsx   # Active session banner
│       ├── RoutineSetRow.tsx           # Routine set row editor
│       └── SetRow.tsx                  # Workout set row editor
│
├── hooks/                        # Custom React hooks
│   ├── useAddExerciseToRoutine.ts
│   ├── useBodyParts.ts
│   ├── useEquipments.ts
│   ├── useExercisesByBodyPart.ts
│   ├── useExercisesByEquipment.ts
│   ├── useExercisesByMuscle.ts
│   ├── useExerciseSearch.ts      # Search exercises with pagination
│   ├── useGoogleLogin.ts
│   ├── useLogSet.ts              # Log single set mutation
│   ├── useMuscles.ts
│   ├── useSignIn.ts              # Email/password login
│   └── useSignUp.ts              # Registration
│
├── services/                     # API & external service integrations
│   ├── exercisedb.service.ts     # ExerciseDB API client
│   └── gitfit.service.ts         # GitFit backend API client
│
├── store/                        # Zustand global state management
│   ├── authStore.ts              # Auth state (tokens, user profile)
│   ├── routine.store.ts          # Routine creation draft state
│   ├── workoutSession.store.ts   # Active workout session state
│   └── store.ts                  # Misc/general store
│
├── types/                        # TypeScript type definitions
│   └── exercise.types.ts         # Exercise, Routine, Set, Workout types
│
├── utils/                        # Utility functions & helpers
│   ├── apiClient.ts              # Axios HTTP client with interceptors
│   ├── apiErrorMessage.ts        # Error message parsing
│   ├── sentryAnalytics.ts        # Sentry event tracking
│   └── sentryUser.ts             # Sentry user identification
│
├── assets/                       # Images and static assets
│   ├── icon.png, splash.png      # App icons
│   ├── b1-3.jpg, d1-3.jpg        # Onboarding images
│   └── exercise.png, record.png  # UI assets
│
├── __tests__/                    # Jest test suites (284 tests)
│   ├── components/               # Component unit tests
│   ├── hooks/                    # Hook tests
│   ├── screens/                  # Screen integration tests
│   ├── services/                 # Service & API mock tests
│   ├── store/                    # Store state tests
│   └── utils/                    # Utility function tests
│
├── __mocks__/                    # Jest mock implementations
│   ├── axios.ts                  # Axios mock
│   ├── @sentry/                  # Sentry mock
│   ├── expoWinterMock.js         # Expo modules mock
│   └── fileMock.js, styleMock.js # Asset mocks
│
├── .github/workflows/
│   └── ci.yml                    # GitHub Actions CI/CD pipeline
│
├── docs/                         # Technical documentation
│   ├── testing_setup.md
│   ├── TEST_COVERAGE_SUMMARY.md
│   ├── cache_on_demand_frontend.md
│   ├── webservice-api-integration_plan.md
│   └── design-tokens.tokens.json
│
├── android/                      # Android native code & Gradle config
├── coverage/                     # Test coverage reports
├── node_modules/
├── .env                          # Environment variables (committed)
├── .env.local                    # Local overrides (NOT committed)
├── .gitignore
│
├── Configuration Files:
│   ├── app.json                  # Expo app config (iOS, Android, plugins)
│   ├── babel.config.js           # Babel presets (Expo, NativeWind, Worklets)
│   ├── jest.config.js            # Jest testing config
│   ├── jest.setup.js             # Jest setup (mocks, global setup)
│   ├── tsconfig.json             # TypeScript config (@/* alias)
│   ├── tailwind.config.js        # Tailwind CSS custom config
│   ├── eslint.config.js          # ESLint flat config
│   ├── prettier.config.js        # Prettier formatting rules
│   ├── metro.config.js           # Metro bundler with Sentry
│   ├── sonar-project.properties  # SonarCloud project config
│   └── eas.json                  # EAS build profiles
│
├── package.json
├── package-lock.json
└── README.md
```

### Key Architecture Patterns

#### File-Based Routing (Expo Router v6)

- `app/_layout.tsx` – Root layout wrapper (error boundary, providers)
- `app/(auth)/` – Auth group (auto-stacked layout, hidden from tabs)
- `app/(tabs)/` – Tab group (bottom tab navigator)
- Dynamic routes: `[id].tsx` para sa route params

#### State Management

- **Auth:** Zustand store with Secure Store persistence
- **Routines:** Zustand store with draft management
- **Workout Sessions:** Zustand store with exercise/set tracking
- **Server State:** TanStack React Query for backend data + caching

#### Component Organization

- **Smart Components** (screens in `app/`) – Fetch data, manage state
- **UI Components** (`components/`) – Presentational, reusable
- **Workout Components** (`components/workout/`) – Domain-specific UI

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

**Trigger Events:**
- `push` to `main`, `dev`
- `pull_request` to `main`

**Pipeline Steps:**

1. **Checkout** – Clone repo with full history
2. **Setup Node.js 20** – Node environment + npm cache
3. **Install Dependencies** – `npm install --legacy-peer-deps`
4. **Run Jest Tests with Coverage**
   ```bash
   npm run test:coverage
   # or
   npx jest --coverage --coverageReporters=lcov --passWithNoTests --runInBand
   ```
5. **Upload Coverage Artifact** – 7-day retention in GitHub
6. **SonarCloud Analysis**
   - Install: `npm install -g sonarqube-scanner`
   - Scan: `sonar-scanner` with SONAR_TOKEN + GITHUB_TOKEN

**Pipeline Duration:** ~5-7 minutes

**Artifacts:**
- Coverage report: `coverage/lcov.info`
- SonarCloud dashboard update

---

## 🔍 Integrations & Monitoring

### Sentry Error Tracking

**Configuration:**
- **Organization:** gitfit-pu
- **Project:** react-native
- **DSN:** https://bc828750025345574a2c4aeee86746cf@o4511343459565568.ingest.de.sentry.io/4511375879307344

**Setup:**
- Plugin: `@sentry/react-native/expo` in `app.json`
- Initialization: `app/_layout.tsx`
- Features:
  - Tracing: 100% sample rate
  - Session Replay: 10% normal, 100% on error
  - Native frames tracking
  - User feedback collection

**Usage:**
```typescript
import { identifySentryUser, clearSentryUser } from '@/utils/sentryUser';
import { trackEvent } from '@/utils/sentryAnalytics';

// Identify user on login
identifySentryUser({ userId: user.id, email: user.email });

// Track custom events
trackEvent('workout_completed', { exerciseCount: 5, duration: 45 });

// Clear on logout
clearSentryUser();
```

### SonarCloud Code Quality

**Project:**
- **Organization:** L01-GitFit
- **Project Key:** L01-GitFit_gitfit-app2
- **Dashboard:** https://sonarcloud.io/project/overview?id=L01-GitFit_gitfit-app2

**Metrics Tracked:**
- Code coverage (LCOV)
- Code smells & bugs
- Vulnerabilities
- Duplications
- Maintainability index

**Configuration:**
- Source: `app/`, `components/`, `store/`, `utils/`
- Tests: `__tests__/`
- Coverage: `coverage/lcov.info` (uploaded by CI)

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| [docs/testing_setup.md](docs/testing_setup.md) | Jest configuration, Testing Library setup, GitHub Actions integration |
| [docs/TEST_COVERAGE_SUMMARY.md](docs/TEST_COVERAGE_SUMMARY.md) | Test coverage expansion report (284 tests, 89.43% coverage) |
| [docs/cache_on_demand_frontend.md](docs/cache_on_demand_frontend.md) | Frontend caching strategy (TanStack Query stale time config) |
| [docs/webservice-api-integration_plan.md](docs/webservice-api-integration_plan.md) | NestJS backend API integration guide |
| [exercise-api-swagger.json](exercise-api-swagger.json) | Swagger OpenAPI spec for ExerciseDB + GitFit APIs |

---

## 🧑‍💻 Development Guide

### IDE Setup

#### VS Code Extensions Recommended

```json
{
  "recommendations": [
    "dsznajder.es7-react-js-snippets",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "React-Native.react-native-tools"
  ]
}
```

#### TypeScript Paths

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Import example:
```typescript
import { gitfitService } from '@/services/gitfit.service';
import { useRoutineStore } from '@/store/routine.store';
```

### Code Style

- **Linter:** ESLint (Expo flat config)
- **Formatter:** Prettier (100 char line width, Tailwind plugin)
- **Pre-commit hooks:** Not configured (add Husky if needed)

```bash
npm run lint    # Check for issues
npm run format  # Auto-fix formatting
```

### Adding New Features

#### 1. Create API Hook

```typescript
// hooks/useNewFeature.ts
import { useQuery } from '@tanstack/react-query';
import { gitfitService } from '@/services/gitfit.service';

export const useNewFeature = () => {
  return useQuery({
    queryKey: ['feature'],
    queryFn: () => gitfitService.getFeature(),
  });
};
```

#### 2. Create Component

```typescript
// components/NewFeature.tsx
import { View, Text } from 'react-native';

export const NewFeature = () => {
  const { data } = useNewFeature();
  
  return (
    <View className="p-4">
      <Text className="text-lg font-bold">{data?.name}</Text>
    </View>
  );
};
```

#### 3. Add Screen (if needed)

```typescript
// app/new-feature.tsx
import { NewFeature } from '@/components/NewFeature';

export default function NewFeatureScreen() {
  return <NewFeature />;
}
```

#### 4. Write Tests

```typescript
// __tests__/components/NewFeature.test.tsx
import { render } from '@testing-library/react-native';
import { NewFeature } from '@/components/NewFeature';

describe('NewFeature', () => {
  it('renders feature name', () => {
    const { getByText } = render(<NewFeature />);
    expect(getByText('Feature Name')).toBeTruthy();
  });
});
```

### Debugging

#### Expo Dev Client Console

```bash
npm start
# Press 'j' untuk JSON logging
# Press 'w' untuk web debugging
```

#### Sentry Dashboard

Monitor errors: https://sentry.io/organizations/gitfit-pu/issues/

#### React DevTools

Install Expo Dev Client + React DevTools:
```bash
expo install expo-dev-client
```

---

## 📄 License

This project is part of an academic course at HCMUT. Please refer to your institution's guidelines for usage and distribution.
