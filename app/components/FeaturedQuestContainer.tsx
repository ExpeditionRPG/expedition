import { connect } from 'react-redux'
import {ListCardType, ListItemType, AppState} from '../reducers/StateTypes'
import {toPrevious, toCard} from '../actions/card'
import {loadQuestXML} from '../actions/web'
import ListCard, {ListCardDispatchProps} from './base/ListCard'

const mapStateToProps = (state: AppState, ownProps: ListCardType): ListCardType => {
  return {
    title: "Featured Quests",
    hint: "Select a quest below to get started, or continue to browse online quests.",
    items: [
      {primaryText: 'Oust Albanus', secondaryText: 'Your party encounters a smelly situation.', value: 'quests/oust_albanus.xml'},
      {primaryText: 'Mistress Malaise', secondaryText: 'Mystery, Misfortune, and a Mistress.', value: 'quests/mistress_malaise.xml'},
      {primaryText: 'Browse Global Quests', secondaryText: 'See quests created by other adventurers around the world.', value: 'global'},
    ]
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ListCardDispatchProps => {
  return {
    onListSelect(item: ListItemType): void {
      if (item.value === 'global') {
        dispatch(toCard('SEARCH_CARD'));
        return;
      }
      dispatch(loadQuestXML(item.value));
    }
  };
}

const ListCardContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListCard);

export default ListCardContainer;