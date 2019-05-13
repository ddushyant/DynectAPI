#!/usr/bin/env python
import csv
import os
import suds.client
import argparse
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=4)

parser = argparse.ArgumentParser()
parser.add_argument("-t", "--token", help="token", required=True)
parser.add_argument("-p", "--path", help="path", required=True)
args = parser.parse_args()

CUST = 'cnbc'
TOKEN = args.token
PATH = args.path
base_url = 'https://api2.dynect.net/wsdl/current/Dynect.wsdl'
client = suds.client.Client(base_url)

lsZone,lsSubZone,aws,ec,pa = [],[],[],[],[]
with open(PATH+'data.csv', mode='r') as csv_file:
	csv_reader = csv.DictReader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		lsSubZone.append(row["domain"])
		if lsSubZone[line_count][0] != "#":
			zoneB = lsSubZone[line_count].split(".")
			lsZone.append(zoneB[-2]+'.'+zoneB[-1])
			aws.append(row["aws"].split(","))
			ec.append(row["ec"].split(","))
			pa.append(row["pa"].split(","))
		else:
			lsZone.append("#")
			aws.append("#")
			ec.append("#")
			pa.append("#")
		line_count += 1

count = 0
for z in lsZone:
	if lsSubZone[count][0] != "#":
		awsR, ecR, paR = "", "", ""
		response = client.service.GetANYRecords(
			token = TOKEN,
			zone = z,
			fqdn = lsSubZone[count],
			fault_incompat = 1,
		)

		if response.status != 'success':
			print "failed"
			raise SystemExit
		else:
			ttl = ""
			typeRec = response.data[0][0].record_type
			if typeRec == "A":
				records = response.data.a_records
			else:
				records = response.data.cname_records

			for a in records:
				adr = ""
				ttl = str(a.ttl)
				if typeRec == "A":
					adr = a.rdata.address
				else:
					adr = a.rdata.cname

				if adr in aws[count]:
					awsR = "checked"
				if adr in ec[count]:
					ecR = "checked"
				if adr in pa[count]:
					paR = "checked"

			tableStr = ""
			if (count+1)%2 == 0:
				tableStr='<tr role="row" class="even">'
			else:
				tableStr='<tr role="row" class="odd">'
			tableStr+='<td class="sorting_1">'+lsSubZone[count]+'</td>'
			for i in ['aws','ec','pa']:

				ips,valCheck="",""
				if i is 'aws':
					for ip in aws[count]:
						ips += str(ip)+", "
					valCheck = awsR
				elif i is 'ec':
					for ip in ec[count]:
						ips += str(ip)+", "
					valCheck = ecR
				else:
					for ip in pa[count]:
						ips += str(ip)+", "
					valCheck = paR
				if ips[:-2] is "":
					tableStr += '<td></td>';
				else:
					tableStr += '<td><label class="switch"><input type="checkbox" onchange="toggleButt(this)" class = "serverCB" data-domainname = "'+lsSubZone[count]+'" data-ip = "'+ips[:-2]+'" data-col = "'+i+'" data-row = "'+str(count)+'" '+valCheck+'>'
					tableStr += '<span class="slider round"></span></label>'
					tableStr += '<label><font size="2"><b>'+ips[:-2]+'</b> ttl: '+ttl+'</font></label></td>'
			tableStr+='</tr>'


		print tableStr
		count += 1
	else:
		tableStr='<tr role="row" style="background: #F1F3F4;" class="comment">'
		tableStr+='<td class="sorting_1"><b>'+lsSubZone[count]+'</b></td>'
		tableStr += '<td></td><td></td><td></td>'
		print tableStr
		count += 1





