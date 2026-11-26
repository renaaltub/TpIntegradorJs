<?php

return [
    'host' => getenv('SKINCORE_DB_HOST') ?: '127.0.0.1',
    'database' => getenv('SKINCORE_DB_NAME') ?: 'totem_skincare',
    'username' => getenv('SKINCORE_DB_USER') ?: 'root',
    'password' => getenv('SKINCORE_DB_PASSWORD') ?: '',
];
