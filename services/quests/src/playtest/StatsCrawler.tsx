import {Context} from 'shared/parse/Context';
import {CrawlEntry, CrawlerBase, CrawlEvent} from 'shared/parse/Crawler';

export interface CrawlerStats {
  inputs: Set<string>;
  maxPathActions: number;
  minPathActions: number;
  numInternalStates: number;
  outputs: Set<string>;
}

export type StatsCrawlEntry = CrawlEntry<Context>;

export class StatsCrawler extends CrawlerBase<Context> {
  protected statsById: {[id: string]: CrawlerStats};
  protected statsByLine: {[line: number]: CrawlerStats};
  protected statsByEvent: {[event: string]: Array<{line: number, id: string, fromAction: string|number}>};

  constructor() {
    super();

    // Initialize stats with a generic 'quest root'
    this.statsById = {
      START: {inputs: new Set(), outputs: new Set(), minPathActions: -1, maxPathActions: -1, numInternalStates: -1},
    };
    this.statsByLine = {
      '-1': {inputs: new Set(), outputs: new Set(), minPathActions: -1, maxPathActions: -1, numInternalStates: -1},
    };
    this.statsByEvent = {
      END: [],
      IMPLICIT_END: [],
      INVALID: [],
    };
  }

  // Retrieves stats for a given node ID.
  // These aggregates treat all nodes following the ID node
  // as part of the ID node. For example, a graph like:
  //
  // <ID1> -> node1 -> node2 -> <ID2>
  //   '-> node3 -> <ID3>
  //
  // would be shortened to:
  //
  // <ID1> -> <ID2>
  //   '-> <ID3>
  public getStatsForId(id: string): CrawlerStats {
    return this.statsById[id];
  }

  // Gets statistics (including inbound and outbound actions)
  // for a block with a given line.
  public getStatsForLine(line: number): CrawlerStats {
    return this.statsByLine[line];
  }

  public getLines(): number[] {
    return Object.keys(this.statsByLine).filter((k: string) => (k !== '-1')).map((s: string) => parseInt(s, 10));
  }

  public getIds(): string[] {
    return Object.keys(this.statsById).filter((k: string) => (k !== 'START'));
  }

  protected onEvent(q: StatsCrawlEntry, e: CrawlEvent) {
    if (e === 'MAX_DEPTH_EXCEEDED' || e === 'ALREADY_SEEN') {
      return;
    }
    this.statsById[q.prevId].outputs.add(e);
    this.statsByLine[q.prevLine].outputs.add(e);
    this.statsByEvent[e].push({line: q.prevLine, id: q.prevId, fromAction: q.fromAction});
  }

  protected onNode(q: StatsCrawlEntry, nodeStr: string, id: string, line: number): void {
    // Create stats for this line/id if they don't already exist
    if (this.statsById[id] === undefined) {
      this.statsById[id] = {
        inputs: new Set(),
        maxPathActions: this.statsById[q.prevId].maxPathActions + 1,
        minPathActions: this.statsById[q.prevId].minPathActions + 1,
        numInternalStates: 1,
        outputs: new Set(),
      };
    }
    if (this.statsByLine[line] === undefined) {
      this.statsByLine[line] = {
        inputs: new Set(),
        maxPathActions: this.statsByLine[q.prevLine].maxPathActions + 1,
        minPathActions: this.statsByLine[q.prevLine].minPathActions + 1,
        numInternalStates: 0,
        outputs: new Set(),
      };
    }

    // Fetch statistics
    const lineStats = this.statsByLine[line];

    // Update ID statistics
    if (id !== q.prevId) {
      // We're in the boundary between ID sections. Update:
      // - outbound edges for the previous ID
      // - inbound edges for the next ID.
      // - path actions
      this.statsById[id].maxPathActions = Math.max(
        this.statsById[id].maxPathActions,
        (this.statsById[q.prevId].maxPathActions || 0) + 1);
      this.statsById[id].minPathActions = Math.min(
        this.statsById[id].minPathActions,
        (this.statsById[q.prevId].minPathActions || 0) + 1);
      this.statsById[id].inputs.add(q.prevId);
      this.statsById[q.prevId].outputs.add(id);
    } else {
      // We're still within the same ID. Increment numInternalStates.
      this.statsById[id].numInternalStates++;
    }

    // Update line stats for this line & prev line
    this.statsByLine[line].maxPathActions = Math.max(
      this.statsByLine[line].maxPathActions,
      (this.statsByLine[q.prevLine].maxPathActions || 0) + 1);
    this.statsByLine[line].minPathActions = Math.min(
      this.statsByLine[line].minPathActions,
      (this.statsByLine[q.prevLine].minPathActions || 0) + 1);
    lineStats.inputs.add(q.prevNodeStr);
    this.statsByLine[q.prevLine].outputs.add(nodeStr);
  }
}
