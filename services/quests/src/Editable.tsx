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
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(v: T) {
    this.value = v;
    this.hook(this.value);
  }

  public setModelHook(hook: (v: T) => void) {
    this.hook = hook;
    this.hook(this.value);
  }

  public removeAllEventListeners() {
    return;
  }

  public addEventListener() {
    console.warn('addEventListener not implemented');
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
  public canUndo = true;
  public canRedo = true;

  private history: Array<{[k: string]: any}>;

  constructor(editables: Array<Editable<any>>) {
    const curr: {[k: string]: Editable<any>} = {};
    this.history = [curr];
    for (const e of editables) {
      e.setModelHook((v: any) => this.onSetValue(e.name, v));
      curr[e.name, e.getValue()];
    }

  }

  public onSetValue(k: string, v: any) {
    const newModel = {...this.history[this.history.length - 1], [k]: v};
    this.history.push(newModel);
    // TODO enforce max history size
  }

  public redo() {
    return;
  }

  public undo() {
    return;
  }

  public beginCompoundOperation(s: string, b: boolean) {
    return;
  }

  public endCompoundOperation() {
    return;
  }
}
