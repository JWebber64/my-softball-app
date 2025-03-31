import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Create a mock window object
const mockPrintWindow = {
  document: {
    write: vi.fn(),
    close: vi.fn(),
    createElement: vi.fn()
  },
  print: vi.fn(),
  close: vi.fn()
};

// Mock window.open
window.open = vi.fn().mockReturnValue(mockPrintWindow);

// Store original createElement before mocking
const originalCreateElement = document.createElement;

// Mock document.createElement
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
  style: {},
  setAttribute: vi.fn()
};

document.createElement = vi.fn((element) => {
  if (element === 'a') {
    return mockLink;
  }
  return originalCreateElement.call(document, element);
});

// Mock HTML2Canvas
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('mock-image-data-url')
  })
}));

// Add role check mock
vi.mock('../utils/authCheck', () => ({
  checkUserRole: vi.fn().mockResolvedValue(true)
}));

// Reset all mocks after each test
import { afterEach } from 'vitest';
afterEach(() => {
  vi.clearAllMocks();
  mockLink.href = '';
  mockLink.download = '';
  mockPrintWindow.document.write.mockClear();
  mockPrintWindow.document.close.mockClear();
  mockPrintWindow.print.mockClear();
  mockPrintWindow.close.mockClear();
});

