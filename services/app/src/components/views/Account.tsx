import Divider from '@material-ui/core/Divider';
import PowerSettingsNew from '@material-ui/icons/PowerSettingsNew';
import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {IUserFeedback, UserState} from '../../reducers/StateTypes';
import Card from '../base/Card';
import QuestButtonContainer from '../base/QuestButtonContainer';
import StarRating from '../base/StarRating';
import {renderLoading} from './Search';
import SearchContainer from './SearchContainer';

export interface IStateProps {
  user: UserState;
}

export interface IDispatchProps {
  logoutUser: () => void;
  getUserFeedBacks: () => void;
  onReturn: () => any;
  onQuestSelect: (quest: Quest) => void;
}

export interface IProps extends IStateProps, IDispatchProps {}

class Account extends React.Component<IProps, {}> {
  constructor(props: IProps) {
    super(props);
  }
  public componentDidMount() {
    this.props.getUserFeedBacks();
  }
  public renderUserFeedbacks(feedbacks: IUserFeedback[]) {
    if (feedbacks.length === 0) {
      return `You haven't submitted any feedback`;
    }
    return feedbacks.map((feedback) => {
      const quest = feedback.quest.details;
      return (
        <QuestButtonContainer key={quest.id} id={quest.id} summary={feedback.text} quest={quest} onClick={() => this.props.onQuestSelect(quest)}>
          <div className={`details ratingavg`}>
            <StarRating readOnly={true} value={feedback.rating} quantity={5}/>
          </div>
        </QuestButtonContainer>
      );
    });
  }
  public render() {
    const {user, logoutUser, onReturn} = this.props;
    if (!user.loggedIn) {
      return <SearchContainer />;
    }
    if (user.feedbacks === undefined) {
      return renderLoading(onReturn);
    }
    return (
      <Card title="Account">
        <div className="searchDetailsExtended">
          <div style={{ display: 'flex', justifyContent: 'space-between'}}>
            <h3>Account Info</h3>
            <PowerSettingsNew id="logout" onClick={logoutUser} />
          </div>
          <Divider/>
          <br/>
          <table className="searchDetailsTable">
            <tbody>
              <tr><th>Name</th><td>{user.name}</td></tr>
              <tr><th>Email</th><td>{user.email}</td></tr>
              <tr><th>Loot Points</th><td>{user.lootPoints || 'No points'}</td></tr>
            </tbody>
          </table>
          <br/>
          <br/>
          <Divider/>
          <h3>My Reviews</h3>
          <Divider/>
          <br/>
          {this.renderUserFeedbacks(user.feedbacks)}
        </div>
      </Card>
    );
  }
}

export default Account;
