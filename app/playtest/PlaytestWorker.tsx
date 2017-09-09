// This file is a WebWorker - see the spec at
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

import {Node} from 'expedition-qdl/lib/parse/Node'
import {defaultContext} from 'expedition-qdl/lib/parse/Context'
import {PlaytestCrawler} from './PlaytestCrawler'
import {Logger, LogMessageMap} from 'expedition-qdl/lib/render/Logger'
import {initQuest} from 'expedition-app/app/actions/Quest'

const cheerio: any = require('cheerio') as CheerioAPI;

function maybePublishLog(logger: Logger) {
  const m = logger.getFinalizedLogs();
  if (m.error.length || m.info.length || m.internal.length || m.warning.length) {
    (postMessage as any)(m);
  }
}

export function handleMessage(e: {data: {type: 'RUN', timeoutMillis: number, xml: string}}) {
  const crawler = new PlaytestCrawler(null);
  const start = Date.now();
  const timeout = e.data.timeoutMillis || 10000; // 10s to playtest results
  const logger = new Logger();
  const elem = cheerio.load(e.data.xml)('quest > :first-child');
  if (!elem) {
    throw new Error('Invalid element passed to webworker');
  }
  console.log('playtesting...');
  let hasMore = crawler.crawlWithLog(new Node(elem, defaultContext()), logger);
  let queueLen = 0;
  let numSeen = 0;
  maybePublishLog(logger);

  while ((Date.now() - start) < timeout && hasMore) {
    const logger = new Logger();
    let [hasMore, queueLen, numSeen] = crawler.crawlWithLog(null, logger);
    console.log('... (queueLen: ' + queueLen, + ', seen ' + numSeen + ')');
    maybePublishLog(logger);
  }
  console.log('Playtest complete (' + (Date.now() - start) + 'ms)');
  close();
}

onmessage = (handleMessage as any);
