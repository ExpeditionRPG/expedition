// This is an interface that mimics Google Realtime API
// (deprecated and turning down in Jan 2019).
// TODO(scott): Finish

class Editable<T> {
  private hook: (v: T) => void;
  private value: T;
  public readonly name: string;

  constructor(name: string, initialValue: T) {
    this.name = name;
    this.value = initialValue;
    this.hook = (v: T) => { /* Do nothing */ };
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(v: T, useHook?: boolean = true) {
    this.value = v;
    useHook && this.hook(this.value);
  }

  public setModelHook(hook: (v: T) => void) {
    this.hook = hook;
    this.hook(this.value);
  }

  public removeAllEventListeners() {
    // We don't yet handle multi-session editing,
    // so nothing to do here.
    return;
  }

  public addEventListener() {
    // We don't yet handle multi-session editing,
    // so nothing to do here.
    return;
  }
}

export class EditableString extends Editable<string> {
  public setText(text: string) {
    return this.setValue(text);
  }
  public getText(): string {
    return this.getValue();
  }
}

export class EditableMap<T> extends Editable<{[k: string]: T}> {
  public set(key: string, value: T) {
    return this.setValue({...this.getValue(), [key]: value});
  }

  public get(key: string): T|undefined {
    return this.getValue()[key];
  }

  public empty(): boolean {
    return Object.keys(this.getValue()).length === 0;
  }
}

export class EditableModel {
  public static readonly MAX_HISTORY = 500;
  public canUndo = true;
  public canRedo = true;

  private history: Array<{[k: string]: any}>;
  private undos: Array<{[k: string]: any}>;
  private editables: Array<Editable<any>>;

  constructor(editables: Array<Editable<any>>) {
    this.editables = editables;
    const curr: {[k: string]: Editable<any>} = {};
    this.history = [curr];
    this.undos = [];

    for (const e of editables) {
      e.setModelHook((v: any) => this.onSetValue(e.name, v));
      curr[e.name] = e.getValue();
    }

  }

  public onSetValue(k: string, v: any) {
    const newModel = {...this.history[this.history.length - 1], [k]: v};
    this.history.push(newModel);
    this.undos = [];

    // Enforce max size
    while (this.history.length > EditableModel.MAX_HISTORY) {
      this.history.shift();
    }
  }

  public redo() {
    if (this.undos.length > 0) {
      const h = this.undos.pop();
      this.history.push(h);
      for (const e of this.editables) {
        e.setValue(h[e.name], false);
      }
    }
  }

  public undo() {
    if (this.history.length > 1) {
      const h = this.history.pop();
      this.undos.push(h);
      const curr = this.history[this.history.length - 1];
      for (const e of this.editables) {
        e.setValue(curr[e.name], false);
      }
    }
  }

  public beginCompoundOperation(s: string, b: boolean) {
    return;
  }

  public endCompoundOperation() {
    return;
  }
}
