// This class wraps the Realtime API undo commands in a way
// that can substitute for Ace UndoManager. This is injected
// into the editor via session.setUndoManager().
// https://developers.google.com/google-apps/realtime/undo
// https://github.com/ajaxorg/ace/blob/v1.1.4/lib/ace/undomanager.js
export default class RealtimeUndoManager {
  private realtimeModel: any;

  constructor(realtimeModel: any) {
    this.realtimeModel = realtimeModel;
  }

  public execute(options: any): void {
    // Throw out ace editor deltas received, since
    // we use the realtime API as a source of truth.
  }

  public hasUndo(): boolean {
    return this.realtimeModel.canUndo;
  }

  public hasRedo(): boolean {
    return this.realtimeModel.canRedo;
  }

  public redo(): void {
    if (!this.hasRedo()) {
      return;
    }
    this.realtimeModel.redo();
  }

  public undo(): void {
    if (!this.hasUndo()) {
      return;
    }
    this.realtimeModel.undo();
  }

  public reset(): void {
    // No-op for now, but part of the Ace UndoManager interface.
  }

  public markClean(): void {
    // No-op for now
  }

  public isClean(): boolean {
    // Currently not supported. We check dirtyness via value anyways.
    return false;
  }
}
