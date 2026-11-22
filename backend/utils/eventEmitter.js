import { EventEmitter } from 'events';

class AppEmitter extends EventEmitter {}

export const appEmitter = new AppEmitter();
// Prevent MaxListenersExceededWarning under concurrent download streaming
appEmitter.setMaxListeners(0);

export default appEmitter;
