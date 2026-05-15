export const mockGet = jest.fn();
export const mockPost = jest.fn();
export const mockPatch = jest.fn();
export const mockDelete = jest.fn();
export const mockPut = jest.fn();

export const mockAxiosInstance = {
  get: mockGet,
  post: mockPost,
  patch: mockPatch,
  delete: mockDelete,
  put: mockPut,
  interceptors: {
    request: {
      use: jest.fn((onFulfilled, onRejected) => mockGet),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn((onFulfilled, onRejected) => mockPost),
      eject: jest.fn(),
    },
  },
};

const create = jest.fn(() => mockAxiosInstance);

// Provide a minimal AxiosError class so `instanceof AxiosError` works in tests
export class AxiosError extends Error {
  isAxiosError = true;
  response?: any;
  request?: any;
  config?: any;
  code?: string;

  constructor(message?: string, code?: string, config?: any, request?: any, response?: any) {
    super(message);
    this.name = 'AxiosError';
    this.code = code;
    this.config = config;
    this.request = request;
    this.response = response;
  }

  static isAxiosError(payload: unknown): payload is AxiosError {
    return !!(payload && typeof payload === 'object' && (payload as AxiosError).isAxiosError);
  }
}

export default {
  create,
  AxiosError,
};

