import { TestBed } from '@angular/core/testing';
import { ResourceService } from './resource.service';
import { Resource } from '../../model/resource';

fdescribe('ResourceService', () => {
  let service: ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResourceService],
    });
    service = TestBed.inject(ResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a list of food resources', () => {
    // Act: call the method
    const resources = service.getFoodResources();
    // Assert:
    expect(resources).toEqual(expectedResources);
  });

  it('should return a non-empty array', () => {
    // Act: call the method
    const resources = service.getFoodResources();
    // Assert:
    expect(resources.length).toBeGreaterThan(0);
  });

  it('should return the correct number of resources', () => {
    // Arrange: Expected number of resources
    const expectedCount = 4;
    // Act: call the method
    const resources = service.getFoodResources();
    // Assert:
    expect(resources.length).toBe(expectedCount);
  });
});

// mock data
const expectedResources: Resource[] = [
  {
    name: 'Spinach',
    description:
      'Contains a high amount of oxalates, with a half-cup of cooked spinach containing 755 milligrams',
    image: '../../../assets/resources/icons8-spinach-30.png',
    link: 'https://www.webmd.com/diet/foods-high-in-oxalates',
  },
  {
    name: 'Almonds',
    description:
      'Considered high in oxalates and are part of the top ten highest oxalate foods as studied by Harvard',
    image: '../../../assets/resources/icons8-almond-30.png',
    link: 'https://kidneystonediet.com/oxalate-list/',
  },
  {
    name: 'Potatoes',
    description:
      'Baked potatoes with skin are listed among the top ten highest oxalate foods as studied by Harvard',
    image: '../../../assets/resources/icons8-sweet-potato-30.png',
    link: 'https://www.hsph.harvard.edu/nutritionsource/kidney-stone-diet/',
  },
  {
    name: 'Rice Bran',
    description:
      'Considered one of the highest oxalate foods as studied by Harvard ',
    image: '../../../assets/resources/icons8-rice-bowl-30.png',
    link: 'https://www.hsph.harvard.edu/nutritionsource/kidney-stone-diet/',
  },
];
