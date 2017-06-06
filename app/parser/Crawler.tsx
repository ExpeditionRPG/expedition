import {ParserNode} from './Node'
import {handleAction} from './Handlers'

export interface CrawlerAction {}

export interface CrawlerStats {
  resultOf: Set<string>;
  causeOf: Set<string>;
  minPathActions: number;
  maxPathActions: number;
  numInternalStates: number;
}

type DoFn = (s: CrawlerStats, n :ParserNode) => void;


export class Crawler {
  statsById: {[id:string]: CrawlerStats};
  statsByLine: {[line:number]: CrawlerStats};
  seen: Set<string>;

  constructor() {
    this.seen = new Set();
    this.statsById = {};
    this.statsByLine = {};
  }

  public crawl(root: ParserNode) {
    this.traverse(root);
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
    return Object.keys(this.statsByLine).filter((k: string) => {return (k !== '-1');}).map((s: string) => parseInt(s, 10));
  }

  public getIds(): string[] {
    return Object.keys(this.statsById).filter((k: string) => {return (k !== 'QUEST_START');});
  }

  // Traverses the graph in breadth-first order starting with a given node.
  // Stats are collected separately per-id and per-line
  private traverse(root: ParserNode) {

    // Initialize stats with quest root to obviate need for undefined checking.
    this.statsById = {
      'QUEST_START': {resultOf: new Set(), causeOf: new Set(), minPathActions: -1, maxPathActions: -1, numInternalStates: -1}
    };
    this.statsByLine = {
      '-1': {resultOf: new Set(), causeOf: new Set(), minPathActions: -1, maxPathActions: -1, numInternalStates: -1}
    };

    let queue: {node: ParserNode, prevNodeStr: string, prevId: string, prevLine: number}[] = [{
      node: root,  prevNodeStr: 'QUEST_START', prevId: 'QUEST_START', prevLine: -1,
    }];

    let maxPath = 0;
    while(queue.length > 0 && maxPath < 50) {
      let q = queue.shift();
      const id = q.node.elem.attr('id') || q.prevId;
      const line = parseInt(q.node.elem.attr('data-line'), 10);

      // This happens if for some reason line numbers weren't calculated for this quest.
      // Don't traverse farther here, as it'll throw off our stats generation.
      if (isNaN(line)) {
        this.statsById[q.prevId].causeOf.add('INVALID_NODE');
        this.statsByLine[q.prevLine].causeOf.add('INVALID_NODE');
        continue;
      }

      // This happens when we hit the end of a quest.
      if (q.node.getTag() === 'trigger' && q.node.elem.text().trim() === 'end') {
        this.statsById[q.prevId].causeOf.add('END');
        this.statsByLine[q.prevLine].causeOf.add('END');
        continue;
      }

      // Mark this node and context as having been seen. If we've seen it before,
      // don't act on it.
      const nstr = q.node.getComparisonKey();
      if (this.seen.has(nstr)) {
        continue;
      }
      this.seen.add(nstr);

      // At this point, the node is valid and has never been visited before under the given context.

      // Create stats for this line/id if they don't already exist
      if (this.statsById[id] === undefined) {
        this.statsById[id] = {
          resultOf: new Set(),
          causeOf: new Set(),
          minPathActions: this.statsById[q.prevId].minPathActions + 1,
          maxPathActions: this.statsById[q.prevId].maxPathActions + 1,
          numInternalStates: 1,
        };
      }
      if (this.statsByLine[line] === undefined) {
        this.statsByLine[line] = {
          resultOf: new Set(),
          causeOf: new Set(),
          minPathActions: this.statsByLine[q.prevLine].minPathActions + 1,
          maxPathActions: this.statsByLine[q.prevLine].maxPathActions + 1,
          numInternalStates: 0,
        };
      }

      // Fetch statistics
      let prevLineStats = this.statsByLine[q.prevLine];
      let lineStats = this.statsByLine[line];

      // Update ID statistics
      if (id !== q.prevId) {
        // We're in the boundary between ID sections. Update:
        // - outbound edges for the previous ID
        // - inbound edges for the next ID.
        // - path actions
        this.statsById[id].maxPathActions = Math.max(this.statsById[id].maxPathActions, (this.statsById[q.prevId].maxPathActions || 0) + 1);
        this.statsById[id].minPathActions = Math.min(this.statsById[id].minPathActions, (this.statsById[q.prevId].minPathActions || 0) + 1);
        this.statsById[id].resultOf.add(q.prevId);
        this.statsById[q.prevId].causeOf.add(id);
      } else {
        // We're still within the same ID. Increment numInternalStates.
        this.statsById[id].numInternalStates++;
      }

      // Update line stats for this line & prev line
      this.statsByLine[line].maxPathActions = Math.max(this.statsByLine[line].maxPathActions, (this.statsByLine[q.prevLine].maxPathActions || 0) + 1);
      this.statsByLine[line].minPathActions = Math.min(this.statsByLine[line].minPathActions, (this.statsByLine[q.prevLine].minPathActions || 0) + 1);
      lineStats.resultOf.add(q.prevNodeStr);
      this.statsByLine[q.prevLine].causeOf.add(nstr);

      maxPath = Math.max(maxPath, this.statsByLine[line].maxPathActions);

      // Push on all outbound edges as work to be done.
      const keys = q.node.getVisibleKeys();
      if (keys.length === 0) {
        // 0 is default "next" button id
        keys.push(0);
      }
      for (let k of keys) {
        let node = handleAction(q.node, k);
        if (node === undefined || node === null) {
          this.statsById[id].causeOf.add('IMPLICIT_END');
          this.statsByLine[line].causeOf.add('IMPLICIT_END');
          continue;
        }

        queue.push({
          node: node,
          prevNodeStr: nstr,
          prevId: id,
          prevLine: line
        });
      }
    }


  }
}
