<?php

require __DIR__.'/../vendor/autoload.php';

$config = require __DIR__.'/../config.php';
$debug  = getenv('DEBUG') === 'true';

(new Application($debug, $config))->run();
