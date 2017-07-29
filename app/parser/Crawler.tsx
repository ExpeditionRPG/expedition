import {ParserNode} from './Node'
import {handleAction} from './Handlers'

export type CrawlEvent = 'INVALID' | 'END' | 'IMPLICIT_END';

export type CrawlEntry = {node: ParserNode, prevNodeStr: string, prevId: string, prevLine: number, depth: number};

export abstract class CrawlerBase {
  protected seen: Set<string>;
  protected queue: CrawlEntry[];

  constructor() {
    this.seen = new Set();
    this.queue = [];
  }

  public crawl(root: ParserNode, timeLimitMillis = 500, depthLimit = 50) {
    this.traverse(root, timeLimitMillis, depthLimit);
  }

  protected abstract onEvent(q: CrawlEntry, e: CrawlEvent): void;

  protected abstract onNode(q: CrawlEntry, nodeStr: string, id: string, line: number): void;

  // Traverses the graph in breadth-first order starting with a given node.
  // Stats are collected separately per-id and per-line
  private traverse(root?: ParserNode, timeLimitMillis?: number, depthLimit?: number) {
    if (root) {
      this.queue.push({
        node: root,  prevNodeStr: 'START', prevId: 'START', prevLine: -1, depth: 0
      });
    }

    const start = Date.now();
    while(this.queue.length > 0 && (!depthLimit || this.queue[0].depth < depthLimit) && (!timeLimitMillis || (Date.now() - start) < timeLimitMillis)) {
      const q = this.queue.shift();

      // This happens if we've navigated "outside the quest", e.g. a user doesn't end all their nodes with end tag.
      if (q.node === undefined || q.node === null) {
        this.onEvent(q, 'IMPLICIT_END');
        continue;
      }

      const id = q.node.elem.attr('id') || q.prevId;
      const line = parseInt(q.node.elem.attr('data-line'), 10);

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
        this.queue.push({
          node: handleAction(q.node, k),
          prevNodeStr: nstr,
          prevId: id,
          prevLine: line,
          depth: q.depth + 1
        });
      }
    }
  }
}
