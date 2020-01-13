import { fromJS } from 'immutable';
import { cloneDeep, set, get } from 'lodash';

const initialWebhook = {
  name: null,
  url: null,
  headers: [{ key: '', value: '' }],
  events: [],
};

const initialState = fromJS({
  formErrors: {},
  initialWebhook: initialWebhook,
  modifiedWebhook: initialWebhook,
  triggerResponse: {},
  isTriggering: false,
});

const reducer = (state, action) => {
  switch (action.type) {
    case 'GET_DATA_SUCCEEDED': {
      const data = cloneDeep(action.data);
      const headers = get(data, 'headers');

      if (Object.keys(headers).length > 0) {
        const newHeaders = fromJS(
          Object.keys(headers).map(key => {
            return { key: key, value: headers[key] };
          })
        );
        set(data, ['headers'], newHeaders);
      } else {
        set(data, ['headers'], get(initialWebhook, 'headers'));
      }

      return state
        .update('initialWebhook', () => fromJS(data))
        .update('modifiedWebhook', () => fromJS(data));
    }
    case 'TRIGGER_SUCCEEDED':
      return state
        .update('triggerResponse', () => fromJS(action.response))
        .update('isTriggering', () => false);
    case 'ON_TRIGGER':
      return state.update('isTriggering', () => true);
    case 'ON_TRIGGER_CANCELED':
      return state
        .update('isTriggering', () => false)
        .update('triggerResponse', () => {});
    case 'ON_CHANGE':
      return state.updateIn(
        ['modifiedWebhook', ...action.keys],
        () => action.value
      );
    case 'ADD_NEW_HEADER':
      return state.updateIn(['modifiedWebhook', ...action.keys], arr =>
        arr.push(fromJS({ key: '', value: '' }))
      );
    case 'ON_HEADER_REMOVE': {
      if (action.event === 'remove') {
        return state.updateIn(['modifiedWebhook', 'headers'], headers =>
          headers.splice(action.index, 1)
        );
      } else {
        return state.updateIn(
          ['modifiedWebhook', 'headers', action.index],
          () => fromJS({ key: '', value: '' })
        );
      }
    }
    case 'RESET':
      return state.update('modifiedWebhook', () =>
        fromJS(state.get('initialWebhook'))
      );
    case 'SET_ERRORS':
      return state.update('formErrors', () => fromJS(action.errors));
    default:
      return state;
  }
};

export default reducer;
export { initialState };