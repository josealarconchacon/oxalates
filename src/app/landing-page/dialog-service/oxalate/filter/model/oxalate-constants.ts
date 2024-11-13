import { Oxalate } from 'src/app/landing-page/model/oxalate';

export const OXALATE_INFO_FIELDS: { label: string; field: keyof Oxalate }[] = [
  { label: 'Category', field: 'category' },
  { label: 'Calc Level', field: 'calc_level' },
  { label: 'Level', field: 'level' },
  { label: 'Total Oxalate (MG/100g)', field: 'total_oxalate_mg_per_100g' },
  {
    label: 'Total Soluble Oxalate (MG/100g)',
    field: 'total_soluble_oxalate_mg_per_100g',
  },
  { label: 'Serving Size', field: 'serving_size' },
  { label: 'Serving G', field: 'serving_g' },
  { label: 'Calc Oxalate Per Serving', field: 'calc_oxalate_per_serving' },
  {
    label: 'Calc Soluble MG Oxalate Per Serving',
    field: 'calc_soluble_mg_oxalate_per_serving',
  },
];
