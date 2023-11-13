/**
 * Copyright (c) 2023 Coinsnap
 * This file is open source and available under the MIT license.
 * See the LICENSE file for more info.
 *
 * Author: Coinsnap<dev@coinsnap.io>
 */

const { Component, Mixin, ApiService } = Shopware;
import template from "./btcpay-connection-button.html.twig";
import "./btcpay-connection-button.scss";

Component.register("coinsnap-btcpay-buttons", {
  template: template,
  inject: [["coinsnapBTCPayApiService"]],
  mixins: [Mixin.getByName("notification")],
  data() {
    return {
      isLoading: false,
      config: {
        "CoinsnapShopware.config.btcpayServerUrl": "",
      },
    };
  },
  methods: {
    generateAPIKey() {
      const systemConfig = ApiService.getByName("systemConfigApiService");

      const btcpayServerUrl = document.getElementById(
        "CoinsnapShopware.config.btcpayServerUrl",
      ).value;
      if (!btcpayServerUrl) {
        return this.createNotificationWarning({
          title: "BTCPay Server",
          message: this.$tc(
            "coinsnap-btcpay-generate-credentials.missing_server",
          ),
        });
      }
      const filteredUrl = this.removeTrailingSlash(btcpayServerUrl);
      this.config["CoinsnapShopware.config.btcpayServerUrl"] = filteredUrl;
      const clearedPathname = window.location.pathname.replace("/admin", "/");
      //TODO Find better solution
      const url =
        window.location.origin +
        clearedPathname +
        "api/_action/coinsnap/credentials";
      systemConfig.saveValues({
        "CoinsnapShopware.config.btcpayServerUrl":
          this.config["CoinsnapShopware.config.btcpayServerUrl"],
        "CoinsnapShopware.config.btcpayApiKey": "",
        "CoinsnapShopware.config.btcpayServerStoreId": "",
        "CoinsnapShopware.config.btcpayWebhookId": "",
        "CoinsnapShopware.config.btcpayWebhookSecret": "",
        "CoinsnapShopware.config.integrationStatus": false,
        "CoinsnapShopware.config.btcpayStorePaymentMethodBTC": false,
        "CoinsnapShopware.config.btcpayStorePaymentMethodLightning": false,
        "CoinsnapShopware.config.btcpayStorePaymentMethodMonero": false,
        "CoinsnapShopware.config.btcpayStorePaymentMethodLitecoin": false,
      });
      return window.open(
        filteredUrl +
        "/api-keys/authorize/?applicationName=CoinsnapShopwarePlugin&permissions=btcpay.store.cancreateinvoice&permissions=btcpay.store.canviewinvoices&permissions=btcpay.store.webhooks.canmodifywebhooks&permissions=btcpay.store.canviewstoresettings&selectiveStores=true&redirect=" +
        url,
        "_blank",
        "noopener",
      );
    },
    removeTrailingSlash(serverUrl) {
      return serverUrl.replace(/\/$/, "");
    },
    testConnection() {
      this.isLoading = true;
      if (!this.credentialsExist()) {
        this.isLoading = false;
        return this.createNotificationWarning({
          title: "BTCPay Server",
          message: this.$tc(
            "coinsnap-btcpay-test-connection.missing_credentials",
          ),
        });
      }
      this.coinsnapBTCPayApiService
        .verifyApiKey()
        .then((ApiResponse) => {
          if (ApiResponse.success === false) {
            this.createNotificationWarning({
              title: "BTCPay Server",
              message: ApiResponse.message,
            });
            this.isLoading = false;
            return;
          }
          this.createNotificationSuccess({
            title: "BTCPay Server",
            message: this.$tc("coinsnap-btcpay-test-connection.success"),
          });

          this.isLoading = false;
          window.location.reload();
        })
        .catch((e) => {
          this.isLoading = false;
          return this.createNotificationError({
            title: "BTCPay Server",
            message: this.$tc("coinsnap-btcpay-test-connection.error"),
          });
        });
    },
    credentialsExist() {
      if (
        document.getElementById("CoinsnapShopware.config.btcpayServerUrl")
          .value === "" ||
        document.getElementById("CoinsnapShopware.config.btcpayApiKey")
          .value === "" ||
        document.getElementById("CoinsnapShopware.config.btcpayServerStoreId")
          .value === ""
      ) {
        return false;
      }
      return true;
    },
  },
});
