import { Oxalate } from 'src/app/landing-page/model/oxalate';

export const OXALATE_INFO_FIELDS: { label: string; field: keyof Oxalate }[] = [
  { label: 'Category', field: 'category' },
  { label: 'Calculated Level', field: 'calc_level' },
  { label: 'Level', field: 'level' },
  { label: 'Total Oxalate (mg/100g)', field: 'total_oxalate_mg_per_100g' },
  {
    label: 'Total Soluble Oxalate (mg/100g)',
    field: 'total_soluble_oxalate_mg_per_100g',
  },
  { label: 'Serving Size', field: 'serving_size' },
  { label: 'Serving Grams', field: 'serving_g' },
  {
    label: 'Calculated Oxalate Per Serving',
    field: 'calc_oxalate_per_serving',
  },
  {
    label: 'Calculated Soluble mg Oxalate Per Serving',
    field: 'calc_soluble_mg_oxalate_per_serving',
  },
];
