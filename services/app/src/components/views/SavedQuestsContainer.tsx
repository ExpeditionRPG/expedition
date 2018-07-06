import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {previewQuest} from '../../actions/Quest';
import {AppState, SavedQuestMeta} from '../../reducers/StateTypes';
import SavedQuests, {SavedQuestsDispatchProps, SavedQuestsStateProps} from './SavedQuests';

const mapStateToProps = (state: AppState, ownProps: SavedQuestsStateProps): SavedQuestsStateProps => {
  return {
    saved: state.saved.list,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SavedQuestsDispatchProps => {
  return {
    onSelect(saved: SavedQuestMeta): void {
      dispatch(previewQuest({quest: saved.details, saveTS: saved.ts}));
    },
  };
};

const SavedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SavedQuests);

export default SavedQuestsContainer;
