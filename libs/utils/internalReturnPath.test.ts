import { getInternalReturnPath } from './internalReturnPath';
describe('Internal login return path', () => {
  it.each([
    'https://other.test',
    '//other.test',
    '/\\other.test',
    '%2F%2Fother.test',
    ['/?x=1'],
    undefined,
    '/%2fother.test',
    '/%5cother.test',
  ])('rejects unsafe path %p', (value) => {
    expect(getInternalReturnPath(value)).toBe('/');
  });
  it('preserves_localized_messages_link', () => {
    const path = '/kr/mypage?category=messages&packageId=abc';
    expect(getInternalReturnPath(path)).toBe(path);
  });
});
