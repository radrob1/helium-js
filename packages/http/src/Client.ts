import axios, { AxiosInstance } from 'axios'
import * as rax from 'retry-axios'
import qs from 'qs'
import Network from './Network'
import Transactions from './resources/Transactions'
import Blocks from './resources/Blocks'
import Accounts from './resources/Accounts'
import Hotspots from './resources/Hotspots'
import Challenges from './resources/Challenges'
import Stats from './resources/Stats'
import Vars from './resources/Vars'
import Oracle from './resources/Oracle'
import PendingTransactions from './resources/PendingTransactions'
import type Account from './models/Account'
import type Block from './models/Block'
import type Hotspot from './models/Hotspot'
import Elections from './resources/Elections'
import Cities from './resources/Cities'
import City from './models/City'
import Validators from './resources/Validators'
import Validator from './models/Validator'

interface AccountFromAddressFn {
  (address: string): Account
}

interface CityFromIdFn {
  (cityId: string): City
}

interface HotspotFromAddressFn {
  (address: string): Hotspot
}

interface ValidatorFromAddressFn {
  (address: string): Validator
}

interface BlockFromHeightOrHashFn {
  (heightOrHash: number | string): Block
}

interface Options {
  retry: number
}

export default class Client {
  public network!: Network

  public retry!: number

  private axios!: AxiosInstance

  constructor(network: Network = Network.production, options: Options = { retry: 5 }) {
    this.network = network
    this.axios = axios.create({
      baseURL: this.network.endpoint,
    })
    this.retry = options.retry
    if (this.retry > 0) {
      this.axios.defaults.raxConfig = {
        instance: this.axios,
        retry: this.retry,
        noResponseRetries: this.retry,
      }
      rax.attach(this.axios)
    }
  }

  public get accounts(): Accounts {
    return new Accounts(this)
  }

  public get account(): AccountFromAddressFn {
    return this.accounts.fromAddress.bind(this.accounts)
  }

  public get blocks(): Blocks {
    return new Blocks(this)
  }

  public get block(): BlockFromHeightOrHashFn {
    return this.blocks.fromHeightOrHash.bind(this.blocks)
  }

  public get transactions(): Transactions {
    return new Transactions(this)
  }

  public get hotspots(): Hotspots {
    return new Hotspots(this)
  }

  public get validators(): Validators {
    return new Validators(this)
  }

  public get elections(): Elections {
    return new Elections(this)
  }

  public get hotspot(): HotspotFromAddressFn {
    return this.hotspots.fromAddress.bind(this.hotspots)
  }

  public get validator(): ValidatorFromAddressFn {
    return this.validators.fromAddress.bind(this.validators)
  }

  public get challenges(): Challenges {
    return new Challenges(this)
  }

  public get pendingTransactions(): PendingTransactions {
    return new PendingTransactions(this)
  }

  public get stats(): Stats {
    return new Stats(this)
  }

  public get vars(): Vars {
    return new Vars(this)
  }

  public get oracle(): Oracle {
    return new Oracle(this)
  }

  public get cities(): Cities {
    return new Cities(this)
  }

  public get city(): CityFromIdFn {
    return this.cities.fromId.bind(this.cities)
  }

  async get(path: string, params: Object = {}) {
    const query = qs.stringify(params)
    const url = query.length > 0 ? [path, query].join('?') : path
    return this.axios.get(url)
  }

  async post(path: string, params: Object = {}) {
    return this.axios.post(path, params)
  }
}
