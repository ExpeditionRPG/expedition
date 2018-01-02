
const data = Object();

data.genericCombatXML = `<combat data-line="0">
    <e>UNKNOWN</e>
    <event on="win">
        <trigger>end</trigger>
    </event>
    <event on="lose">
        <trigger>end</trigger>
    </event>
</combat>`;

data.badJSONXML = `<combat data-line="0">
    <e>e1</e>
    <event on="lose">
        <roleplay data-line="3">
            <p>lose</p>
        </roleplay>
    </event>
    <event on="win">
        <trigger>end</trigger>
    </event>
</combat>`;

data.fullCombatXML = `<combat data-line="0">
    <e>e1</e>
    <e tier="3">e2</e>
    <event on="win">
        <roleplay data-line="2">
            <p>win</p>
        </roleplay>
    </event>
    <event on="lose">
        <roleplay data-line="3">
            <p>lose</p>
        </roleplay>
    </event>
</combat>`;

data.combatConditionalEventXML = `<combat data-line="0">
    <e>e1</e>
    <e>e2</e>
    <event on="win" if="test1">
        <roleplay data-line="2">
            <p>win</p>
        </roleplay>
    </event>
    <event on="lose" if="test2">
        <roleplay data-line="3">
            <p>lose</p>
        </roleplay>
    </event>
</combat>`;

data.combatJSONEnemyXML = `<combat data-line="0">
    <e>skeleton</e>
    <e if="cond">test</e>
    <event on="win" if="test1" heal="2">
        <roleplay data-line="2">
            <p>win</p>
        </roleplay>
    </event>
    <event on="lose" if="test2">
        <roleplay data-line="3">
            <p>lose</p>
        </roleplay>
    </event>
</combat>`;

data.fullRoleplayXML = `<roleplay title="roleplay" data-line="0">
    <p>text</p>
    <choice text="choice">
        <roleplay data-line="2">
            <p>choice text</p>
        </roleplay>
    </choice>
    <choice text="other choice">
        <roleplay data-line="3">
            <p>other choice text</p>
        </roleplay>
    </choice>
</roleplay>`;

data.roleplayConditionalChoiceXML = `<roleplay title="roleplay" data-line="0">
    <p>text</p>
    <choice text="choice" if="test1">
        <roleplay data-line="2">
            <p>choice text</p>
        </roleplay>
    </choice>
    <choice text="other choice" if="test2">
        <roleplay data-line="3">
            <p>other choice text</p>
        </roleplay>
    </choice>
</roleplay>`;

data.roleplayChoiceNoParse = `<roleplay title="roleplay" data-line="5">
    <p>text</p>
    <p></p>
</roleplay>`;

data.roleplayChoiceNoTitle = `<roleplay title="roleplay" data-line="5">
    <p>text</p>
    <choice text="" if="test1">
        <roleplay data-line="7">
            <p>choice text</p>
        </roleplay>
    </choice>
</roleplay>`;

data.roleplayArt = `<roleplay title="roleplay" data-line="5">
    <p>text [art] text</p>
</roleplay>`;

data.roleplayNoTitle = `<roleplay title="" data-line="21">
    <p>Victory!</p>
</roleplay>`;

data.roleplayTitleIcons = `<roleplay title="Title with :roll:, :rune_alpha:" data-line="21">
    <p>Victory!</p>
</roleplay>`;

data.roleplayTitleIconsId = `<roleplay title="Title with :roll:, :rune_alpha:" id="id" data-line="21">
    <p>Victory!</p>
</roleplay>`;

data.roleplayWithID = `<roleplay title="Title" id="testid123" data-line="21">
    <p>hi</p>
</roleplay>`;

data.badJSONLog = `ERROR L3:
failed to parse bulleted line (check your JSON)
URL: 412

ERROR L3:
lines within combat block must be events or enemies, not freestanding text
URL: 416

ERROR L2:
found inner block of combat block without an event bullet
URL: 415

ERROR L0:
combat card must have "on win" event
URL: 417`;

data.combatNoEnemyOrEventsLog = `ERROR L0:
combat card has no enemies listed
URL: 414

ERROR L0:
combat card must have "on win" event
URL: 417

ERROR L0:
combat card must have "on lose" event
URL: 417`;

data.combatBadTierLog = `ERROR L2:
tier must be a positive number
URL: 418`;

data.badArtErr = `ERROR L5:
[art] should be on its own line
URL: 435`;

data.combatBadParseLog = `ERROR L0:
could not parse block header
URL: 413

ERROR L0:
combat card has no enemies listed
URL: 414

ERROR L0:
combat card must have "on win" event
URL: 417

ERROR L0:
combat card must have "on lose" event
URL: 417`;

data.badParseQuestAttrError = `ERROR L1:
invalid quest attribute line "minplayers1"
URL: 420`;

data.missingTitleErr = `ERROR L5:\nchoice missing title\nURL: 428`;

data.invalidChoiceStringErr = `ERROR L7:
failed to parse bulleted line (check your JSON)
URL: 412

ERROR L5:
roleplay blocks cannot contain indented sections that are not choices
URL: 411`;

export default data;
