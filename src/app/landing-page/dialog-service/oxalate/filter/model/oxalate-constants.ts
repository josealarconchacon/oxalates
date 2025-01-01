import { Oxalate } from 'src/app/landing-page/model/oxalate';

export const OXALATE_INFO_FIELDS: {
  label: string;
  field: keyof Oxalate;
  unit?: string;
}[] = [
  { label: 'Category', field: 'category' },
  { label: 'Calculated Level', field: 'calc_level' },
  { label: 'Level', field: 'level' },
  {
    label: 'Total Oxalate',
    field: 'total_oxalate_mg_per_100g',
    unit: '(mg/100g)',
  },
  {
    label: 'Total Soluble Oxalate',
    field: 'total_soluble_oxalate_mg_per_100g',
    unit: '(mg/100g)',
  },
  { label: 'Serving Size', field: 'serving_size' },
  { label: 'Serving Grams', field: 'serving_g' },
  {
    label: 'Oxalate Per Serving',
    field: 'calc_oxalate_per_serving',
    unit: '(mg)',
  },
  {
    label: 'Soluble Oxalate Per Serving',
    field: 'calc_soluble_mg_oxalate_per_serving',
    unit: '(mg)',
  },
];
