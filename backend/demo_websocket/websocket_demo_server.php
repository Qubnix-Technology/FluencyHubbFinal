<?php
/**
 * Standalone Pure PHP WebSocket Demo Server
 * Protocol: RFC 6455
 * Run: php websocket_demo_server.php
 */

$host = '127.0.0.1';
$port = 8085;

$server = stream_socket_server("tcp://{$host}:{$port}", $errno, $errstr);
if (!$server) {
    die("Error starting server: {$errstr} ({$errno})\n");
}

echo "===================================================\n";
echo " FluencyHub Pure PHP WebSocket Demo Server Started\n";
echo " Listening on: ws://{$host}:{$port}\n";
echo " Press Ctrl+C to stop.\n";
echo "===================================================\n";

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
        fwrite($client, $upgrade);
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
    $unmaskedPayload = '';
    $decodedData = [];

    $firstByteBinary = sprintf('%08b', ord($data[0]));
    $secondByteBinary = sprintf('%08b', ord($data[1]));
    $opcode = bindec(substr($firstByteBinary, 4, 4));
    $isMasked = $secondByteBinary[0] == '1';
    $payloadLength = ord($data[1]) & 127;

    // Opcode 8: close connection
    if ($opcode === 8) {
        return ['type' => 'close', 'payload' => ''];
    }

    // Opcode 9: ping
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

function broadcast($clients, $message, $excludeId = null) {
    $encoded = ws_encode($message);
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

    // Wait for activity on sockets
    if (stream_select($read, $write, $except, 1) < 1) {
        continue;
    }

    // New client connection
    if (in_array($server, $read)) {
        $newClient = stream_socket_accept($server);
        if ($newClient) {
            $id = (int)$newClient;
            $clients[$id] = $newClient;
            $handshakes[$id] = false;
            echo "[Connect] Client #{$id} connected from " . stream_socket_get_name($newClient, true) . "\n";
        }
        unset($read[array_search($server, $read)]);
    }

    // Existing clients communication
    foreach ($read as $client) {
        $id = (int)$client;
        $data = @fread($client, 4096);

        if ($data === false || strlen($data) === 0) {
            // Disconnected
            echo "[Disconnect] Client #{$id} disconnected\n";
            unset($clients[$id], $handshakes[$id]);
            @fclose($client);
            $leaveMsg = json_encode([
                'type' => 'system',
                'text' => "User #{$id} left the chat.",
                'online_count' => count($clients),
                'time' => date('h:i A')
            ]);
            broadcast($clients, $leaveMsg);
            continue;
        }

        // Perform WebSocket handshake if not done yet
        if (!$handshakes[$id]) {
            if (ws_handshake($client, $data)) {
                $handshakes[$id] = true;
                echo "[Handshake] Handshake completed with Client #{$id}\n";
                
                // Welcome message to this client
                $welcome = json_encode([
                    'type' => 'system',
                    'text' => "Connected to Pure PHP WebSocket server! (You are User #{$id})",
                    'online_count' => count($clients),
                    'time' => date('h:i A')
                ]);
                @fwrite($client, ws_encode($welcome));

                // Broadcast join to others
                $joinMsg = json_encode([
                    'type' => 'system',
                    'text' => "User #{$id} joined the room.",
                    'online_count' => count($clients),
                    'time' => date('h:i A')
                ]);
                broadcast($clients, $joinMsg, $id);
            }
            continue;
        }

        // Process message frame
        $frame = ws_decode($data);
        if ($frame['type'] === 'close') {
            echo "[Close] Client #{$id} requested close\n";
            unset($clients[$id], $handshakes[$id]);
            @fclose($client);
            $leaveMsg = json_encode([
                'type' => 'system',
                'text' => "User #{$id} left the chat.",
                'online_count' => count($clients),
                'time' => date('h:i A')
            ]);
            broadcast($clients, $leaveMsg);
            continue;
        }

        if ($frame['type'] === 'text' && !empty($frame['payload'])) {
            $incoming = json_decode($frame['payload'], true);
            $senderName = $incoming['sender'] ?? "User #{$id}";
            $role = $incoming['role'] ?? "Student";
            $messageText = $incoming['message'] ?? $frame['payload'];

            echo "[Message] {$senderName} ({$role}): {$messageText}\n";

            $outPacket = json_encode([
                'type' => 'chat',
                'clientId' => $id,
                'sender' => $senderName,
                'role' => $role,
                'message' => $messageText,
                'time' => date('h:i A')
            ]);

            // Broadcast to all clients instantly
            broadcast($clients, $outPacket);
        }
    }
}
