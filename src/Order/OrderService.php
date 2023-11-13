<?php

declare(strict_types=1);

/**
 * Copyright (c) 2023 Coinsnap
 * This file is open source and available under the MIT license.
 * See the LICENSE file for more info.
 *
 * Author: Coinsnap<dev@coinsnap.io>
 */

namespace Coinsnap\Shopware\Order;

use Coinsnap\Shopware\Client\ClientInterface;
use Coinsnap\Shopware\Configuration\ConfigurationService;

class OrderService
{
    private ClientInterface $client;
    private ConfigurationService $configurationService;

    public function __construct(ClientInterface $client, ConfigurationService $configurationService)
    {
        $this->client = $client;
        $this->configurationService = $configurationService;
    }

    public function invoiceIsFullyPaid(string $invoiceId): bool
    {

        $uri = '/api/v1/stores/' . $this->configurationService->getSetting('btcpayServerStoreId') . '/invoices/' . $invoiceId;
        $response = $this->client->sendGetRequest($uri);
        if ($response['status'] !== 'Settled') {
            return false;
        }
        return true;
    }
}
