import Divider from '@material-ui/core/Divider';
import * as React from 'react';
import {Badge, BADGE_DESC} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {IUserFeedback, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
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
  getUserBadges: () => void;
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
    this.props.getUserBadges();
  }
  public renderUserFeedbacks(feedbacks: IUserFeedback[]) {
    if (feedbacks.length === 0) {
      return `You haven't submitted any feedback`;
    }
    return feedbacks.map((feedback) => {
      if (!feedback || !feedback.quest) {
        return;
      }
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

  public renderUserBadges(badges: Badge[]) {
    const results: JSX.Element[] = [];
    for (let i = 0; i < badges.length; i++) {
      results.push(<tr key={i}><td><img className="inline_icon" src={`images/${badges[i].toLowerCase()}_small.svg`} /> {BADGE_DESC[badges[i]]}</td></tr>);
    }

    if (results.length > 0) {
      results.unshift(<tr key="badges"><th>Badges:</th></tr>);
    }
    return results;
  }

  public render() {
    const {user, logoutUser, onReturn} = this.props;
    if (!user.loggedIn) {
      return <SearchContainer />;
    }
    if (user.feedbacks === undefined || user.badges === undefined) {
      return renderLoading(onReturn);
    }
    return (
      <Card title="Account">
        <div className="detailsCard">
          <table className="detailsTable">
            <tbody>
              {user.name && <tr><th>Name</th><td>{user.name}</td></tr>}
              <tr><th>Email</th><td>{user.email}</td></tr>
              <tr><th>Loot Points</th><td>{user.lootPoints || 'No points'}</td></tr>
              {this.renderUserBadges(user.badges || [])}
            </tbody>
          </table>
          <Button id="logout" onClick={logoutUser}>Log Out</Button>
          <br/>
          <br/>
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
