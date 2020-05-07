## Dynect API UI

### What is Dynect API UI?
Dynect API UI is a user interface built on top of api(python) provided by dynect. It's desigened to make the proccess of switching records for domains just a click of a button. It also provides other functionalities like adding and removing domains from the local database. 

### Requirements
Python 2.7 or up

Apache HTTP Server 2.4.38 or Ngnix 1.14.2

### Installation
```
sudo su root

sudo yum update -y
sudo yum install git -y
sudo yum install httpd mod_ssl
sudo /usr/sbin/apachectl start
sudo pip install suds

sudo yum install php php-mysql php-devel php-gd php-pecl-memcache php-pspell php-snmp php-xmlrpc php-xml

sudo /usr/sbin/apachectl restart

mkdir /var/www/html/dynect
```
{Run Jenkins Pipeline}
```
sudo chmod -R 777 /var/www/html/py/tmp-app-data/
```
{Copy the latest "data.csv" file under the /var/www/html/py/tmp-app-data/ folder}

If recipient emails needs to be changed or the app is installed in a folder other than /var/www/html

Change the $path and $recp_email variables {can add as many emails or email groups as needed, separated by commas}
```
sudo vi {app folder}/php/config.php

```
![alt text](https://github.com/ddushyant/DynectAPI/blob/master/images/Screen%20Shot%202019-05-12%20at%208.23.29%20PM.png)

Now, you should be able to use the web application.

Open any browser and search for server-url/folder-name









