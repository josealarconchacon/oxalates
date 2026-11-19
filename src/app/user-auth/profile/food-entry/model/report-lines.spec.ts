import { GetReportComponent } from '../../calculate-oxalate/get-report/get-report.component';
import { ShareMenuComponent } from '../../calculate-oxalate/share-menu/share-menu.component';
import { recipeEntry } from '../recipe-entry/recipe-entry.component.spec';
import { FoodItem } from '../service/food-entry.service';
import { reportRow, reportTotal, shareRecipeLine } from './report-lines';

// Real data stores food numbers as strings sometimes ("23.35"); the report has always coped.
const beans = {
  foodName: 'Beans, Adzuki or Azuki, dried, boiled, Arrowhead Mills',
  servingSize: '1/2 cup',
  numberOfServings: 1,
  oxalatePerServing: '23.35',
  solubleOxalatePerServing: '4.37',
} as unknown as FoodItem;

const bread = recipeEntry({
  recipeName: 'Banana Bread',
  multiplier: 1,
  mg: 5.7375,
  solubleMg: 0.8125,
  incomplete: false,
  solubleIncomplete: true,
});

describe('report lines', () => {
  it('food rows are exactly what the report always produced', () => {
    expect(reportRow(beans, 'Breakfast')).toEqual([
      'Breakfast',
      'Beans, Adzuki or Azuki, dried, boiled, Arrowhead Mills',
      '1/2 cup',
      1,
      '23.35',
      '4.37',
    ]);
  });

  it('recipe rows: "Recipe", "N serving(s)", snapshot mg, "at least" where needed', () => {
    expect(reportRow(bread, 'Dinner')).toEqual(['Dinner', 'Banana Bread', 'Recipe', '1 serving', '5.74', 'at least 0.81']);
    const half = recipeEntry({ multiplier: 0.5, mg: 3, solubleMg: 1, incomplete: true });
    expect(reportRow(half, 'Lunch').slice(3)).toEqual(['½ serving', 'at least 3.00', 'at least 1.00']);
  });

  it('totals', () => {
    expect(reportTotal(29.0875, false)).toBe('29.09');
    expect(reportTotal(5.18, true)).toBe('at least 5.18');
  });

  it('share line for a recipe; foods get none (they keep their own format)', () => {
    expect(shareRecipeLine(bread)).toBe(
      '    - 📖 Banana Bread (Recipe · 1 serving): 5.7mg oxalate, at least 0.8mg soluble oxalate\n'
    );
    expect(shareRecipeLine(beans)).toBeNull();
  });
});

describe('the reports with a logged recipe', () => {
  it('PDF/CSV table: food row unchanged, recipe row, "at least" on the soluble total', () => {
    const report = Object.create(GetReportComponent.prototype) as any;
    const rows = report.preparePDFData({ breakfast: [beans], dinner: [bread] });
    expect(rows).toEqual([
      ['Breakfast', 'Beans, Adzuki or Azuki, dried, boiled, Arrowhead Mills', '1/2 cup', 1, '23.35', '4.37'],
      ['Dinner', 'Banana Bread', 'Recipe', '1 serving', '5.74', 'at least 0.81'],
      ['', '', '', 'Total:', '29.09', 'at least 5.18'],
    ]);
  });

  it('a food-only day: the same table as before', () => {
    const report = Object.create(GetReportComponent.prototype) as any;
    expect(report.preparePDFData({ breakfast: [beans] })).toEqual([
      ['Breakfast', 'Beans, Adzuki or Azuki, dried, boiled, Arrowhead Mills', '1/2 cup', 1, '23.35', '4.37'],
      ['', '', '', 'Total:', '23.35', '4.37'],
    ]);
  });

  it('share text: the recipe line, and "at least" on the total only when needed', () => {
    const share = Object.create(ShareMenuComponent.prototype) as ShareMenuComponent;
    share.dailyMeals = [
      { title: 'Breakfast', items: [beans] },
      { title: 'Dinner', items: [bread] },
    ];
    share.dailyTotal = { totalOxalate: 29.0875, totalSolubleOxalate: 5.1825, atLeast: false };
    const text = share.getShareableText();
    expect(text).toContain('🔹 Total Oxalate for the Day: 29.0875mg');
    expect(text).toContain(
      '    - 🌿 Beans, Adzuki or Azuki, dried, boiled, Arrowhead Mills: 23.35mg oxalate, 4.37mg soluble oxalate\n'
    );
    expect(text).toContain('    - 📖 Banana Bread (Recipe · 1 serving): 5.7mg oxalate, at least 0.8mg soluble oxalate\n');

    share.dailyTotal = { ...share.dailyTotal, atLeast: true };
    expect(share.getShareableText()).toContain('🔹 Total Oxalate for the Day: at least 29.0875mg');
  });
});
