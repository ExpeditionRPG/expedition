import {EditableString, EditableMap, EditableModel} from './Editable';

describe('Editable', () => {
  describe('EditableString', () => {
    test('can set and get value', () => {
      const e = new EditableString('test', 'initial');
      expect(e.getText()).toEqual('initial');
      e.setText('changed');
      expect(e.getText()).toEqual('changed');
    });
  });
  describe('EditableMap', () => {
    test('can set and get item', () => {
      const e = new EditableMap('test', {a: 5});
      expect(e.get('a')).toEqual(5);
      e.set('a', 3);
      expect(e.get('a')).toEqual(3);
    });

    test('isEmpty is true when no entries, false otherwise', () => {
      const e = new EditableMap('test', {});
      expect(e.isEmpty()).toEqual(true);
      e.set('a', 5);
      expect(e.isEmpty()).toEqual(false);
    })
  });
});
