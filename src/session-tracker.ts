import { Pocket } from '@pokt-network/pocket-js';
import { NPAPI } from './np-api';
import { POCKET_HEIGHT_ENDPOINT, REQUEST_TIMEOUT } from './constants';
import isError from 'lodash/isError';
import isNumber from 'lodash/isNumber';
import { NodeLauncherNode } from './interfaces';
import request from 'superagent';

export interface SessionStatus {
  id: string
  active: boolean
  start: string
  end: string
}

export class SessionTracker {

  _np: NPAPI;
  _pocket: Pocket|null;
  _logInfo: (message: string) => void;
  _logError: (err: string|Error) => void;
  _requestTimeout = REQUEST_TIMEOUT;
  _blockHeight = BigInt(0);
  _nodeSessionStarts: Map<string, bigint> = new Map();
  _nodeRelayCounts: Map<string, number> = new Map();
  _updateIntervalLength = 60000;
  updateInterval: any;

  constructor(np: NPAPI, pocket: Pocket|null, logInfo: (message: string) => void, logError: (message: string|Error) => void) {
    this._np = np;
    this._pocket = pocket;
    this._logInfo = logInfo;
    this._logError = logError;
  }

  async getBlockHeight(): Promise<bigint> {
    const defaultReturn = BigInt(0);
    try {
      if(this._pocket) {
        const res = await this._pocket.rpc()?.query.getHeight(this._requestTimeout);
        if(isError(res)) {
          throw res;
        } else if(res) {
          return res.height as bigint;
        } else {
          return defaultReturn;
        }
      } else if(POCKET_HEIGHT_ENDPOINT) {
        const { body } = await request
          .get(POCKET_HEIGHT_ENDPOINT)
          .timeout(REQUEST_TIMEOUT);
        if(body && body.height) {
          return BigInt(body.height);
        } else {
          return defaultReturn;
        }
      } else {
        return defaultReturn;
      }
    } catch(err) {
      this._logError(err);
      return defaultReturn;
    }
  }

  async getNodes(): Promise<NodeLauncherNode[]> {
    try {
      const res = await this._np.nodeGetAll();
      if(res.error)
        throw res.error;
      else
        return res.result ? res.result.filter(n => n.ticker === 'pokt') : [];
    } catch(err) {
      this._logError(err);
      return [];
    }
  }

  async getRelayCount(id: string): Promise<number> {
    try {
      const res = await this._np.poktGetPrometheusData(id);
      if(res.error) {
        throw res.error;
      } else {
        const output = res.result || '';
        const splitOutput = output
          .split('\n')
          .map(l => l.trim())
          .filter(l => !!l);
        const line = splitOutput.find(l => /^pocketcore_service_relay_count_for_all/.test(l));
        if(!line)
          return 0;
        const match = line.match(/\d+$/);
        if(!match)
          return 0;
        return Number(match);
      }
    } catch(err) {
      this._logError(err);
      return 0;
    }
  }

  async start(): Promise<void> {
    try {
      const { result = '' } = await this._np.npGetVersion();
      this._logInfo(`Connected to ${this._np.apiEndpoint}`);
      this._logInfo(`Running Node Pilot v${result}`);
      this.updateInterval = setInterval(() => {
        this.update()
          .catch(err => this._logError(err));
      }, this._updateIntervalLength);
      await this.update();
    } catch(err) {
      throw `Unable to connect to ${this._np.apiEndpoint}`;
    }
  }

  async update(): Promise<void> {
    try {
      const blockHeight = await this.getBlockHeight();
      if(blockHeight > this._blockHeight) {
        this._logInfo(`blockHeight ${blockHeight.toString()}`);
        this._blockHeight = blockHeight;
      }
      const nodes = await this.getNodes();
      for(const node of nodes) {
        const prevRelayCount = this._nodeRelayCounts.get(node.id);
        const relayCount = await this.getRelayCount(node.id);
        this._nodeRelayCounts.set(node.id, relayCount);
        const sessionStart = this._nodeSessionStarts.get(node.id);
        if(sessionStart) {
          if(blockHeight > sessionStart + BigInt(3)) {
            this._logInfo(`${node.id} has finished a session.`);
            this._nodeSessionStarts.delete(node.id);
          }
        } else if(isNumber(prevRelayCount)) {
          if(relayCount > prevRelayCount) {
            this._logInfo(`${node.id} has entered a session.`);
            this._nodeSessionStarts.set(node.id, blockHeight);
          }
        }
      }
    } catch(err) {
      this._logError(err);
    }
  }

  getStatus(id: string): SessionStatus {
    try {
      const sessionStart = this._nodeSessionStarts.get(id);
      const blockHeight = this._blockHeight;
      if(blockHeight && sessionStart && sessionStart + BigInt(4) > blockHeight) {
        return {
          id,
          active: true,
          start: sessionStart.toString(10),
          end: (sessionStart + BigInt(4)).toString(10),
        };
      } else {
        return {
          id,
          active: false,
          start: '',
          end: '',
        };
      }
    } catch(err) {
      this._logError(err);
      return {
        id,
        active: false,
        start: '',
        end: '',
      };
    }
  }

}
