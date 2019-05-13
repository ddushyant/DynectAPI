<?php
header("Cache-Control: no-cache, no-store, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
require 'config.php';

$c = $_POST['cred'];
$cred = utf8_encode($c);
$cred = json_decode(json_decode($cred));

$file = ''.$path.'tmp-app-data/data.csv';
$current = file_get_contents($file);

file_put_contents($file, $cred->{'ipdata'});

$to = $recp_email;
$subject = "Domains File Updated {CNBC Dynect API}";
$headers = "MIME-Version: 1.0" . "\n";
$headers = "From: cnbc.devops@nbcuni.com" . "\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\n";

$htmlContent = "Changes to domain data were made by: " . $cred->{'user'};

mail($to, $subject, $htmlContent, $headers);
?>
