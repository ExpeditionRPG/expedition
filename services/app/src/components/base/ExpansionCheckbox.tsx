import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import {ALL_CONTENT_SETS, CONTENT_SET_FULL_NAMES, Expansion} from '../../Constants';
import {ContentSetsType} from '../../reducers/StateTypes';

interface ExpansionCheck {
  checked: boolean;
  value: Expansion;
  disabled: boolean;
}

export interface IConnectProps {
  contentSets: Set<keyof ContentSetsType>;
  onChange: (values: string[]) => void;
  value: string[];
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

interface Props extends IConnectProps {
  classes: any;
}

class ExpansionCheckbox extends React.Component<Props, {}> {

  public componentDidMount() {
    // Default to all supported expansions checked
    // Done in a timer so as to not interrupt event/transition loops.
    setTimeout(() => {
      this.props.onChange([...this.props.contentSets]);
    }, 0);
  }

  private onChange(expansions: ExpansionCheck[], value: any) {
    const selected: string[] = expansions.map((expansion) => {
      if (expansion.value === value) {
        expansion.checked = !expansion.checked;
      }
      return (expansion.checked) ? expansion.value : '';
    }).filter((e) => e !== '');
    this.props.onChange(selected);
  }

  public render() {
    const expansions: ExpansionCheck[] = ALL_CONTENT_SETS.map((cs: Expansion) => {
      return {
        value: cs,
        checked: (this.props.value.indexOf(cs) !== -1),
        disabled: !this.props.contentSets.has(cs),
      };
    });

    return (
      <FormGroup row>
        {expansions.map((expansion: ExpansionCheck) => {
          const label = `${CONTENT_SET_FULL_NAMES[expansion.value]}${expansion.disabled ? ' (Enable this expansion in settings)' : ''}`;
          return <FormControlLabel
              key={expansion.value}
              control={
                <Checkbox
                  id={expansion.value}
                  disabled={expansion.disabled}
                  value={expansion.value}
                  checked={expansion.checked}
                  onChange={() => this.onChange(expansions, expansion.value)}
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
