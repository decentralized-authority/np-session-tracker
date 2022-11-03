import { SuperAgentStatic } from 'superagent';
import { REQUEST_TIMEOUT } from './constants';
import {
  NodeGetAllJsonRpcResponse,
  NPGetVersionJsonRpcResponse,
  PoktGetPrometheusDataJsonRpcResponse,
} from './interfaces';

export class NPAPI {

  apiEndpoint: string;
  _request: SuperAgentStatic;
  _timeout = REQUEST_TIMEOUT;

  constructor(apiEndpoint: string, request: SuperAgentStatic) {
    this.apiEndpoint = apiEndpoint;
    this._request = request;
  }

  async _makeRequest(method: string, params: any): Promise<any> {
    const { body } = await this._request
      .post(this.apiEndpoint + '/v1')
      .type('application/json')
      .timeout(this._timeout)
      .send({
        id: 1,
        jsonrpc: '2.0',
        method,
        params,
      });
    return body;
  }

  async npGetVersion(): Promise<NPGetVersionJsonRpcResponse> {
    const res = await this._makeRequest('np_getVersion', {});
    if(res.error) {
      console.log('np_getVersion');
      return {
        error: res.error,
      };
    } else {
      return {
        result: res.result,
      };
    }
  }

  async nodeGetAll(): Promise<NodeGetAllJsonRpcResponse> {
    const res = await this._makeRequest('node_getAll', {});
    if(res.error) {
      console.log('node_getAll');
      return {
        error: res.error,
      };
    } else {
      return {
        result: res.result,
      };
    }
  }

  async poktGetPrometheusData(id: string): Promise<PoktGetPrometheusDataJsonRpcResponse> {
    const res = await this._makeRequest('pokt_getPrometheusData', {
      id,
    });
    if(res.error) {
      console.log('pokt_getPrometheusData');
      return {
        error: res.error,
      };
    } else {
      return {
        result: res.result,
      };
    }
  }

}
