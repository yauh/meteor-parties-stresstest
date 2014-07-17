#!/bin/bash

# read options
while getopts ":u:p:" opt; do
  case $opt in
    u)
      echo "URL set to $OPTARG" >&2
      url="$OPTARG"
      ;;
    e)
      echo "EMAIL set to $OPTARG" >&2
      email="$OPTARG"
      ;;
    p)
      echo "PASSWORD set to $OPTARG" >&2
      password="$OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

if [  -z "$url" -o -z "$password" ]; then
    echo "Usage: ./immortalCasper.sh -u <HTTP://URL> -p <PASSWORD>"
    exit
fi

# populate Accounts
declare -a Accounts=()
while read line; do Accounts=("${Accounts[@]}" "$line"); done < accounts
num_accounts=${#Accounts[*]}

while :
    do
        casperjs parties-stress.js --email=${Accounts[$((RANDOM%num_accounts))]} --url=$url --password=$password
done

