<?php
function chat_actor(PDO $pdo): array {
    $h=getallheaders();$header=$h['Authorization']??$h['authorization']??$_SERVER['HTTP_AUTHORIZATION']??'';
    if(!preg_match('/Bearer\s+(.+)/i',$header,$m)) json_response(['success'=>false,'message'=>'Login required.'],401);
    $token=hash('sha256',trim($m[1]));
    foreach ([['admin','admin_tokens','admin_id','admin_users','name'],['teacher','teacher_tokens','teacher_id','teachers','name'],['student','student_tokens','student_id','teacher_students','student_name']] as $s) {
        [$role,$tokens,$idcol,$users,$namecol]=$s;
        $q=$pdo->prepare("SELECT u.id,u.$namecol name FROM $tokens t JOIN $users u ON u.id=t.$idcol WHERE t.token=? AND t.expires_at>NOW() LIMIT 1");$q->execute([$token]);$u=$q->fetch();
        if($u)return ['role'=>$role,'id'=>(int)$u['id'],'name'=>$u['name']];
    } json_response(['success'=>false,'message'=>'Invalid or expired session.'],401);
}
function chat_target_allowed(PDO $pdo,array $actor,string $role,int $id):void{
    if(!in_array($role,['admin','teacher','student'],true)||$id<1)json_response(['success'=>false,'message'=>'Invalid conversation.'],422);
    if($actor['role']==='admin')return;
    if($role==='admin')return;
    if($actor['role']==='teacher'&&$role==='student'){$q=$pdo->prepare('SELECT 1 FROM teacher_students WHERE id=? AND teacher_id=?');$q->execute([$id,$actor['id']]);if($q->fetch())return;}
    if($actor['role']==='student'&&$role==='teacher'){$q=$pdo->prepare('SELECT 1 FROM teacher_students WHERE id=? AND teacher_id=?');$q->execute([$actor['id'],$id]);if($q->fetch())return;}
    json_response(['success'=>false,'message'=>'You do not have access to this conversation.'],403);
}
function chat_name(PDO $pdo,string $role,int $id):?string{$t=['admin'=>['admin_users','name'],'teacher'=>['teachers','name'],'student'=>['teacher_students','student_name']][$role]??null;if(!$t)return null;$q=$pdo->prepare("SELECT {$t[1]} FROM {$t[0]} WHERE id=?");$q->execute([$id]);return $q->fetchColumn()?:null;}
