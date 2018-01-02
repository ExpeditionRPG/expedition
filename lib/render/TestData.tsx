
const data = Object();

data.basicMD = `#Quest Title

_Roleplay Card_

Stuff

And a line

_Another Card_

More stuff

* Decision

  _combat_

  - Skeleton Swordsman
  - {{anEnemyExpression}}
  - {{condition}} BadGuy

  * on win

    Victory!

  * on lose

    Defeat!

    **end**

* Another decision
  that is multiple lines long

  More stuff

  **end**

* Still another decision!

  And a thing.

  **end**

_Fall Through_

Game over

> You win

**end**`;

data.basicXML = `<quest title="Quest Title" data-line="0">
    <roleplay title="Roleplay Card" data-line="2">
        <p>Stuff</p>
        <p>And a line</p>
    </roleplay>
    <roleplay title="Another Card" data-line="8">
        <p>More stuff</p>
        <choice text="Decision">
            <combat data-line="14">
                <e>Skeleton Swordsman</e>
                <e>{{anEnemyExpression}}</e>
                <e if="condition">BadGuy</e>
                <event on="win">
                    <roleplay title="" data-line="22">
                        <p>Victory!</p>
                    </roleplay>
                </event>
                <event on="lose">
                    <roleplay title="" data-line="26">
                        <p>Defeat!</p>
                    </roleplay>
                    <trigger data-line="28">end</trigger>
                </event>
            </combat>
        </choice>
        <choice text="Another decision that is multiple lines long">
            <roleplay title="" data-line="33">
                <p>More stuff</p>
            </roleplay>
            <trigger data-line="35">end</trigger>
        </choice>
        <choice text="Still another decision!">
            <roleplay title="" data-line="39">
                <p>And a thing.</p>
            </roleplay>
            <trigger data-line="41">end</trigger>
        </choice>
    </roleplay>
    <roleplay title="Fall Through" data-line="43">
        <p>Game over</p>
        <instruction>
            <p>You win</p>
        </instruction>
    </roleplay>
    <trigger data-line="49">end</trigger>
</quest>`;

data.conditionalsMD = `#Quest Title

_Roleplay Card_

{{a=1}}

{{b="b"}}

{{a == 1}} Visible {{b}}

{{a > 1}} Invisible {{b}}

> {{a == 1}} Visible {{b}}

> {{a > 1}} Invisible {{b}}

* choice ({{b}})

    _Title {{b}}_

    Text

**end**`;

data.conditionalsXML = `<quest title="Quest Title" data-line="0">
    <roleplay title="Roleplay Card" data-line="2">
        <p>{{a=1}}</p>
        <p>{{b=&quot;b&quot;}}</p>
        <p if="a == 1">Visible {{b}}</p>
        <p if="a &gt; 1">Invisible {{b}}</p>
        <instruction if="a == 1">
            <p>Visible {{b}}</p>
        </instruction>
        <instruction if="a &gt; 1">
            <p>Invisible {{b}}</p>
        </instruction>
        <choice text="choice ({{b}})">
            <roleplay title="Title {{b}}" data-line="18">
                <p>Text</p>
            </roleplay>
        </choice>
    </roleplay>
    <trigger data-line="22">end</trigger>
</quest>`;

data.commentsMD = `#Quest Title

_Roleplay Card_

// Invisible comment

Stuff

* Decision

  // Invisible comment

  _combat_

  - Skeleton Swordsman

  * on win

    // Invisible comment

    Victory!

  * on lose

    Defeat!

    **end**

    // Invisible comment

  // Invisible comment

* Another decision

  // Invisible comment

  **end**

// Invisible comment

_Title_

Game over

// Invisible comment

**end**`;

data.commentsXML = `<quest title="Quest Title" data-line="0">
    <roleplay title="Roleplay Card" data-line="2">
        <p>Stuff</p>
        <choice text="Decision">
            <combat data-line="12">
                <e>Skeleton Swordsman</e>
                <event on="win">
                    <roleplay title="" data-line="20">
                        <p>Victory!</p>
                    </roleplay>
                </event>
                <event on="lose">
                    <roleplay title="" data-line="24">
                        <p>Defeat!</p>
                    </roleplay>
                    <trigger data-line="26">end</trigger>
                </event>
            </combat>
        </choice>
        <choice text="Another decision">
            <trigger data-line="36">end</trigger>
        </choice>
    </roleplay>
    <roleplay title="Title" data-line="40">
        <p>Game over</p>
    </roleplay>
    <trigger data-line="46">end</trigger>
</quest>`;

data.indentsMD = `#Quest Title

_Roleplay Card_

Stuff

* Decision

  Stuff2

  * Decision2

    Stuff3

    * Decision3

      Stuff4

      * Decision4

        Stuff5

        * Decision5

            Stuff6

**end**`;

data.indentsXML = `<quest title="Quest Title" data-line="0">
    <roleplay title="Roleplay Card" data-line="2">
        <p>Stuff</p>
        <choice text="Decision">
            <roleplay title="" data-line="8">
                <p>Stuff2</p>
                <choice text="Decision2">
                    <roleplay title="" data-line="12">
                        <p>Stuff3</p>
                        <choice text="Decision3">
                            <roleplay title="" data-line="16">
                                <p>Stuff4</p>
                                <choice text="Decision4">
                                    <roleplay title="" data-line="20">
                                        <p>Stuff5</p>
                                        <choice text="Decision5">
                                            <roleplay title="" data-line="24">
                                                <p>Stuff6</p>
                                            </roleplay>
                                        </choice>
                                    </roleplay>
                                </choice>
                            </roleplay>
                        </choice>
                    </roleplay>
                </choice>
            </roleplay>
        </choice>
    </roleplay>
    <trigger data-line="26">end</trigger>
</quest>`;

data.noHeaderMD = `_Roleplay Card_

stuff

**end**`;

data.noHeaderError = `ERROR L0:
root block must be a quest header
URL: 421`;

data.emptyXML = `<quest title="Error">
    <roleplay></roleplay>
</quest>`;

data.emptyError = `ERROR L0:
no quest blocks found
URL: 422`;

data.triggerWithNoAfterHeader = `#Quest Title

**end**

Roleplay card without header`;

data.triggerWithNoAfterHeaderXML = `<quest title="Quest Title" data-line="0">
    <trigger data-line="2">end</trigger>
    <roleplay title="" data-line="4">
        <p>Roleplay card without header</p>
    </roleplay>
</quest>`;

export default data;
