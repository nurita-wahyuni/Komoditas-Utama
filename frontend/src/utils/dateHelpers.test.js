import { describe, it, expect } from 'vitest';
import { isMonthDisabled } from './dateHelpers';

describe('isMonthDisabled', () => {
  // Mock Date: 2026-03-04 (March 4th, 2026)
  const mockDate = new Date('2026-03-04T00:00:00');

  it('should enable all months for past years', () => {
    // 2025 (Past Year)
    expect(isMonthDisabled(0, 2025, mockDate)).toBe(false); // Jan
    expect(isMonthDisabled(11, 2025, mockDate)).toBe(false); // Dec
  });

  it('should disable all months for future years', () => {
    // 2027 (Future Year)
    expect(isMonthDisabled(0, 2027, mockDate)).toBe(true); // Jan
    expect(isMonthDisabled(5, 2027, mockDate)).toBe(true); // Jun
  });

  it('should handle current year correctly', () => {
    // 2026 (Current Year)
    // Current Month is March (Index 2)
    
    // Past months in current year -> Enabled
    expect(isMonthDisabled(0, 2026, mockDate)).toBe(false); // Jan
    expect(isMonthDisabled(1, 2026, mockDate)).toBe(false); // Feb
    
    // Current month -> Enabled
    expect(isMonthDisabled(2, 2026, mockDate)).toBe(false); // March
    
    // Future months in current year -> Disabled
    expect(isMonthDisabled(3, 2026, mockDate)).toBe(true); // April
    expect(isMonthDisabled(4, 2026, mockDate)).toBe(true); // May
    expect(isMonthDisabled(11, 2026, mockDate)).toBe(true); // Dec
  });
});
