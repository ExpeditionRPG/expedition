// This file is a WebWorker - see the spec at
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

import {ParserNode, defaultContext} from 'expedition-app/app/cardtemplates/Template'
import {PlaytestCrawler} from './PlaytestCrawler'
import {Logger, LogMessageMap} from 'expedition-qdl/lib/render/Logger'
import {initQuest} from 'expedition-app/app/actions/Quest'


function maybePublishLog(logger: Logger) {
  const m = logger.getFinalizedLogs();
  if (m.error.length || m.info.length || m.internal.length || m.warning.length) {
    (postMessage as any)(m);
  }
}

export function handleMessage(e: {type: 'RUN', timeoutMillis: number, node: ParserNode}) {
  try {
    const crawler = new PlaytestCrawler(null);
    const start = Date.now();
    let hasMore = true;
    while ((Date.now() - start) < e.timeoutMillis && hasMore) {
      const logger = new Logger();
      hasMore = crawler.crawlWithLog(e.node, logger);
      maybePublishLog(logger);
    }
  } catch(e) {
    const logger = new Logger();
    logger.dbg('Auto-Playtest failed (likely a parser error)');
    maybePublishLog(logger);
  }
  close();
}

onmessage = (handleMessage as any);
