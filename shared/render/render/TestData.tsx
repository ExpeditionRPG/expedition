const data = Object();

data.genericRoleplayXML = `<roleplay title="" data-line="0">
</roleplay>`;

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

data.fullRoleplayXML = `<roleplay title="Title" data-line="0">
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

data.roleplayConditionalChoiceXML = `<roleplay title="Title" data-line="0">
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

data.roleplayChoiceNoParse = `<roleplay title="Title" data-line="5">
    <p>text</p>
    <p></p>
</roleplay>`;

data.roleplayChoiceNoTitle = `<roleplay title="Title" data-line="5">
    <p>text</p>
    <choice text="" if="test1">
        <roleplay data-line="7">
            <p>choice text</p>
        </roleplay>
    </choice>
</roleplay>`;

data.roleplayNoTitle = `<roleplay title="" data-line="21">
    <p>Victory!</p>
</roleplay>`;

data.roleplayTitleIcons = `<roleplay title="Title with :roll:, :rune_alpha:" data-line="21">
    <p>Victory!</p>
</roleplay>`;

data.roleplayTitleIconsId = `<roleplay id="id" title="Title with :roll:, :rune_alpha:" data-line="21">
    <p>Victory!</p>
</roleplay>`;

data.roleplayWithID = `<roleplay id="testid123" title="Title" data-line="21">
    <p>hi</p>
</roleplay>`;

data.badJSONLog = `ERROR L2:
failed to parse bulleted line (check your JSON)
URL: 412

ERROR L0:
combat cannot contain indented sections that are not choices/events
URL: 411

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

data.combatBadTierLog = `ERROR L0:
enemy tier must be a positive number
URL: 418`;

data.combatBadWhitespace = `ERROR L3:
need whitespace between list and next section
URL: 420

ERROR L0:
combat cannot contain indented sections that are not choices/events
URL: 411

ERROR L0:
combat card must have "on win" event
URL: 417`;

data.combatBadParseLog = `ERROR L0:
could not parse card header
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

data.combatOrphanedInnerBlockLog = `ERROR L0:
combat cannot contain indented sections that are not choices/events
URL: 411

ERROR L0:
combat card must have "on win" event
URL: 417

ERROR L0:
combat card must have "on lose" event
URL: 417`;

data.combatFreestandingTextLog = `ERROR L0:
lines within combat card must be events or enemies, not freestanding text
URL: 416`;

data.combatBadEnemyJSONLog = `ERROR L0:
failed to parse bulleted line (check your JSON)
URL: 412`;

data.triggerIndentedSectionLog = `ERROR L0:
trigger found with indented section - check your starting whitespace
URL: 415`;

data.triggerBadParseLog = `ERROR L0:
could not parse trigger
URL: 410`;

data.deprecatedQuestAttrsLog = `ERROR L1:
Quest attributes have migrated to the "Publish" button - simply delete this line.
URL: 429

ERROR L2:
Quest attributes have migrated to the "Publish" button - simply delete this line.
URL: 429`;

data.missingGotoTargetLog = `ERROR L7:
goto "nowhere" does not match any card IDs (check your spelling)
URL: 426`;

data.noQuestBlocksLog = `ERROR L0:
no quest blocks found
URL: 422`;

data.noQuestHeaderLog = `ERROR L0:
root card must be a quest header
URL: 421`;

data.unrenderedBlockLog = `INTERNAL L0:
Unrendered block found in finalize step
URL: 504`;

data.badParseQuestAttrError = `ERROR L1:
invalid quest attribute line "minplayers1"
URL: 420`;

data.missingTitleErr = `ERROR L5:\nchoice/event missing title\nURL: 428`;

data.invalidChoiceStringErr = `ERROR L7:
failed to parse bulleted line (check your JSON)
URL: 412

ERROR L5:
roleplay cannot contain indented sections that are not choices/events
URL: 411`;

export default data;
