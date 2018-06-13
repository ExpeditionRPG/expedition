import {Node} from './Node'
import {Context} from './Context'

const FastPriorityQueue: any = require('fastpriorityqueue');

export type CrawlEvent = 'INVALID' | 'END' | 'IMPLICIT_END' | 'MAX_DEPTH_EXCEEDED' | 'ALREADY_SEEN';

export type CrawlEntry<C extends Context> = {node: Node<C>|null, prevNodeStr: string, prevId: string, prevLine: number, depth: number};

interface CrawlPriorityQueue<C extends Context> {
  add: (v: CrawlEntry<C>) => void;
  size: number;
  poll: () => CrawlEntry<C>;
  peek: () => CrawlEntry<C>;
}

function getNodeLine(node: Node<Context>|null): number {
  if (node === null) {
    return -1;
  }

  try {
    return parseInt(node.elem.attr('data-line'), 10);
  } catch (e) {
    return -1;
  }
}

export abstract class CrawlerBase<C extends Context> {
  protected seen: Set<string>;
  protected lineVisitCount: {[line: number]: number};
  protected queue: CrawlPriorityQueue<C>;

  constructor() {
    this.seen = new Set();
    this.lineVisitCount = {};

    // This is a priority queue based on the number of times we've visited the
    // node in question (e.g. with different contexts). This ensures relatively
    // even coverage of all the nodes in the story.
    this.queue = new FastPriorityQueue((a: CrawlEntry<C>, b: CrawlEntry<C>) => {
      return (this.lineVisitCount[getNodeLine(a.node)] || 0) < (this.lineVisitCount[getNodeLine(b.node)] || 0);
    });
  }

  public crawl(root?: Node<C>, timeLimitMillis = 500, depthLimit = 50): boolean {
    return this.traverse(root, timeLimitMillis, depthLimit);
  }

  protected calculateAddedDepth(n: Node<C>): number {
    // This function calculates and returns the depth "cost" of a node.
    // Nodes that take more time to engage with (e.g. combat or "prosaic" nodes)
    // may return a higher score.
    return 1;
  }

  protected abstract onEvent(q: CrawlEntry<C>, e: CrawlEvent): void;

  protected abstract onNode(q: CrawlEntry<C>, nodeStr: string, id: string, line: number): void;

  // Traverses the graph in breadth-first order starting with a given node.
  // Stats are collected separately per-id and per-line
  private traverse(root?: Node<C>, timeLimitMillis?: number, depthLimit?: number): boolean {
    if (root) {
      this.queue.add({
        node: root,  prevNodeStr: 'START', prevId: 'START', prevLine: -1, depth: 0
      });
    }

    const start = Date.now();
    while(this.queue.size > 0 && (!timeLimitMillis || (Date.now() - start) < timeLimitMillis)) {
      const q = this.queue.poll();

      // If we've gone too deep into the quest, don't crawl further.
      if (depthLimit && q.depth >= depthLimit) {
        this.onEvent(q, 'MAX_DEPTH_EXCEEDED');
        continue;
      }

      // This happens if we've navigated "outside the quest", e.g. a user doesn't end all their nodes with end tag.
      if (q.node === undefined || q.node === null) {
        this.onEvent(q, 'IMPLICIT_END');
        continue;
      }

      const id = q.node.elem.attr('id') || q.prevId;
      const line = parseInt(q.node.elem.attr('data-line'), 10);
      this.lineVisitCount[line] = (this.lineVisitCount[line] || 0) + 1;

      // This happens if for some reason line numbers weren't calculated for this quest.
      // Don't traverse farther, else it'll throw off our crawl state.
      if (isNaN(line)) {
        this.onEvent(q, 'INVALID');
        continue;
      }

      // This happens when we hit the end of a quest.
      if (q.node.getTag() === 'trigger' && q.node.elem.text().trim() === 'end') {
        this.onEvent(q, 'END');
        continue;
      }

      // Mark this node and context as having been seen. If we've seen it before,
      // don't act on it.
      const nstr = q.node.getComparisonKey();
      if (this.seen.has(nstr)) {
        this.onEvent(q, 'ALREADY_SEEN');
        continue;
      }
      this.seen.add(nstr);

      // At this point, the node is valid and has never been visited before under the given context.
      this.onNode(q, nstr, id, line);

      // Push on all outbound edges as work to be done.
      const keys = q.node.getVisibleKeys();
      if (keys.length === 0) {
        // 0 is default "next" button id
        keys.push(0);
      }
      for (const k of keys) {
        this.queue.add({
          node: q.node.handleAction(k),
          prevNodeStr: nstr,
          prevId: id,
          prevLine: line,
          depth: q.depth + this.calculateAddedDepth(q.node),
        });
      }
    }
    return (this.queue.size > 0);
  }
}
