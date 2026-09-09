<?php
require_once __DIR__ . '/../config/database.php';require_once __DIR__ . '/student_middleware.php';require_student($pdo);
$headers=getallheaders();$header=$headers['Authorization']??$headers['authorization']??$_SERVER['HTTP_AUTHORIZATION']??'';preg_match('/Bearer\s+(.+)/i',$header,$m);$pdo->prepare('DELETE FROM student_tokens WHERE token=?')->execute([hash('sha256',trim($m[1]))]);json_response(['success'=>true]);
