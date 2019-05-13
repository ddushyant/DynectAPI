#!/usr/bin/env python

import suds.client
import argparse
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=4)

parser = argparse.ArgumentParser()
parser.add_argument("-u", "--user", help="username", required=True)
parser.add_argument("-p", "--passd", help="password", required=True)
args = parser.parse_args()

CUST = 'cnbc'
USER = args.user
PASS = args.passd
base_url = 'https://api2.dynect.net/wsdl/current/Dynect.wsdl'

client = suds.client.Client(base_url)

# Logging in
response = client.service.SessionLogin(
    customer_name = CUST,
    user_name = USER,
    password = PASS,
    fault_incompat = 1,
)

if response.status != 'success':
	print "failed"
	raise SystemExit


print response.data.token