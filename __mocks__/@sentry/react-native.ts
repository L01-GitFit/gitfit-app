export const addBreadcrumb = jest.fn();
export const captureException = jest.fn();
export const captureMessage = jest.fn();
export const setContext = jest.fn();
export const setExtra = jest.fn();
export const setTag = jest.fn();
export const setUser = jest.fn();
export const init = jest.fn();
export const mobileReplayIntegration = jest.fn(() => ({ type: 'mobile-replay' }));
export const feedbackIntegration = jest.fn(() => ({ type: 'feedback' }));
export const registerNavigationContainer = jest.fn();
export const reactNavigationIntegration = jest.fn(() => ({
  registerNavigationContainer,
}));
export const wrap = <T,>(component: T) => component;

export default {
  addBreadcrumb,
  captureException,
  captureMessage,
  setContext,
  setExtra,
  setTag,
  setUser,
  init,
  mobileReplayIntegration,
  feedbackIntegration,
  reactNavigationIntegration,
  wrap,
};
