/*

<dom-module id="expedition-indicator">
  <style>
    svg, img {
      width: var(--vw-large);
      height: var(--vh-large);
      display: inline-block;
    }

    :host .indicator-text {
      font-style: italic;
      padding-left: var(--vw-base);
      padding-top: var(--vw-small);
    };

    :host.dark svg {
      fill: var(--font-color-dark-primary);
    };

    :host.dark {
      background-color: black;
      color: var(--font-color-dark-primary);
    }
  </style>

  <template>
    <div class="layout horizontal start"><img id="bgimg" src="images/{{_icon}}_small.svg"></img><div class="flex indicator-text"><content></content></div></div>
  </template>
  <script>
    Polymer({
      is: 'expedition-indicator',
      ready: function() {
        this._icon = "";

        if (this.dark) {
          this.className = "dark";
        }
        this._onIconChange();
      },
      _onIconChange: function() {
        if (this.icon) {
          this._icon = (this.dark) ? this.icon + "_white" : this.icon;

          // Allow the template time to render
          Polymer.dom.flush();

          SVGInjector(this.querySelector('#bgimg'), {}, null);
        }
        */