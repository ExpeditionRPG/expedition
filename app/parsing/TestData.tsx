
var data = Object();

data.basicMD = `#Quest Title
testparam: hi

_Roleplay Card_

Stuff

And a line

_Another Card_

More stuff

* Decision

  _combat_ {"enemies": ["Skeleton Swordsman"]}

  * on win

    Victory!

    _end_

  * on lose

    Defeat!

    _end_

* Another decision
  that is multiple lines long

  More stuff

  _end_

* Still another decision!

  And a thing.

  _end_`;

data.basicXML = `<quest title="Quest Title" testparam="hi">
    <roleplay title="Roleplay Card">
        <p>Stuff</p>
        <p>And a line</p>
    </roleplay>
    <roleplay title="Another Card">
        <p>More stuff</p>
        <choice text="Decision">
            <combat>
                <e>Skeleton Swordsman</e>
                <event on="win">
                    <roleplay>
                        <p>Victory!</p>
                    </roleplay>
                    <trigger>end</trigger>
                </event>
                <event on="lose">
                    <roleplay>
                        <p>Defeat!</p>
                    </roleplay>
                    <trigger>end</trigger>
                </event>
            </combat>
        </choice>
        <choice text="Another decision that is multiple lines long">
            <roleplay>
                <p>More stuff</p>
            </roleplay>
            <trigger>end</trigger>
        </choice>
        <choice text="Still another decision!">
            <roleplay>
                <p>And a thing.</p>
            </roleplay>
            <trigger>end</trigger>
        </choice>
    </roleplay>
</quest>`;

data.emptyXML = `<quest>
    <roleplay>
        <p></p>
    </roleplay>
</quest>`;

data.emptyError = `ERROR Lnone (0 blocks):
root block must be a quest header
URL: 404`;

export default data;