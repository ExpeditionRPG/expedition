
var data = Object();

data.genericCombatXML = `<combat data-line="0">
    <e>UNKNOWN</e>
    <event on="win">
        <trigger>end</trigger>
    </event>
    <event on="lose">
        <trigger>end</trigger>
    </event>
</combat>`;

data.fullCombatXML = `<combat data-line="0">
    <e>e1</e>
    <e>e2</e>
    <event on="win">
        <roleplay>
            <p>win</p>
        </roleplay>
    </event>
    <event on="lose">
        <roleplay>
            <p>lose</p>
        </roleplay>
    </event>
</combat>`;

data.combatConditionalEventXML = `<combat data-line="0">
    <e>e1</e>
    <e>e2</e>
    <event on="win" if="test1">
        <roleplay>
            <p>win</p>
        </roleplay>
    </event>
    <event on="lose" if="test2">
        <roleplay>
            <p>lose</p>
        </roleplay>
    </event>
</combat>`;

data.combatJSONEnemyXML = `<combat data-line="0">
    <e>skeleton</e>
    <e if="cond">test</e>
    <event on="win" if="test1">
        <roleplay>
            <p>win</p>
        </roleplay>
    </event>
    <event on="lose" if="test2">
        <roleplay>
            <p>lose</p>
        </roleplay>
    </event>
</combat>`;

data.fullRoleplayXML = `<roleplay title="roleplay" data-line="0">
    <p>text</p>
    <choice text="choice">
        <roleplay>
            <p>choice text</p>
        </roleplay>
    </choice>
    <choice text="other choice">
        <roleplay>
            <p>other choice text</p>
        </roleplay>
    </choice>
</roleplay>`;

data.roleplayConditionalChoiceXML = `<roleplay title="roleplay" data-line="0">
    <p>text</p>
    <choice text="choice" if="test1">
        <roleplay>
            <p>choice text</p>
        </roleplay>
    </choice>
    <choice text="other choice" if="test2">
        <roleplay>
            <p>other choice text</p>
        </roleplay>
    </choice>
</roleplay>`;

data.roleplayChoiceNoTitle = `<roleplay title="roleplay" data-line="5">
    <p>text</p>
    <choice text="" if="test1">
        <roleplay>
            <p>choice text</p>
        </roleplay>
    </choice>
</roleplay>`

data.roleplayNoTitle = `<roleplay title="" data-line="21">
    <p>Victory!</p>
</roleplay>`;

data.roleplayWithID = `<roleplay title="Title" id="testid123" data-line="21">
    <p>hi</p>
</roleplay>`;

data.combatNoEnemyOrEventsLog = `ERROR L0:
combat card has no enemies listed
URL: 414

ERROR L0:
combat card must have 'on win' event
URL: 417

ERROR L0:
combat card must have 'on lose' event
URL: 417`;

data.combatBadParseLog = `ERROR L0:
could not parse block header
URL: 413

ERROR L0:
combat card has no enemies listed
URL: 414

ERROR L0:
combat card must have 'on win' event
URL: 417

ERROR L0:
combat card must have 'on lose' event
URL: 417`;

data.badParseQuestAttrError = `ERROR L1:
invalid quest attribute line "minplayers1"
URL: 420

ERROR L0:
missing: "minplayers"
URL: 424`;

data.missingTitleErr = `ERROR L5:
choice missing title
URL: 428`;

export default data;
