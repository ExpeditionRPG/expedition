import {connect} from 'react-redux';
import Redux from 'redux';
import {toPrevious} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {AppState, SavedQuestMeta} from '../../reducers/StateTypes';
import SavedQuests, {DispatchProps, StateProps} from './SavedQuests';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    saved: state.saved.list,
    freeBytes: state.saved.freeBytes,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onSelect(saved: SavedQuestMeta): void {
      dispatch(previewQuest({quest: saved.details, saveTS: saved.ts}));
    },
    onReturn(): void {
      dispatch(toPrevious({}));
    },
  };
};

const SavedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SavedQuests);

export default SavedQuestsContainer;
