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
