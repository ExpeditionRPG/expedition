import { connect } from 'react-redux'
import {AppState, SearchSettings, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {toPrevious, toCard} from '../actions/card'
import {viewQuest} from '../actions/quest'
import {loadQuestXML, search} from '../actions/web'
import Search, {SearchStateProps, SearchDispatchProps} from './Search'
import {login} from '../actions/user'

const mapStateToProps = (state: AppState, ownProps: SearchStateProps): SearchStateProps => {
  return Object.assign({}, state.search, {phase: ownProps.phase, user: state.user, numPlayers: state.settings.numPlayers});
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SearchDispatchProps => {
  return {
    onLoginRequest: () => {
      dispatch(login(()=> {
        dispatch(toCard('SEARCH_CARD', 'SETTINGS'));
      }));
    },
    onSearch: (numPlayers: number, user: UserState, request: SearchSettings) => {
      dispatch(search(numPlayers, user, request));
    },
    onQuest: (quest: QuestDetails) => {
      dispatch(viewQuest(quest));
      dispatch(toCard('SEARCH_CARD', 'DETAILS'));
    },
    onPlay: (quest: QuestDetails) => {
      dispatch(loadQuestXML(quest.url));
    },
    onOwnedChange: (checked: boolean) => {
      console.log("TODO");
    }
  };
}

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer

/*
ready: function() {
        this.loggedIn = ExpeditionAPI.isLoggedIn();
        this.quests=[];
        this.userOwnedQuest = false;
        this.order = "-published";
        this.recency = "inf";
        this.FEATURED = [
          {
            xml_url: "quests/build/oust_albanus.xml",
            title: "Oust Albanus",
            summary: "Your party encounters a smelly situation.",
            author: "Scott Martin",
            email: "smartin015@gmail.com",
            play_period: this._formatPlayPeriod(20, 40),
            num_players: '2-4'
          },
          {
            xml_url: "quests/build/mistress_malaise.xml",
            title: "Mistress Malaise",
            summary: "Mystery, Misfortune, and a Mistress.",
            author: "Scott Martin",
            email: "smartin015@gmail.com",
            play_period: this._formatPlayPeriod(20, 40),
            num_players: '2-4'
          }
        ];
      },
      _onDefault: function() {
        this.$.disclaimer.close();
        this.$.pages.next('results');
        this.quests = this.FEATURED;
      },
      _onLogin: function() {
        ExpeditionAPI.login(function(locals) {
          this.loggedIn = ExpeditionAPI.isLoggedIn();
          console.log(locals);
          this.loading = true;
          this.$.disclaimer.close();
          this._onSearch();
        }.bind(this));
      },
      _onDialogClose: function() {
        console.log("herp");
        if (!ExpeditionAPI.isLoggedIn()) {
          console.log("Derp");
          this.showCommunity = false;
        }
      },
      _truncate: function(s, n) {
        return s.substr(0,n-1)+(s.length>n?'&hellip;':'');
      },
      _formatDate: function(rfcDateTime) {
        if (!rfcDateTime) {
          return "unknown";
        }
        return rfcDateTime.split('T')[0];
      },
      _formatPlayPeriod: function(minMinutes, maxMinutes) {
        if (minMinutes > 60 && maxMinutes > 60) {
          return Math.round(minMinutes / 60) + '-' + Math.round(maxMinutes / 60) + " hours";
        } else {
          return minMinutes + '-' + maxMinutes + " minutes";
        }
      },
      _formatAbnormalShareState: function(published, shared) {
        if (!published && !shared) {
          return "PRIVATE";
        }
        if (!published && shared) {
          return "UNLISTED";
        }
        return null;
      },
      _formattedQuest: function(quest) {
        return {
          id: quest.id,
          xml_url: quest.url,
          title: quest.meta_title,
          summary: quest.meta_summary,
          modified: this._formatDate(quest.modified),
          url: quest.meta_url,
          shorturl: this._truncate(quest.meta_url, 20),
          author: quest.meta_author,
          email: quest.meta_email,
          play_period: this._formatPlayPeriod(quest.meta_minTimeMinutes, quest.meta_maxTimeMinutes),
          num_players: quest.meta_minPlayers + '-' + quest.meta_maxPlayers,
          created: this._formatDate(quest.created),
          published: this._formatDate(quest.published),
          abnormal_share_state: this._formatAbnormalShareState(quest.published, quest.shared),
          reported: false,
          user_owned: Boolean(quest.user === ExpeditionAPI.getLoggedInUser())
        };
      },
      _onQuestTap: function(e) {
        var idx = e.currentTarget.dataset.target;
        this.quest = this.quests[idx];
        this.$.pages.next('details');
      },
      _onQuestPlay: function(e) {
        var quest = e.currentTarget.dataset.target;
        this.fire('quest-select', quest);
      },
      _onSearch: function() {
        if (!ExpeditionAPI.isLoggedIn()) {
          this.$.disclaimer.open();
          return;
        }
        var params = {};

        if (this.selfOwned) {
          params.owner = ExpeditionAPI.getLoggedInUser().id;
        }

        params.players = this.globals.adventurers;

        if (this.searchText) {
          params.search = this.searchText;
        }

        if (this.recency && this.recency !== "inf") {
          params.published_after = Math.floor(Date.now() / 1000) - parseInt(this.recency);
        }

        if (this.order) {
          params.order = this.order;
        }

        ExpeditionAPI.searchQuests(params, function(result) {
          if (result.error) {
            console.log(result.error);
          }
          this.loading = false;
          this.quests = result.quests.map(this._formattedQuest.bind(this));
          console.log(this.quests);
        }.bind(this));
        this.$.pages.next('results');
      },
      prev: function(e) {
        // TODO: Dedupe this across various elements.
        var p = Polymer.dom(e.srcElement).previousSibling;
        while (p.tagName !== "EXPEDITION-CARD") {
          p = p.previousSibling;
        }
        this.$.pages.prev(p.dataset.route);
        e.stopPropagation();
      },
      properties: {
        quest: Object,
        showCommunity: Boolean,
      }
      */