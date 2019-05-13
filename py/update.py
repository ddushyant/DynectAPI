#!/usr/bin/env python

import csv
import os
import suds.client
import argparse
from pprint import PrettyPrinter

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

pp = PrettyPrinter(indent=4)

parser = argparse.ArgumentParser()
parser.add_argument("-t", "--token", help="token", required=True)
parser.add_argument("-l", "--list", help="list", required=True)
parser.add_argument("-p", "--path", help="path", required=True)
parser.add_argument("-u", "--user", help="user", required=True)
args = parser.parse_args()

CUST = 'cnbc'
TOKEN = args.token
listUpdate = args.list
PATH = args.path
USER = args.user
base_url = 'https://api2.dynect.net/wsdl/current/Dynect.wsdl'
client = suds.client.Client(base_url)

def compIps(lst1, lst2):
    for item in lst1:
        if item not in lst2:
            return False
    for item in lst2:
        if item not in lst1:
            return False
    return True

def email(body):
    f= open(PATH+"email.html","w")
    f.write(body)
    f.close()

def error(response):
    email("<pre>Updates made by:&nbsp;"+USER+"</pre><pre>"+str(response)+"</pre>")
    print "failed"
    raise SystemExit

def currentState(zone,fqdn,token):
    response = client.service.GetANYRecords(
        token = token,
        zone = zone,
        fqdn = fqdn,
        fault_incompat = 1,
    )
    if response.status != 'success':
        error(response)
    else:
        records,adr = "",[]
        typeRec = response.data[0][0].record_type
        if typeRec == "A":
            records = response.data.a_records
        else:
            records = response.data.cname_records
        ttl = []
        for a in records:
            ttl.append(a.ttl)
            if typeRec == "A":
                adr.append(str(a.rdata.address))
            else:
                adr.append(str(a.rdata.cname))
    return (adr,ttl[0])

def deleteRecords(zone,fqdn,token):
    response = client.service.DeleteCNAMERecords(
        fqdn = fqdn,
        token = token,
        zone = zone,
        fault_incompat = '1',
    )
    if response.status != 'success':
        error(response)
    response = client.service.DeleteARecords(
        fqdn = fqdn,
        token = token,
        zone = zone,
        fault_incompat = '1',
    )
    if response.status != 'success':
        error(response)
    return "successful"


def cnameUpdate(zone,fqdn,cname,token,ttl):
    response = client.service.ReplaceCNAMERecords(
        CNAMERecords =
                [{
                    'fqdn' : fqdn,
                    'rdata' : {
                            'cname' : cname,
                    },
                    'ttl' : ttl,
                    'zone' : zone,
                }
        ],
        token = token,
        fault_incompat = '1',
    )
    if response.status != 'success':
        error(response)
    return True

def arecordUpdate(zone,fqdn,adrs,token,ttl):
    arecord = []
    for a in adrs:
        arecord.append({'fqdn' : fqdn, 
                        'rdata' : {
                                'address' : a,
                        },
                        'ttl' : ttl,
                        'zone' : zone,
                        })
    response = client.service.ReplaceARecords(
        ARecords = arecord,
        token = token,
        fault_incompat = '1',
    )
    if response.status != 'success':
        error(response)
    return True

def publish(zone,token):
    response = client.service.PublishZone(
        token = token,
        zone = zone,
        fault_incompat = '1',
    )
    if response.status != 'success':
        error(response)
    return str(response)

data = []
with open(PATH+'data.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file, delimiter=';')
    line_count = 0
    for row in csv_reader:
        data.append(row)

listUpdate = listUpdate.split(';')
del listUpdate[-1]
tDListUpdate = {}
for up in listUpdate:
    row,col = up.split(',')
    if int(row) not in tDListUpdate:
        tDListUpdate[int(row)] = [col]
    else:
        tDListUpdate[int(row)].append(col)

publishStack = []
updatedDomain = ""
changeIpStr = {}
updatedEmailDomain = {}

for row in tDListUpdate:
    zoneB = data[row]['domain'].split('.')
    zone = zoneB[-2]+'.'+zoneB[-1]
    changeIpStr[zone] = ""
    updatedEmailDomain[zone] = ""

for row in tDListUpdate:
    if 'aws' in tDListUpdate[row] and ('ec' in tDListUpdate[row] or 'pa' in tDListUpdate[row]):
        print 'Error: CNAME and ARECORD cannot be published under same domain'
        email('Error: CNAME and ARECORD cannot be published under same domain. Update made by: '+USER)
        raise SystemExit
    else:
        allUpdateIps = []
        for col in tDListUpdate[row]:
            for eIp in data[row][col].split(','):
                allUpdateIps.append(eIp)
        #print allUpdateIps           #For debugging Only
        zoneB = data[row]['domain'].split('.')
        zone = zoneB[-2]+'.'+zoneB[-1]
        curIps = currentState(zone,data[row]['domain'],TOKEN)

        #print curIps        #For debugging Only
        if compIps(allUpdateIps, curIps[0]) == False:
            deleteRecords(zone,data[row]['domain'],TOKEN)
            if tDListUpdate[row][0] == 'aws':
                cnameUpdate(zone,data[row]['domain'],allUpdateIps[0],TOKEN,curIps[1])
            else:
                arecordUpdate(zone,data[row]['domain'],allUpdateIps,TOKEN,curIps[1])
            changeIpStr[zone] += str(curIps[0]) + "</td><td>" + str(allUpdateIps) + "</td><td>"
            updatedEmailDomain[zone] += str(data[row]['domain'])+'</td><td colspan="2">'
            updatedDomain += str(data[row]['domain'])+", "
            if zone not in publishStack:
                    publishStack.append(zone)
emailStr = '<!DOCTYPE html><html><head><style>table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}td, th {border: 2px solid #dddddd;text-align: left;padding: 8px;}</style></head><body>'
for z in publishStack:
    emailStr += '<h3>Zone:&nbsp;'+z+'</h3><table>'
    emailStr += '<tr><td><b>Domains updated:</b></td><td colspan="2">' + updatedEmailDomain[z][:-16] + '</td></tr><tr><td><b>Changed from/to:</b></td><td>' + changeIpStr[z][:-9] + '</td></tr><tr><td><b>Updates made by:</b></td><td>'+ USER +'</td></tr></table><br><b>Api Response:</b><pre>' + publish(z,TOKEN) + '</pre>'
if publishStack:
    print "Successfully updated "+updatedDomain[:-2]
    email(emailStr)
else:
    email("Nothing to update. Update made by: "+USER)



