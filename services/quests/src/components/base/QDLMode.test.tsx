import 'brace';
import 'brace/mode/markdown';
import { QDLMode } from './QDLMode';
test('shows folds for titles/cards/choices, with correct hierarchical and EOF ranges', () => {
  const lines = [
    '# Quest',
    '_Opening_',
    '* Choice',
    '  detail',
    '_Ending_',
    'goodbye',
  ];
  const session = {
    getLine: (row: number) => lines[row],
    getLength: () => lines.length,
  };
  const folding = new QDLMode().foldingRules;
  expect(lines.map((_, i) => folding.getFoldWidget(session, '', i))).toEqual([
    'start',
    'start',
    'start',
    '',
    'start',
    '',
  ]);
  const card = folding.getFoldWidgetRange(session, '', 1);
  expect(card.start).toEqual({ row: 1, column: 9 });
  expect(card.end).toEqual({ row: 3, column: 8 });
  expect(folding.getFoldWidgetRange(session, '', 0).end).toEqual({
    row: 5,
    column: 7,
  });
  expect(folding.getFoldWidgetRange(session, '', 5)).toBeUndefined();
});
