import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ResourcesComponent } from './resources.component';
import { ResourceService } from '../dialog-service/service/resource.service';
import { Resource } from '../model/resource';

describe('ResourcesComponent', () => {
  let component: ResourcesComponent;
  let fixture: ComponentFixture<ResourcesComponent>;
  let mockResourceService: jasmine.SpyObj<ResourceService>;

  beforeEach(async () => {
    mockResourceService = jasmine.createSpyObj('ResourceService', [
      'getFoodResources',
    ]);
    mockResourceService.getFoodResources.and.returnValue(mockResources);

    await TestBed.configureTestingModule({
      declarations: [ResourcesComponent],
      providers: [{ provide: ResourceService, useValue: mockResourceService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getFoodResources on service', () => {
      fixture.detectChanges();
      expect(mockResourceService.getFoodResources).toHaveBeenCalled();
    });

    it('should initialize foodResources with data from service', () => {
      fixture.detectChanges();
      expect(component.foodResources).toEqual(mockResources);
      expect(component.foodResources.length).toBe(3);
    });

    it('should populate foodResources array with correct Resource objects', () => {
      fixture.detectChanges();
      expect(component.foodResources[0].name).toBe('Spinach');
      expect(component.foodResources[0].description).toContain(
        '755 milligrams'
      );
      expect(component.foodResources[0].image).toBe(
        '../../../assets/resources/icons8-spinach-30.png'
      );
      expect(component.foodResources[0].link).toBe(
        'https://www.webmd.com/diet/foods-high-in-oxalates'
      );
      expect(component.foodResources[1].name).toBe('Chocolate');
      expect(component.foodResources[2].name).toBe('Almonds');
    });

    it('should handle empty array from service', () => {
      mockResourceService.getFoodResources.and.returnValue([]);
      fixture.detectChanges();
      expect(component.foodResources).toEqual([]);
      expect(component.foodResources.length).toBe(0);
    });
  });

  describe('Component Initialization', () => {
    it('should have foodResources as empty array before ngOnInit', () => {
      expect(component.foodResources).toEqual([]);
    });

    it('should not call service before ngOnInit', () => {
      expect(mockResourceService.getFoodResources).not.toHaveBeenCalled();
    });
  });

  describe('foodResources property', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should contain resources with all required properties', () => {
      component.foodResources.forEach((resource) => {
        expect(resource.name).toBeDefined();
        expect(resource.description).toBeDefined();
        expect(resource.image).toBeDefined();
        expect(resource.link).toBeDefined();
      });
    });

    it('should have resources with string type properties', () => {
      component.foodResources.forEach((resource) => {
        expect(typeof resource.name).toBe('string');
        expect(typeof resource.description).toBe('string');
        expect(typeof resource.image).toBe('string');
        expect(typeof resource.link).toBe('string');
      });
    });

    it('should have resources with non-empty strings', () => {
      component.foodResources.forEach((resource) => {
        expect(resource.name.length).toBeGreaterThan(0);
        expect(resource.description.length).toBeGreaterThan(0);
        expect(resource.image.length).toBeGreaterThan(0);
        expect(resource.link.length).toBeGreaterThan(0);
      });
    });

    it('should have resources with valid image paths', () => {
      component.foodResources.forEach((resource) => {
        expect(resource.image).toContain('assets/resources/');
      });
    });

    it('should have resources with valid HTTP/HTTPS links', () => {
      component.foodResources.forEach((resource) => {
        expect(resource.link).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('Service Integration', () => {
    it('should use ResourceService dependency', () => {
      expect(component['resourceService']).toBe(mockResourceService);
    });

    it('should call service method only once during initialization', () => {
      fixture.detectChanges();
      expect(mockResourceService.getFoodResources).toHaveBeenCalledTimes(1);
    });

    it('should assign returned array to foodResources', () => {
      fixture.detectChanges();
      expect(component.foodResources).toBe(mockResources);
    });
  });

  describe('Resource Data Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have Spinach resource with correct properties', () => {
      const spinach = component.foodResources.find((r) => r.name === 'Spinach');
      expect(spinach).toBeDefined();
      expect(spinach?.description).toContain('oxalates');
      expect(spinach?.image).toContain('spinach');
      expect(spinach?.link).toContain('webmd.com');
    });

    it('should have Chocolate resource with correct properties', () => {
      const chocolate = component.foodResources.find(
        (r) => r.name === 'Chocolate'
      );
      expect(chocolate).toBeDefined();
      expect(chocolate?.description).toContain('dark varieties');
      expect(chocolate?.image).toContain('chocolate');
    });

    it('should have Almonds resource with correct properties', () => {
      const almonds = component.foodResources.find((r) => r.name === 'Almonds');
      expect(almonds).toBeDefined();
      expect(almonds?.description).toContain('Harvard');
      expect(almonds?.link).toContain('kidneystonediet.com');
    });
  });
});

const mockResources: Resource[] = [
  {
    name: 'Spinach',
    description:
      'Contains a high amount of oxalates, with a half-cup of cooked spinach containing 755 milligrams.',
    image: '../../../assets/resources/icons8-spinach-30.png',
    link: 'https://www.webmd.com/diet/foods-high-in-oxalates',
  },
  {
    name: 'Chocolate',
    description:
      'Chocolate, especially dark varieties, is high in oxalates and may contribute to oxalate intake.',
    image: '../../../../assets/resources/chocolate-bar.png',
    link: 'https://www.webmd.com/diet/foods-high-in-oxalates',
  },
  {
    name: 'Almonds',
    description:
      'Considered high in oxalates and are part of the top ten highest oxalate foods as studied by Harvard.',
    image: '../../../assets/resources/icons8-almond-30.png',
    link: 'https://kidneystonediet.com/oxalate-list/',
  },
];
