// LiveQDL is a stateful QDL parsing utility that handles incremental changes in
// quest code, compiling as needed and allowing for real-time updates in the
// companion app preview.
//
// Goals:
// - Snapping user cursor to position when choice clicked
// - Showing errors in Ace gutter
// - Updating preview body in real time

import {QDLRenderer} from './QDLRenderer'
import {BlockList} from './BlockList'
import {BlockMsg, BlockMsgMap} from './BlockMsg'
import {BlockRenderer, XMLRenderer} from './BlockRenderer'

export function renderXML(md: string, cb: (renderer: QDLRenderer) => any): void {
  var qdl = new QDLRenderer(XMLRenderer);
  qdl.render(new BlockList(md));
  cb(qdl);
}