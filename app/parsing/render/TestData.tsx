
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

data.roleplayNoTitle = `<roleplay title="">
    <p>Victory!</p>
</roleplay>`

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

export default data;