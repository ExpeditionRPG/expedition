
var data = Object();

data.genericCombatXML = `<combat>
    <e>UNKNOWN</e>
    <event on="win">
        <trigger>end</trigger>
    </event>
    <event on="lose">
        <trigger>end</trigger>
    </event>
</combat>`;

data.fullCombatXML = `<combat>
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

data.combatConditionalEventXML = `<combat>
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

data.combatJSONEnemyXML = `<combat>
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

data.fullRoleplayXML = `<roleplay title="roleplay">
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

data.roleplayConditionalChoiceXML = `<roleplay title="roleplay">
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

data.roleplayNoTitle = `<roleplay title="">
    <p>Victory!</p>
</roleplay>`

data.roleplayWithID = `<roleplay title="Title" id="testid123">
    <p>hi</p>
</roleplay>`;

data.combatNoEnemyOrEventsLog = `ERROR L0:
combat block has no enemies listed
URL: 404

ERROR L0:
combat block must have \'win\' event
URL: 404

ERROR L0:
combat block must have \'lose\' event
URL: 404`;

data.combatBadParseLog = `ERROR L0:
could not parse block header
URL: 404

ERROR L0:
combat block has no enemies listed
URL: 404

ERROR L0:
combat block must have \'win\' event
URL: 404

ERROR L0:
combat block must have \'lose\' event
URL: 404`;

data.badQuestAttrError = `ERROR L0:
unknown: "testparam"
URL: 404`;

data.invalidQuestAttrError = `ERROR L0:
minplayers should be a number, but is "hi"
URL: 404`;

data.badParseQuestAttrError = `ERROR L1:
invalid quest attribute string "minplayers1"
URL: 404

ERROR L0:
missing: "minplayers"
URL: 404`;

export default data;