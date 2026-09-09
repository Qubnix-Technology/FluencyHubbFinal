<?php
require_once __DIR__ . '/../config/database.php';require_once __DIR__ . '/../auth/middleware.php';require_admin($pdo);
$d=read_json_body();$id=(int)($d['student_id']??0);$email=trim($d['email']??'');$password=$d['password']??'';
if(!$id||!filter_var($email,FILTER_VALIDATE_EMAIL)) json_response(['success'=>false,'message'=>'A valid student and email are required.'],422);
$check=$pdo->prepare('SELECT id FROM teacher_students WHERE id=?');$check->execute([$id]);if(!$check->fetch())json_response(['success'=>false,'message'=>'Student not found.'],404);
$values=[$email,$id];$sql='UPDATE teacher_students SET email=?';if($password!==''){if(strlen($password)<8)json_response(['success'=>false,'message'=>'Password must contain at least 8 characters.'],422);$sql.=', password_hash=?';$values=[$email,password_hash($password,PASSWORD_DEFAULT),$id];}$sql.=' WHERE id=?';
try{$pdo->prepare($sql)->execute($values);json_response(['success'=>true,'message'=>'Student login credentials saved.']);}catch(PDOException $e){json_response(['success'=>false,'message'=>'This email is already in use.'],422);}
