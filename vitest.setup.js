import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

const { fetchMock } = globalThis;

if (fetchMock && !fetchMock.once) {
  fetchMock.once = fetchMock.mockResponseOnce;
}

process.on('unhandledRejection', (reason, promise) => {
  // console.log('reason: ', reason, 'promise: ', promise);
  /* Stub in node for window.addEventListener('unhandledrejection') */
});
