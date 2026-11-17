import { EnvironmentInjector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { RecipeService } from './recipe.service';

describe('RecipeService.list', () => {
  let paths: string[];
  let docs: { id: string; data: () => object }[];

  function service(signedIn = true): RecipeService {
    const firestore = {
      collection: (name: string) => {
        inject(EnvironmentInjector); // like the real compat classes
        paths.push(name);
        return {
          doc: (id: string) => {
            paths.push(id);
            return {
              collection: (sub: string) => {
                paths.push(sub);
                return { get: () => of({ docs }) };
              },
            };
          },
        };
      },
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFirestore, useValue: firestore },
        {
          provide: AuthService,
          useValue: { getCurrentUser: () => Promise.resolve(signedIn ? { uid: 'u1' } : null) },
        },
      ],
    });
    return TestBed.inject(RecipeService);
  }

  beforeEach(() => {
    paths = [];
    docs = [
      { id: 'a', data: () => ({ name: 'Old', updatedAt: '2026-01-01T00:00:00.000Z' }) },
      { id: 'b', data: () => ({ name: 'New', updatedAt: '2026-11-01T00:00:00.000Z' }) },
    ];
  });

  it("reads the user's recipes, newest first, with their ids", async () => {
    const list = await service().list();
    expect(paths).toEqual(['recipes', 'u1', 'items']);
    expect(list.map((r) => [r.id, r.name])).toEqual([
      ['b', 'New'],
      ['a', 'Old'],
    ]);
  });

  it('fails when nobody is signed in', async () => {
    await expectAsync(service(false).list()).toBeRejectedWithError('Not signed in');
  });
});

describe('RecipeService get / create / update', () => {
  let writes: { path: string; data: any }[];
  let stored: Record<string, object>;

  function service(): RecipeService {
    const doc = (path: string) => ({
      get: () => of({ exists: path in stored, data: () => stored[path] }),
      set: (data: object) => {
        writes.push({ path, data });
        return Promise.resolve();
      },
    });
    const firestore = {
      createId: () => 'new-id',
      collection: (name: string) => {
        inject(EnvironmentInjector);
        return {
          doc: (uid: string) => ({
            collection: (sub: string) => ({
              doc: (id: string) => {
                inject(EnvironmentInjector);
                return doc(`${name}/${uid}/${sub}/${id}`);
              },
            }),
          }),
        };
      },
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFirestore, useValue: firestore },
        { provide: AuthService, useValue: { getCurrentUser: () => Promise.resolve({ uid: 'u1' }) } },
      ],
    });
    return TestBed.inject(RecipeService);
  }

  const draft = { name: 'Soup', serves: 2, ingredients: [], notes: '', tags: ['Gluten-free'] };
  const now = new Date('2026-11-16T10:00:00.000Z');

  beforeEach(() => {
    writes = [];
    stored = { 'recipes/u1/items/r1': { name: 'Stored', serves: 3 } };
  });

  it('get returns the recipe with its id, or null', async () => {
    const s = service();
    expect(await s.get('r1')).toEqual(jasmine.objectContaining({ id: 'r1', name: 'Stored' }));
    expect(await s.get('missing')).toBeNull();
  });

  it('create adds id, owner and dates, and drops undefined fields', async () => {
    const created = await service().create({ ...draft, photoUrl: undefined }, now);
    expect(created).toEqual(
      jasmine.objectContaining({ id: 'new-id', ownerId: 'u1', createdAt: now.toISOString(), updatedAt: now.toISOString() })
    );
    expect(writes[0].path).toBe('recipes/u1/items/new-id');
    expect('photoUrl' in writes[0].data).toBeFalse();
  });

  it('update keeps createdAt and moves updatedAt', async () => {
    const existing = {
      ...draft,
      id: 'r1',
      ownerId: 'u1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const updated = await service().update({ ...existing, name: 'Better soup' }, now);
    expect(writes[0].path).toBe('recipes/u1/items/r1');
    expect(writes[0].data).toEqual(
      jasmine.objectContaining({ name: 'Better soup', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: now.toISOString() })
    );
    expect(updated.updatedAt).toBe(now.toISOString());
  });
});
