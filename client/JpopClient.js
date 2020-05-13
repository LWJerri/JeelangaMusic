'use script';
const WebSocket = require('ws');
const EventEmitter = require('events');

/**
 * Jpop broadcast client
 */
class JpopClient extends EventEmitter {
  /**
   * Construction
   */
  constructor() {
    super();
    this.heartbeatInterval;
    this.ws;
  };
  /**
   * Send message with interval
   * @param {Number} interval - interval in ms
   */
  heartbeat(interval) {
    this.heartbeatInterval = setInterval(() => {
      this.ws.send(JSON.stringify({op: 9}));
    }, interval);
  };
  /**
   * Connecto to jpop gateway
   */
  connect() {
    this.ws = new WebSocket('wss://listen.moe/gateway_v2');
    this.ws.onopen = () => {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      this.emit('open');
    };

    this.ws.onmessage = (message) => {
      if (!message.data.length) return;
      let response;
      try {
        response = JSON.parse(message.data);
      } catch (error) {
        return;
      }
      switch (response.op) {
        case 0:
          this.ws.send(JSON.stringify({op: 9}));
          this.heartbeat(response.d.heartbeat);
          break;
        case 1:
          if (response.t !== 'TRACK_UPDATE' &&
          response.t !== 'TRACK_UPDATE_REQUEST' &&
          response.t !== 'QUEUE_UPDATE' &&
          response.t !== 'NOTIFICATION') break;
          // console.log(response.d); // Do something with the data
          this.emit('event', response.d);
          break;
        default:
          break;
      }
    };

    this.ws.onclose = (error) => {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      };
      this.emit('close');
      setTimeout(() => this.connect(), 5000);
    };
  };
};

module.exports = JpopClient;
