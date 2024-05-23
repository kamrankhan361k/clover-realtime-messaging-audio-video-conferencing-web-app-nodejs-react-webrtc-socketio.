import Actions from '../constants/Actions';

const initialState = {
  sheet: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_EMOJI:
      return {
        ...state,
        sheet: action.sheet,
      };
    default:
      return state;
  }
};

export default reducer;
