import {
  Cheerio as CheerioSet,
  CheerioAPI as CheerioSelector,
  CheerioOptions,
  load as slimLoad,
} from 'cheerio/slim';
import { AnyNode, Element } from 'domhandler';

// The repo's single entry point to cheerio.
//
// Two deliberate choices live here, both of which keep cheerio 1.x parsing and
// serialising quest XML byte-for-byte the way cheerio 0.22 did. Quest XML is a
// persisted, publicly served artifact (`GET /raw/:partition/:quest/:version`
// returns it as text/xml, and services/quests publishes it as
// `String(renderResult.getResult())`), so a change here rewrites every quest on
// the site.
//
// 1. `cheerio/slim` rather than `cheerio`. The default entry point parses HTML
//    with parse5, which wraps documents in <html><head><body> and drops the
//    XML apostrophe/quote entities; it also pulls in undici for `fromURL`,
//    which is dead weight in four browser bundles and has no `ReadableStream`
//    under jest's jsdom environment. `slim` is htmlparser2-only -- exactly the
//    parser cheerio 0.22 used -- and ships neither parse5 nor undici.
//
// 2. `emptyAttrs: true`. dom-serializer 2 defaults to HTML5 bare-attribute
//    output (`<roleplay title>`), where dom-serializer 0.1 always wrote
//    `<roleplay title="">`. Bare attributes are not well-formed XML, and
//    `title=""` is extremely common in generated quests, so the old form is
//    restored. It is set through `xml: {...}` because that is the only branch
//    of `CheerioOptions` that carries the serializer options; `xmlMode` is
//    switched straight back off, since XML mode would additionally start
//    emitting self-closing `<p/>` for empty elements.
//
// The one serialization difference that could not be preserved is the case of
// hexadecimal character references: the `entities` package now emits
// `&#x261e;` where it used to emit `&#x261E;`. Character references are
// case-insensitive in both XML and HTML, so this is cosmetic.
const OPTIONS: CheerioOptions = {
  xml: { xmlMode: false, emptyAttrs: true },
};

/** A wrapped set of nodes -- what the global `Cheerio` from @types/cheerio was. */
export type Cheerio = CheerioSet<Element>;

/** A document-bound querying function -- `$`. */
export type CheerioAPI = CheerioSelector;

/** Parses markup and returns the document-bound `$`. */
export function load(content: string | AnyNode | AnyNode[]): CheerioAPI {
  return slimLoad(content, OPTIONS);
}
