import {inBorder} from '../common';

test('test in border', () => {
    expect(inBorder(-1, -1, 1)).toBe(false);
    expect(inBorder(0, 0, 1)).toBe(true);
    expect(inBorder(1, 1, 1)).toBe(false);
});
