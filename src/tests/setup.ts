import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { TextEncoder, TextDecoder } from 'util';

expect.extend(matchers);

// Запуск очистки после каждого тестового случая
afterEach(() => {
  cleanup();
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Мок для IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;