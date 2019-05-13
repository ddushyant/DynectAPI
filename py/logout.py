import suds.client
import argparse
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=4)

parser = argparse.ArgumentParser()
parser.add_argument("-t", "--token", help="token", required=True)
args = parser.parse_args()
base_url = 'https://api2.dynect.net/wsdl/current/Dynect.wsdl'

client = suds.client.Client(base_url)

response = client.service.SessionLogout(
    token = args.token,
    fault_incompat = 1,
)

if response.status != 'success':
    print "failed"
    raise SystemExit

print "Successfully logged out"