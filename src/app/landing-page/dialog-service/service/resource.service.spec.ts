import { TestBed } from '@angular/core/testing';
import { ResourceService } from './resource.service';
import { Resource } from '../../model/resource';

describe('ResourceService', () => {
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

  it('should return the correct number of food resources', () => {
    const resources: Resource[] = service.getFoodResources();
    expect(resources.length).toBe(6);
  });

  it('should return a list of food resources with the correct data', () => {
    const resources: Resource[] = service.getFoodResources();

    // Check the first resource
    expect(resources[0].name).toBe('Spinach');
    expect(resources[0].description).toBe(
      'Contains a high amount of oxalates, with a half-cup of cooked spinach containing 755 milligrams.'
    );
    expect(resources[0].image).toBe(
      '../../../assets/resources/icons8-spinach-30.png'
    );
    expect(resources[0].link).toBe(
      'https://www.webmd.com/diet/foods-high-in-oxalates'
    );

    // Check the second resource
    expect(resources[1].name).toBe('Chocolate');
    expect(resources[1].description).toBe(
      'Chocolate, especially dark varieties, is high in oxalates and may contribute to oxalate intake, a concern for those managing kidney stones.'
    );
    expect(resources[1].image).toBe(
      '../../../../assets/resources/chocolate-bar.png'
    );
    expect(resources[1].link).toBe(
      'https://www.webmd.com/diet/foods-high-in-oxalates'
    );

    // Check the third resource
    expect(resources[2].name).toBe('Almonds');
    expect(resources[2].description).toBe(
      'Considered high in oxalates and are part of the top ten highest oxalate foods as studied by Harvard.'
    );
    expect(resources[2].image).toBe(
      '../../../assets/resources/icons8-almond-30.png'
    );
    expect(resources[2].link).toBe('https://kidneystonediet.com/oxalate-list/');

    // Check the fourth resource
    expect(resources[3].name).toBe('Potatoes');
    expect(resources[3].description).toBe(
      'Baked potatoes with skin are listed among the top ten highest oxalate foods as studied by Harvard.'
    );
    expect(resources[3].image).toBe(
      '../../../assets/resources/icons8-sweet-potato-30.png'
    );
    expect(resources[3].link).toBe(
      'https://www.hsph.harvard.edu/nutritionsource/kidney-stone-diet/'
    );

    // Check the fifth resource
    expect(resources[4].name).toBe('Rice Bran');
    expect(resources[4].description).toBe(
      'Considered one of the highest oxalate foods as studied by Harvard.'
    );
    expect(resources[4].image).toBe(
      '../../../assets/resources/icons8-rice-bowl-30.png'
    );
    expect(resources[4].link).toBe(
      'https://www.hsph.harvard.edu/nutritionsource/kidney-stone-diet/'
    );

    // Check the fifth resource
    expect(resources[5].name).toBe('Beets');
    expect(resources[5].description).toBe(
      'Beets, especially their greens and roots, are high in oxalates and can impact kidney health.'
    );
    expect(resources[5].image).toBe('../../../assets/resources/food.png');
    expect(resources[5].link).toBe(
      'https://www.hsph.harvard.edu/nutritionsource/kidney-stone-diet/'
    );
  });
});
