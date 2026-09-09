<?php
function get_bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

function require_admin(PDO $pdo): array
{
    $token = get_bearer_token();
    if (!$token) {
        json_response(['success' => false, 'message' => 'Admin login required.'], 401);
    }

    $stmt = $pdo->prepare(
        'SELECT admin_users.id, admin_users.name, admin_users.email
         FROM admin_tokens
         INNER JOIN admin_users ON admin_tokens.admin_id = admin_users.id
         WHERE admin_tokens.token = ? AND admin_tokens.expires_at > NOW()
         LIMIT 1'
    );
    $stmt->execute([hash('sha256', $token)]);
    $admin = $stmt->fetch();

    if (!$admin) {
        json_response(['success' => false, 'message' => 'Invalid or expired admin session.'], 401);
    }

    return $admin;
}
