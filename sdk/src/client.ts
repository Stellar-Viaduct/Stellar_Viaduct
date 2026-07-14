import * as StellarSdk from "@stellar/stellar-sdk";
import {
  StellarViaductConnectionError,
  StellarViaductQueryError,
  StellarViaductTransactionError,
} from "./errors";
import type {
  StellarViaductSdkConfig,
  EventSubscription,
  EventSubscriptionOptions,
  InvokeContractParams,
  QueryContractParams,
  SdkHealth,
} from "./types";

export class StellarViaductContractSdk {
  private readonly config: Required<StellarViaductSdkConfig>;
  private readonly server: StellarSdk.rpc.Server;
  private connected = false;

  constructor(config: StellarViaductSdkConfig) {
    this.config = {
      allowHttp: false,
      defaultFee: "100000",
      defaultTimeoutSeconds: 30,
      ...config,
    };

    this.server = new StellarSdk.rpc.Server(this.config.rpcUrl, {
      allowHttp: this.config.allowHttp,
