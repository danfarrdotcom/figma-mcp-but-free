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
