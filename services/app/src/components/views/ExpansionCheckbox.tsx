import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import * as React from 'react';
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

export interface IProps {
  contentSets: ContentSetsType;
  onChange: (values: string[]) => void;
  value: string[] | undefined;
}

export class ExpansionCheckbox extends React.Component<IProps, {}> {
  public state: IState;
  constructor(props: IProps) {
    super(props);
    const isHorror = this.props.contentSets.horror ? true : false;
    const isFuture = this.props.contentSets.future ? true : false;
    const expansions: IExpansion[] = [
      {
        checked: isHorror,
        value: 'horror',
        label: 'The Horror',
        disabled: !isHorror,
      },
      {
        checked: isFuture,
        value: 'future',
        label: 'The Future',
        disabled: !isFuture,
      },
    ];
    this.state = { expansions };
  }

  public changeSearchState(expansions: IExpansion[]) {
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

  public onChange(value: any) {
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
                />
              }
              label={label}
            />;
        })}
      </FormGroup>
    );
  }
}

export default ExpansionCheckbox;
