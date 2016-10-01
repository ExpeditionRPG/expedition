import { connect } from 'react-redux'
import {ListCardType, ListItemType, AppState} from '../reducers/StateTypes'
import {changeSetting} from '../actions/settings'
import {toPrevious} from '../actions/card'
import {loadQuestXML} from '../actions/web'
import ListCard, {ListCardDispatchProps} from './base/ListCard'

const mapStateToProps = (state: AppState, ownProps: ListCardType): ListCardType => {
  return {
    title: "Featured Quests",
    hint: "Select a quest below to get started, or continue to browse online quests.",
    items: [
      {primaryText: 'Oust Albanus', secondaryText: 'Your party encounters a smelly situation.', value: 'quests/build/oust_albanus.xml'},
      {primaryText: 'Mistress Malaise', secondaryText: 'Mystery, Misfortune, and a Mistress.', value: 'quests/build/mistress_malaise.xml'},
      {primaryText: 'Browse Global Quests', secondaryText: 'See quests created by other adventurers around the world.', value: 'global'},
    ]
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ListCardDispatchProps => {
  return {
    onListSelect(item: ListItemType): void {
      if (item.value === 'global') {
        console.log('TODO: GLOBAL QUESTS');
        return;
      }
      dispatch(loadQuestXML(item.value));
    },
    onReturn(): void {
      dispatch(toPrevious());
    }
  };
}

const ListCardContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListCard);

export default ListCardContainer;