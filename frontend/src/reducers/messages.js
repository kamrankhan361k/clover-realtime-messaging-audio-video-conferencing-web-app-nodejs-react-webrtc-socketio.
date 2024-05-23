import Actions from '../constants/Actions';

const initialState = {
  roomsWithNewMessages: [],
  typing: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_TYPING:
      return {
        ...state,
        typing: action.typing,
      };
    case Actions.MESSAGES_ADD_ROOM_UNREAD:
      return {
        ...state,
        roomsWithNewMessages: [...state.roomsWithNewMessages, action.roomID],
      };
    case Actions.MESSAGES_REMOVE_ROOM_UNREAD:
      return {
        ...state,
        roomsWithNewMessages: state.roomsWithNewMessages.filter((r) => r !== action.roomID),
      };
    default:
      return state;
  }
};

export default reducer;
