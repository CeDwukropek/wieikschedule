import { clearAccountCache, readCache, writeCache } from './deviceCache';

test('copies are kept per account and go with the account on sign-out', () => {
  localStorage.clear();
  writeCache('planItems', 'a', { items: [1] }, { plans: 'EiAs3' });
  writeCache('personalPlan', 'a', { overrides: [] });
  writeCache('planItems', 'b', { items: [2] });
  writeCache('planItems', null, { items: [3] });
  expect(readCache('planItems', 'a')).toMatchObject({ plans: 'EiAs3', data: { items: [1] } });
  expect(readCache('planItems', undefined).data).toEqual({ items: [3] });
  clearAccountCache('a');
  expect(readCache('planItems', 'a')).toBeNull();
  expect(readCache('personalPlan', 'a')).toBeNull();
  expect(readCache('planItems', 'b').data).toEqual({ items: [2] });
  localStorage.setItem('wieikschedule.cache.planItems.c', '{broken');
  expect(readCache('planItems', 'c')).toBeNull();
});
