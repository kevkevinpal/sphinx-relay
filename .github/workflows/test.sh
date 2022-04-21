#!/bin/bash

delay=10
retries=3

i=0

while true; do
	if (npx ava src/tests/controllers/"$1".test.ts --verbose --serial --timeout=2m); then
		break
	else
		((i++))
		if [ $i -gt $retries ]; then
			echo DEBUG LOGS

			echo -e "\n\n== alice chans ==\n\n"
			docker exec alice-lnd.sphinx lncli -n regtest listchannels

			echo -e "\n\n=== bob chans ===\n\n"
			docker exec bob-lnd.sphinx lncli -n regtest --rpcserver=localhost:10010 listchannels

			echo -e "\n\n== carol chans ==\n\n"
			docker exec carol-lnd.sphinx lncli -n regtest --rpcserver=localhost:10011 listchannels

			echo -e "\n\n===== alice =====\n\n"
			docker logs alice.sphinx

			echo -e "\n\n====== bob ======\n\n"
			docker logs bob.sphinx

			echo -e "\n\n===== carol =====\n\n"
			docker logs carol.sphinx

			exit 1
		fi
		echo Test failed, retrying in "$delay"s "($i/$retries)"
		sleep $delay
	fi
done
