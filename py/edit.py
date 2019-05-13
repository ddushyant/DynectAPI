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

editT = ""
with open(PATH+'data.csv', mode='r') as csv_file:
	csv_reader = csv.DictReader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if row["domain"][0] != "#":
			zoneB = row["domain"].split(".")            #for authentication only -- verifing a valid session
			if line_count == 0:
				response = client.service.GetANYRecords(
					token = TOKEN,
					zone = zoneB[-2]+'.'+zoneB[-1],
					fqdn = row["domain"],
					fault_incompat = 1,
				)
				if response.status != 'success':
					print "failed"
					raise SystemExit
			editT += "<tr role='row' class='even'>"
			editT +="<td class='sorting_1'><textarea class = 'expand' rows='1'>"+row["domain"]+"</textarea></td>"
			editT += "<td><textarea class = 'expand' rows='1'>"+row["aws"]+"</textarea></td>"
			editT += "<td><textarea class = 'expand' rows='1'>"+row["ec"]+"</textarea></td>"
			editT += "<td><textarea class  = 'expand' rows='1'>"+row["pa"]+"</textarea></td></tr>"
		else:
			editT += "<tr role='row' class='even'><td class='sorting_1'><textarea class = 'expand' rows='1'>"+row["domain"]+"</textarea></td>"
			editT += "<td><textarea class = 'expand' rows='1' placeholder='AWS'></textarea></td>"
			editT += "<td><textarea class = 'expand' rows='1' placeholder='EC'></textarea></td>"
			editT += "<td><textarea class  = 'expand' rows='1' placeholder='PA'></textarea></td></tr>"
		line_count += 1

print editT
