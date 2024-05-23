import { combineReducers } from 'redux';
import emoji from './emoji';
import io from './io';
import messages from './messages';
import rtc from './rtc';

export default combineReducers({
  emoji,
  io,
  messages,
  rtc,
});
