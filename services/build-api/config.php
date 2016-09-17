<?php

function getenv_or_default($name, $default) {
    if (false === $value = getenv($name)) {
        return $default;
    }

    return $value;
}

return [
    'amqp' => [
        'host'     => getenv_or_default('AMQP_HOST', 'localhost'),
        'port'     => getenv_or_default('AMQP_PORT', 5672),
        'login'    => getenv_or_default('AMQP_USER', 'guest'),
        'password' => getenv_or_default('AMQP_PASS', 'guest'),
        'vhost'    => getenv_or_default('AMQP_VHOST', '/'),
    ],
    'mongo' => [
        'uri'      => getenv_or_default('MONGO_URI', 'mongodb://localhost:27017'),
        'database' => getenv_or_default('MONGO_DBNAME', 'builds'),
    ],
];
