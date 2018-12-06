import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import {CONTENT_SET_FULL_NAMES} from '../../Constants';
import {ContentSetsType} from '../../reducers/StateTypes';

interface IExpansion {
  checked: boolean;
  value: string;
  disabled: boolean;
  label: string;
}

export interface IState {
  expansions: IExpansion[];
}

export interface IConnectProps {
  contentSets: Set<keyof ContentSetsType>;
  onChange: (values: string[]) => void;
  value: string[] | undefined;
}

const styles = {
  root: {
    'color': 'black',
    '&$checked': {
      color: 'black',
    },
  },
  checked: {},
};

interface IProps extends IConnectProps {
  classes: any;
}

class ExpansionCheckbox extends React.Component<IProps, {}> {
  public state: IState;
  constructor(props: IProps) {
    super(props);
    const expansions: IExpansion[] = [
      {
        checked: props.contentSets.has('horror'),
        value: 'horror',
        label: CONTENT_SET_FULL_NAMES.horror,
        disabled: !props.contentSets.has('horror'),
      },
      {
        checked: props.contentSets.has('future'),
        value: 'future',
        label: CONTENT_SET_FULL_NAMES.future,
        disabled: !props.contentSets.has('future'),
      },
    ];
    this.state = { expansions };
  }

  private changeSearchState(expansions: IExpansion[]) {
    const searchState = expansions.reduce((acc, expansion) => {
      if (!expansion.checked) {
        return acc;
      }
      return [...acc, expansion.value];
    }, []);
    this.props.onChange(searchState);
  }

  public componentDidMount() {
    this.changeSearchState(this.state.expansions);
  }

  private onChange(value: any) {
    const selectedExpansions = this.state.expansions.map((expansion) => {
      if (expansion.value === value) {
        expansion.checked = !expansion.checked;
      }
      return expansion;
    });
    this.changeSearchState(selectedExpansions);
    this.setState({ expansions: selectedExpansions });
  }

  public render() {
    return (
      <FormGroup row>
        {this.state.expansions.map((expansion) => {
          const label = `${expansion.label}${expansion.disabled ? ' (Enable this expansion in settings)' : ''}`;
          return <FormControlLabel
              key={expansion.value}
              control={
                <Checkbox
                  id={expansion.value}
                  disabled={expansion.disabled}
                  value={expansion.value}
                  checked={expansion.checked}
                  onChange={() => this.onChange(expansion.value)}
                  classes={{
                    root: this.props.classes.root,
                    checked: this.props.classes.checked,
                  }}
                />
              }
              label={label}
            />;
        })}
      </FormGroup>
    );
  }
}

export default withStyles(styles)(ExpansionCheckbox);
