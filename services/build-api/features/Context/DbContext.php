<?php

namespace Context;

use Knp\FriendlyContexts\Context\Context;

class DbContext extends Context
{
    /**
     * @BeforeScenario @reset-db
     */
    public function beforeScenario()
    {
        exec(sprintf('cd %s/../../../../ && make mongo-restore SERVICE=build-api', __DIR__));
    }
}
