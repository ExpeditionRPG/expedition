
class Editable<T> {
  private hook: (v: T) => void;
  private value: T;
  public readonly name: string;

  constructor(name: string, initialValue: T) {
    this.name = name;
    this.value = [initialValue];
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

  // addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, (event: any) => { this.onTextInserted(event); });
}

class EditableString extends Editable<string> {
  public setText(text: string) {
    return this.setValue(text);
  }
  public getText(): string {
    return this.getValue();
  }
}

class EditableMap<T> extends Editable<{[k: string]: T}> {
  public set(key: string, value: T) {
    return this.setValue({...this.getValue(), [key]: value});
  }
}

class EditableModel {
  public canUndo = true;
  public canRedo = true;

  private history: {[k: string]: any}[];
  private position: number;

  constructor(editables: Editable[]) {
    this.position = 0;
    for (const e of editables) {
      e.setModelHook((v: any) => this.onSetValue(e.name, v));
    }
  }

  public onSetValue(k: string, v: any) {
    const newModel = {...this.history[this.history.length-1], [k]: v};
    this.history.push(newModel);
    this.position = this.history.length-1;
    // TODO enforce max history size
  }

  public redo() {}
  public undo() {}

  public beginCompoundOperation(s: string, b: boolean) {}
  public endCompoundOperation() {}
}
