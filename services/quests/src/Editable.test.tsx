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

    test('empty is true when no entries, false otherwise', () => {
      const e = new EditableMap('test', {});
      expect(e.empty()).toEqual(true);
      e.set('a', 5);
      expect(e.empty()).toEqual(false);
    })
  });
  describe('EditableModel', () => {
    test('can undo and redo', () => {
      const e = new EditableString('test', 'initial');
      const em = new EditableModel([e]);
      e.setText('changed');
      em.undo();
      expect(e.getText()).toEqual('initial');
      em.redo();
      expect(e.getText()).toEqual('changed');
    });
    test('can undo safely on init', () => {
      const e = new EditableString('test', 'initial');
      const em = new EditableModel([e]);
      em.undo();
      expect(e.getText()).toEqual('initial');
    });
    test('eventually starts dropping history', () => {
      const e = new EditableString('test', 'initial');
      const em = new EditableModel([e]);
      for (let i = 0; i < 1000; i++) {
        e.setText(i.toString());
      }
      for (let i = 0; i < 1000; i++) {
        em.undo();
      }
      expect(e.getText()).not.toEqual('initial');
      expect(parseInt(e.getText(), 10)).toBeLessThan(600); // At least 400 undos
    });
  });
});
