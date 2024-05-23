import moment from 'moment';
import Actions from '../constants/Actions';

const initialState = {
  producers: [],
  lastLeave: null,
  roomID: null,
  consumers: [],
  consumersTimestamp: null,
  peers: {},
  increment: 0,
  callIncrement: 0,
  callData: null,
  answerIncrement: 0,
  answerData: 0,
  lastLeaveType: 'leave',
  counterpart: null,
  closingState: false,
  closed: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.RTC_CLOSE:
      return {
        ...state,
        closingState: !state.closed,
      };
    case Actions.RTC_PRODUCER:
      return {
        ...state,
        producers: [...state.producers, action.data],
        closed: false,
      };
    case Actions.RTC_PRODUCERS:
      return {
        ...state,
        producers: [...state.producers, ...action.producers],
        closed: false,
      };
    case Actions.RTC_RESET_PRODUCERS:
      return {
        ...state,
        producers: [...action.producers],
        lastLeave: action.producerID || action.socketID,
        lastLeaveType: action.lastLeaveType || 'leave',
        increment: state.increment + 1,
      };
    case Actions.RTC_ROOM_ID:
      return {
        ...state,
        roomID: action.roomID,
        closed: false,
      };
    case Actions.RTC_CONSUMERS:
      if (state.consumersTimestamp && moment(state.consumersTimestamp).isAfter(moment(action.consumers.timestamp))) return state;
      return {
        ...state,
        consumers: action.consumers.content,
        peers: action.peers || state.peers,
        consumersTimestamp: action.consumers.timestamp,
        closed: false,
      };
    case Actions.RTC_NEW_PEER:
      return {
        ...state,
        peers: {
          ...state.peers,
          [action.data.socketID]: action.data,
        },
        closed: false,
      };
    case Actions.RTC_CALL:
      return {
        ...state,
        callIncrement: state.callIncrement + 1,
        callData: action.data,
        closed: false,
        closingState: false,
      };
    case Actions.RTC_ANSWER:
      return {
        ...state,
        answerIncrement: state.answerIncrement + 1,
        answerData: action.data,
        closed: false,
        closingState: false,
      };
    case Actions.RTC_SET_COUNTERPART:
      return {
        ...state,
        counterpart: action.counterpart,
        closed: false,
      };
    case Actions.RTC_LEAVE:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
