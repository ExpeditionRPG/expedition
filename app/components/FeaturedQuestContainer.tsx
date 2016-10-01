import { connect } from 'react-redux'
import {ListCardType, ListItemType, AppState} from '../reducers/StateTypes'
import {changeSetting} from '../actions/settings'
import {toPrevious} from '../actions/card'
import {loadQuestXML} from '../actions/web'
import ListCard, {ListCardDispatchProps} from './base/ListCard'

const mapStateToProps = (state: AppState, ownProps: ListCardType): ListCardType => {
  return {
    title: "Featured Quests",
    hint: "Select a quest below to get started, or use the top right menu to access full features.",
    items: [
      {primaryText: 'Oust Albanus', secondaryText: 'derp', value: 'quests/build/oust_albanus.xml'},
      {primaryText: 'Mistress Malaise', secondaryText: 'ghjk', value: 'quests/build/mistress_malaise.xml'},
    ]
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ListCardDispatchProps => {
  return {
    onListSelect(item: ListItemType): void {
      console.log(item.value);
      dispatch(loadQuestXML(item.value));
    },
    onReturn(): void {
      console.log("OnReturn");
      dispatch(toPrevious());
    }
  };
}

const ListCardContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListCard);

export default ListCardContainer;