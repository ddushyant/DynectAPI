<?php
header("Cache-Control: no-cache, no-store, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
require 'config.php';

$c = $_POST['cred'];
$cred = utf8_encode($c);
$cred = json_decode(json_decode($cred));

$command = escapeshellcmd('python '.$path.'logout.py -t '.$cred->{'token'}.'');
echo shell_exec($command);

?>