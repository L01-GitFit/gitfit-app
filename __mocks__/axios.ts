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

export default {
  create,
};

