import { normalizeNodeId, validNodeId, parseNodeIds, chunk } from '../src/utils.js';

describe('normalizeNodeId', () => {
  it('returns plain IDs unchanged', () => {
    expect(normalizeNodeId('1234:5678')).toBe('1234:5678');
  });
  it('strips I prefix from instance IDs', () => {
    expect(normalizeNodeId('I1234:5678;1234:5679')).toBe('1234:5678');
  });
});

describe('validNodeId', () => {
  it('accepts valid IDs', () => {
    expect(validNodeId('1:2')).toBe(true);
  });
  it('rejects invalid IDs', () => {
    expect(validNodeId('abc')).toBe(false);
  });
});

describe('parseNodeIds', () => {
  it('splits comma-separated string', () => {
    expect(parseNodeIds('1:2,3:4')).toEqual(['1:2', '3:4']);
  });
  it('returns array as-is', () => {
    expect(parseNodeIds(['1:2', '3:4'])).toEqual(['1:2', '3:4']);
  });
});

describe('chunk', () => {
  it('splits array into chunks', () => {
    expect(chunk([1,2,3,4,5], 2)).toEqual([[1,2],[3,4],[5]]);
  });
});
import { rgbaToHex, hexToRgba } from '../src/utils.js';

describe('rgbaToHex', () => {
  it('converts full opacity colors', () => {
    expect(rgbaToHex(1, 0, 0)).toBe('#ff0000');
  });
  it('includes alpha when provided', () => {
    expect(rgbaToHex(1, 0, 0, 0.5)).toMatch(/#ff0000[0-9a-f]{2}/);
  });
});

describe('hexToRgba', () => {
  it('parses 6-digit hex', () => {
    const c = hexToRgba('#ff0000');
    expect(c.r).toBeCloseTo(1);
    expect(c.a).toBe(1);
  });
});
