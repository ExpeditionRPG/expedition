import {numPlayers} from 'app/actions/Settings';
import {connect} from 'react-redux';
import Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {toCard, toPrevious} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {search} from '../../actions/Search';
import {getContentSets} from '../../actions/Settings';
import {NAV_CARDS} from '../../Constants';
import {AppStateWithHistory, CardName, SearchParams, SettingsType} from '../../reducers/StateTypes';
import {ParserNode} from './quest/cardtemplates/TemplateTypes';
import Search, {DispatchProps, StateProps} from './Search';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    ...state.search,
    players: numPlayers(state.settings, state.multiplayer),
    settings: state.settings,
    user: state.user,
    contentSets: getContentSets(state.settings, state.multiplayer),
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onSearch: (params: SearchParams, players: number, settings: SettingsType) => {
      // 10/14/18 Timeout prevents bug with CSSTransition when dispatching
      // DOM change as part of componentDidMount
      setTimeout(() => {
        dispatch(search({params, players, settings}));
      }, 1);
    },
    toCard: (name: CardName) => {
      dispatch(toCard({name}));
    },
    onQuest: (quest: Quest) => {
      dispatch(previewQuest({quest}));
    },
    onReturn(): void {
      dispatch(toPrevious({
        matchFn: (c: CardName, n: ParserNode) => NAV_CARDS.indexOf(c) === -1,
      }));
    },
  };
};

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer;
