declare module "brace" {
  var brace: any;
  export = brace;
}

declare namespace React{
	interface DOMAttributes<T> {
		onTouchTap?: Function,
	}
}

declare module "react-ace" {
  var AceEditor: any;
  export = AceEditor;
}