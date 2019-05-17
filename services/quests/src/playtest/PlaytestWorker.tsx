/* tslint:disable:no-console */

// This file is a WebWorker - see the spec at
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

import {Node} from 'shared/parse/Node';
import {Logger} from 'shared/render/Logger';
import {PlaytestSettings} from '../reducers/StateTypes';
import {PlaytestCrawler} from './PlaytestCrawler';

const cheerio: any = require('cheerio') as CheerioAPI;

// TODO: This Card context shouldn't have to be mocked here - update cardtemplates in the app
// so we don't need this.
function mockContext() {
  const populateScopeFn = () => {
    return {
      contentSets(): {[content: string]: boolean} {
        return {horror: true, future: true, scarredlands: true};
      },
      numAdventurers(): number {
        return 3;
      },
      viewCount(id: string): number {
        return this.views[id] || 0;
      },
      randomEnemy(): string {
        return 'Giant Rat';
      },
      randomEnemyOfTier(tier: number): string {
        return 'Giant Rat';
      },
      randomEnemyOfClass(className: string): string {
        return 'Giant Rat';
      },
      randomEnemyOfClassTier(className: string, tier: number): string {
        return 'Giant Rat';
      },
      currentCombatRound(): number {
        return 0;
      },
      isCombatSurgeRound(): boolean {
        return false;
      },
    };
  };

  const newContext: any = {
    _templateScopeFn: populateScopeFn, // Used to refill template scope elsewhere (without dependencies)
    path: ([] as any),
    scope: {
      _: populateScopeFn(),
    },
    templates: {},
    views: {},
  };

  for (const k of Object.keys(newContext.scope._)) {
    newContext.scope._[k] = (newContext.scope._[k] as any).bind(newContext);
  }

  return newContext;
}

function maybePublishLog(logger: Logger) {
  const m = logger.getFinalizedLogs();
  if (m.error.length || m.info.length || m.internal.length || m.warning.length) {
    (postMessage as any)(m);
  }
}

interface RunMessage {
  type: 'RUN';
  timeoutMillis: number;
  settings: PlaytestSettings;
  xml: string;
}

function handleMessage(e: {data: RunMessage}) {
  try {
    const crawler = new PlaytestCrawler(e.data.settings);
    const start = Date.now();
    const timeout = e.data.timeoutMillis || 10000; // 10s to playtest results
    const logger = new Logger();
    const elem = cheerio.load(e.data.xml)('quest > :first-child');
    if (!elem) {
      throw new Error('Invalid element passed to webworker');
    }
    console.log('Playtest STARTED');
    let [queueLen, numSeen] = crawler.crawlWithLog(new Node(elem, mockContext()), logger);
    maybePublishLog(logger);

    let elapsed = 0;
    let lastLog = elapsed;
    let step = 0;

    const asyncTest = () => {
      if (elapsed > timeout || !(queueLen > 0)) {
        console.log('Playtest COMPLETE (' + (Date.now() - start) + 'ms)');
        (postMessage as any)({status: 'COMPLETE'});
        close();
        return;
      }

      const result = crawler.crawlWithLog(undefined, logger);
      queueLen = result[0];
      numSeen = result[1];
      if (elapsed - lastLog > 250) {
        console.log('Playtest (step: ' + step + ' queueLen: ' + queueLen + ', seen ' + numSeen + ')');
        lastLog = elapsed;
      }
      maybePublishLog(logger);
      elapsed = (Date.now() - start);
      step++;

      setTimeout(asyncTest, 0);
    };
    asyncTest();
  } catch (err) {
    console.error(err.toString());
    (postMessage as any)({status: 'COMPLETE'});
  }
}

onmessage = (handleMessage as any);
