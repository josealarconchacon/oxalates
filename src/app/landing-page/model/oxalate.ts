export interface Oxalate {
  category: string;
  calc_level: string;
  level: string;
  item: string;
  total_oxalate_mg_per_100g: string;
  total_soluble_oxalate_mg_per_100g: string | null;
  serving_size: string | null;
  serving_g: string | null;
  calc_oxalate_per_serving: string;
  calc_soluble_mg_oxalate_per_serving: string;
  soluble_oxalate: string;
  reference: string;
  notes: string;
}
