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

  public setValue(v: T, useHook: boolean|undefined = true) {
    this.value = v;
    if (useHook) {
      this.hook(this.value);
    }
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

  public isEmpty(): boolean {
    return Object.keys(this.getValue()).length === 0;
  }
}

// EditableModel largely does nothing, currently. It mirrors Realtime API's
// use of a single object for management of different editable objects.
export class EditableModel {
  constructor(editables: Array<Editable<any>>) { /* empty */ }

  public onSetValue(k: string, v: any) {
    return;
  }

  public beginCompoundOperation(s: string, b: boolean) {
    return;
  }

  public endCompoundOperation() {
    return;
  }
}
