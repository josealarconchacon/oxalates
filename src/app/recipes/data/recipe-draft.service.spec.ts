import { TestBed } from '@angular/core/testing';
import { RecipeDraftService } from './recipe-draft.service';

describe('RecipeDraftService', () => {
  let drafts: RecipeDraftService;
  const draft = { name: 'Soup', serves: 2, notes: '', tags: ['Holiday'], ingredients: [] };

  beforeEach(() => {
    drafts = TestBed.inject(RecipeDraftService);
    localStorage.removeItem('recipe-draft:new');
    localStorage.removeItem('recipe-draft:r1');
  });

  it('keeps one draft per recipe id, and one for a new recipe', () => {
    drafts.save(null, draft, new Date('2026-11-16T10:00:00Z'));
    drafts.save('r1', { ...draft, name: 'Edited' });
    expect(drafts.load(null)).toEqual({ ...draft, savedAt: '2026-11-16T10:00:00.000Z' });
    expect(drafts.load('r1')!.name).toBe('Edited');
  });

  it('clear removes it', () => {
    drafts.save('r1', draft);
    drafts.clear('r1');
    expect(drafts.load('r1')).toBeNull();
  });

  it('ignores anything unreadable', () => {
    localStorage.setItem('recipe-draft:new', '{oops');
    expect(drafts.load(null)).toBeNull();
    localStorage.setItem('recipe-draft:new', '{"name":"x"}');
    expect(drafts.load(null)).toBeNull();
  });
});
