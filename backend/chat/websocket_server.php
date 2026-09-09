<?php
/**
 * FluencyHub Live WebSocket Server (RFC 6455)
 * Pure PHP WebSocket Daemon
 *
 * Listens for:
 * 1. Browser WebSocket clients connecting from Student / Teacher / Admin portals
 * 2. HTTP POST notification triggers from class_send.php and class_delete.php to broadcast updates
 *
 * Port: 8085
 */

error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_errors', 1);
date_default_timezone_set('Asia/Kolkata');

$host = '127.0.0.1';
$port = 8085;

$server = @stream_socket_server("tcp://{$host}:{$port}", $errno, $errstr);
if (!$server) {
    die("Unable to bind server on {$host}:{$port} - {$errstr} ({$errno})\n");
}

echo "=========================================================\n";
echo " FluencyHub Live Pure PHP WebSocket Server Running\n";
echo " Port: {$port} (ws://{$host}:{$port})\n";
echo "=========================================================\n";

$clients = [];
$handshakes = [];

function ws_handshake($client, $headers) {
    if (preg_match("/Sec-WebSocket-Key: (.*)\r\n/i", $headers, $match)) {
        $key = trim($match[1]);
        $accept = base64_encode(pack('H*', sha1($key . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
        $upgrade = "HTTP/1.1 101 Switching Protocols\r\n" .
                   "Upgrade: websocket\r\n" .
                   "Connection: Upgrade\r\n" .
                   "Sec-WebSocket-Accept: {$accept}\r\n\r\n";
        @fwrite($client, $upgrade);
        return true;
    }
    return false;
}

function ws_encode($payload, $type = 'text', $masked = false) {
    $frameHead = [];
    $payloadLength = strlen($payload);

    switch ($type) {
        case 'text':
            $frameHead[0] = 129;
            break;
        case 'close':
            $frameHead[0] = 136;
            break;
        case 'ping':
            $frameHead[0] = 137;
            break;
        case 'pong':
            $frameHead[0] = 138;
            break;
    }

    if ($payloadLength > 65535) {
        $payloadLengthBin = str_split(sprintf('%064b', $payloadLength), 8);
        $frameHead[1] = ($masked === true) ? 255 : 127;
        for ($i = 0; $i < 8; $i++) {
            $frameHead[$i + 2] = bindec($payloadLengthBin[$i]);
        }
        if ($frameHead[2] > 127) {
            return false;
        }
    } elseif ($payloadLength > 125) {
        $payloadLengthBin = str_split(sprintf('%016b', $payloadLength), 8);
        $frameHead[1] = ($masked === true) ? 254 : 126;
        $frameHead[2] = bindec($payloadLengthBin[0]);
        $frameHead[3] = bindec($payloadLengthBin[1]);
    } else {
        $frameHead[1] = ($masked === true) ? $payloadLength + 128 : $payloadLength;
    }

    foreach (array_keys($frameHead) as $i) {
        $frameHead[$i] = chr($frameHead[$i]);
    }

    $mask = [];
    if ($masked === true) {
        for ($i = 0; $i < 4; $i++) {
            $mask[$i] = chr(rand(0, 255));
        }
        $frameHead = array_merge($frameHead, $mask);
    }
    $frame = implode('', $frameHead);

    for ($i = 0; $i < $payloadLength; $i++) {
        $frame .= ($masked === true) ? $payload[$i] ^ $mask[$i % 4] : $payload[$i];
    }

    return $frame;
}

function ws_decode($data) {
    if (strlen($data) < 2) {
        return ['type' => 'error', 'payload' => ''];
    }

    $firstByteBinary = sprintf('%08b', ord($data[0]));
    $secondByteBinary = sprintf('%08b', ord($data[1]));
    $opcode = bindec(substr($firstByteBinary, 4, 4));
    $isMasked = $secondByteBinary[0] == '1';
    $payloadLength = ord($data[1]) & 127;

    if ($opcode === 8) {
        return ['type' => 'close', 'payload' => ''];
    }
    if ($opcode === 9) {
        return ['type' => 'ping', 'payload' => ''];
    }

    $maskOffset = 2;
    if ($payloadLength === 126) {
        $maskOffset = 4;
    } elseif ($payloadLength === 127) {
        $maskOffset = 10;
    }

    if ($isMasked) {
        $mask = substr($data, $maskOffset, 4);
        $payloadOffset = $maskOffset + 4;
        $dataLength = strlen($data);
        $unmaskedPayload = '';
        for ($i = $payloadOffset; $i < $dataLength; $i++) {
            $j = $i - $payloadOffset;
            $unmaskedPayload .= $data[$i] ^ $mask[$j % 4];
        }
    } else {
        $payloadOffset = $maskOffset;
        $unmaskedPayload = substr($data, $payloadOffset);
    }

    return ['type' => 'text', 'payload' => $unmaskedPayload];
}

function broadcast_event($clients, $dataObj, $excludeId = null) {
    $json = json_encode($dataObj);
    $encoded = ws_encode($json);
    foreach ($clients as $id => $client) {
        if ($excludeId !== null && $id === $excludeId) {
            continue;
        }
        @fwrite($client, $encoded);
    }
}

while (true) {
    $read = array_merge([$server], array_values($clients));
    $write = null;
    $except = null;

    if (@stream_select($read, $write, $except, 1) < 1) {
        continue;
    }

    // New connection
    if (in_array($server, $read)) {
        $newClient = @stream_socket_accept($server);
        if ($newClient) {
            $id = (int)$newClient;
            $clients[$id] = $newClient;
            $handshakes[$id] = false;
        }
        unset($read[array_search($server, $read)]);
    }

    foreach ($read as $client) {
        $id = (int)$client;
        $data = @fread($client, 65536);

        if ($data === false || strlen($data) === 0) {
            unset($clients[$id], $handshakes[$id]);
            @fclose($client);
            continue;
        }

        // Check if it is an HTTP trigger from backend (e.g. POST /publish)
        if (!$handshakes[$id] && strpos($data, 'POST /publish') === 0) {
            $bodyPos = strpos($data, "\r\n\r\n");
            if ($bodyPos !== false) {
                $body = substr($data, $bodyPos + 4);
                $eventData = json_decode($body, true);
                if ($eventData) {
                    broadcast_event($clients, $eventData);
                }
            }
            $httpResp = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nConnection: close\r\n\r\n{\"ok\":true}";
            @fwrite($client, $httpResp);
            @fclose($client);
            unset($clients[$id], $handshakes[$id]);
            continue;
        }

        // Standard WebSocket handshake
        if (!$handshakes[$id]) {
            if (ws_handshake($client, $data)) {
                $handshakes[$id] = true;
                // Welcome packet
                $welcome = [
                    'type' => 'connected',
                    'online_clients' => count($clients),
                    'server_time' => date('Y-m-d H:i:s')
                ];
                @fwrite($client, ws_encode(json_encode($welcome)));
            }
            continue;
        }

        // WebSocket frames from browser
        $frame = ws_decode($data);
        if ($frame['type'] === 'close') {
            unset($clients[$id], $handshakes[$id]);
            @fclose($client);
            continue;
        }

        if ($frame['type'] === 'ping') {
            @fwrite($client, ws_encode('', 'pong'));
            continue;
        }

        if ($frame['type'] === 'text' && !empty($frame['payload'])) {
            $incoming = json_decode($frame['payload'], true);
            if (is_array($incoming)) {
                // Broadcast to all active chat clients in real-time
                broadcast_event($clients, $incoming);
            }
        }
    }
}
