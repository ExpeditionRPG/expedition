
var data = Object();

data.basicMD = `#Quest Title
minplayers: 1
maxplayers: 2
author: Test

_Roleplay Card_

Stuff

And a line

_Another Card_

More stuff

* Decision

  _combat_ {"enemies": ["Skeleton Swordsman"]}

  * on win

    Victory!

    **end**

  * on lose

    Defeat!

    **end**

* Another decision
  that is multiple lines long

  More stuff

  **end**

* Still another decision!

  And a thing.

  **end**`;

data.basicXML = `<quest title="Quest Title" minplayers="1" maxplayers="2" author="Test">
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

data.noHeaderMD = `_Roleplay Card_

stuff

**end**
`;

data.noHeaderError = `ERROR Lnone (0 blocks):
root block must be a quest header
URL: 404`;

data.badQuestAttrMD = `#Quest Title
minplayers: 1
maxplayers: 2
author: Test
testparam: hi

_Roleplay Card_

**end**`;

data.badQuestAttrError = `ERROR L4 (1 blocks):
unknown quest attribute "testparam"
URL: 404`;

data.invalidQuestAttrMD = `#Quest Title
minplayers: hi
maxplayers: 2
author: Test

_Roleplay Card_

**end**`;

data.invalidQuestAttrError = `ERROR L0 (1 blocks):
invalid value "hi" for quest attribute "minplayers"
URL: 404`;

data.emptyXML = `<quest title="Error">
    <roleplay></roleplay>
</quest>`;

data.emptyError = `ERROR Lnone (0 blocks):
No quest blocks found
URL: 404`;

export default data;