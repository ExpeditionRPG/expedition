import Redux from 'redux'
import {FiltersCalculate} from './Filters'
import {getStore} from '../Store'

declare var require: any;
const Tabletop = require('tabletop') as any;

export function DownloadCards(): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    dispatch(CardsLoading());
    Tabletop.init({
      key: getStore().getState().filters.source.current.split(':')[1],
      parseNumbers: true,
      simpleSheet: true,
      postProcess: (card: any) => {
        // TODO parse / validate / clean the object here. Use Joi? Expose validation errors to the user
        // Note: does not have access to sheet name
        return cleanCardData(card);
      },
      callback: (data: any, tabletop: any) => {
        // Turn into an array, remove commented out / hidden cards, attach sheet name
        let cards: any[] = [];
        const sheets = tabletop.sheets();
        Object.keys(sheets).sort().forEach((sheetName: string) => {
          cards = cards.concat(sheets[sheetName].elements.filter((card: any) => {
            return (card.Comment === '' || card.hide === '');
          }).map((card: any) => {
            card.sheet = sheetName;
            return card;
          }));
        });
        dispatch(CardsUpdate(cards));
        dispatch(CardsFilter(getStore().getState().filters));
        dispatch(FiltersCalculate(getStore().getState().cards.filtered));
      }
    });
  }
}

export interface CardsLoadingAction extends Redux.Action {
  type: 'CARDS_LOADING';
}

export function CardsLoading(): CardsLoadingAction {
  return {type: 'CARDS_LOADING'};
}

export interface CardsUpdateAction extends Redux.Action {
  type: 'CARDS_UPDATE';
  cards: any;
}

export function CardsUpdate(cards: any): CardsUpdateAction {
  return {type: 'CARDS_UPDATE', cards};
}

export interface CardsFilterAction extends Redux.Action {
  type: 'CARDS_FILTER';
  filters: any;
}

export function CardsFilter(filters: any): CardsFilterAction {
  return {type: 'CARDS_FILTER', filters};
}



function cleanCardData(card: any) {

  card.text = makeBold(card.text);
  card.abilitytext = makeBold(card.abilitytext);
  card.roll = makeBold(card.roll);

  // bold STATEMENTS:
  function makeBold (str: string) {
    return (str == null) ? str : str.replace(/(.*:)/g, (whole: string, capture: string) => `<strong>${capture}</strong>`);
  }

  Object.keys(card).forEach((property: string) => {

    if (card[property] === '-') { // remove '-' proprties
      card[property] = '';
    } else if (typeof card[property] === 'string') {
      // replace CSV line breaks with BR's - padded if:
          // above and below OR's
          // above start of <strong>
          // below end of </strong>
          // double line break in CSV (\n\n)
      // otherwise just a normal BR
      card[property] = card[property].replace(/(\n(<strong>))|((<\/strong>)\n)|(\n(OR)\n)|(\n\n)|(\n)/mg, (whole: string) => {
        if (whole.indexOf('<strong>') !== -1) {
          return '<br class="padded"/>' + whole;
        } else if (whole.indexOf('</strong>') !== -1) {
          return whole + '<br class="padded"/>';
        } else if (whole.indexOf('OR') !== -1) {
          return '<br class="padded"/>' + whole + '<br class="padded"/>';
        } else if (whole.indexOf('\n\n') !== -1) {
          return whole + '<br class="padded" />';
        } else {
          return whole + '<br />';
        }
      });

      // Expand &macro's
      card[property] = card[property].replace(/&[a-zA-Z0-9;]*/mg, (match: string) => {
        switch (match.substring(1)) {
          case 'crithit': return '#roll <span class="symbol">&ge;</span> 20';
          case 'hit': return '#roll <span class="symbol">&ge;</span> $risk';
          case 'miss': return '#roll <span class="symbol">&lt;</span> $risk';
          case 'critmiss': return '#roll <span class="symbol">&le;</span> 1';
          // >, <, etc
          case 'geq;': return '≥';
          case 'lt;': return '<';
          case 'leq;': return '≤';
          case 'gt;': return '>';
        }
        // throw "BROKEN MACRO: " + match.substring(1);
        return 'BROKEN MACRO: ' + match.substring(1);
      });
// This doesn't seem to be used any more?
//       // Replace $var with variable value
//       card[property] = card[property].replace(/\$\w*/mg, (match: string) => {
//         return card[match.substring(1)];
//       });
    }
    return card[property];
  });

  if (card.Effect) { // put ORs in divs ... possibly move into the above newline find and replace?
    card.Effect = card.Effect.replace(/OR<br \/>/g, () => {
      return '<div class="or"><span>OR</span></div>';
    });
  }

  return card;
}
