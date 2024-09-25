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
          'Contains a high amount of oxalates, with a half-cup of cooked spinach containing 755 milligrams',
        image: '../../../assets/resources/icons8-spinach-30.png',
        link: 'https://www.webmd.com/diet/foods-high-in-oxalates',
      },
      {
        name: 'Swiss Chard',
        description:
          'Contains significant amounts of oxalate, A half-cup of this greens can contain approximately 500 mg of oxalate',
        image: '../../../../assets/resources/spinach_5520610.png',
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
  }
}
