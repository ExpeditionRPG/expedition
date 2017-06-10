import {Crawler} from 'expedition-app/app/parser/Crawler'

// Surfaces errors, warnings, statistics, and other useful information
// about particular states encountered during play through the quest, or
// about the quest in aggregate.
class XMLCrawler extends Crawler {

  public crawl(node: ParserNode) {
    super.crawl(node);
    // TODO: Calculate and log aggregate stats.
  }

  private crawlNode(node: ParserNode, prev: ParserNode) {
    // TODO: All the gooey internal shiz.
  }

  public getFinalizedMessages(): LogMessage {
    return null;
  }
}


export function crawlXML(xml: string) {
  const root = new ParserNode(cheerio.load(xml)('quest > :first-child'), defaultQuestContext());
  const crawler = new XMLCrawler();
  crawler.crawl(root);

}
