// src/app/food-resource.service.ts
import { Injectable } from '@angular/core';
import { Resource } from '../../model/resource';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  constructor() {}

  getFoodResources(): Resource[] {
    return [
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
          'Chocolate, especially dark varieties, is high in oxalates and may contribute to oxalate intake, a concern for those managing kidney stones.',
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
          'Considered one of the highest oxalate foods as studied by Harvard.',
        image: '../../../assets/resources/icons8-rice-bowl-30.png',
        link: 'https://www.hsph.harvard.edu/nutritionsource/kidney-stone-diet/',
      },
      {
        name: 'Beets',
        description:
          'Beets, especially their greens and roots, are high in oxalates and can impact kidney health.',
        image: '../../../assets/resources/food.png',
        link: 'https://www.hsph.harvard.edu/nutritionsource/kidney-stone-diet/',
      },
    ];
  }
}
