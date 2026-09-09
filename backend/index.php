<?php

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/response.php';


json_response([
    'success' => true,
    'message' => 'FluencyHubb API is running successfully.',
    'data' => [
        'version' => '1.0.0',
        'status' => 'active'
    ]
]);