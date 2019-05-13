<?php
header("Cache-Control: no-cache, no-store, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
require 'config.php';

$c = $_POST['cred'];
$cred = utf8_encode($c);
$cred = json_decode(json_decode($cred));

$command = escapeshellcmd('python '.$path.'update.py -t '.$cred->{'token'}.' -l '.$cred->{'listUpdate'}.' -p '.$path.'tmp-app-data/ -u '.$cred->{'user'});
echo shell_exec($command);

$to = $recp_email;
$subject = "DNS Updated {CNBC Dynect API}";
$headers = "MIME-Version: 1.0" . "\n";
$headers = "From: cnbc.devops@nbcuni.com" . "\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\n";

$htmlContent = file_get_contents($path."tmp-app-data/email.html");

mail($to, $subject, $htmlContent, $headers);

?>
