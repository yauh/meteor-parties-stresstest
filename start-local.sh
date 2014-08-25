#!/bin/bash
# read options
while getopts ":i:" opt; do
  case $opt in
    i)
      echo "Will run $OPTARG times" >&2
      drones="$OPTARG"
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

i=0
# run casper locally
while [[ $i -lt $drones ]]
do
    nohup ./immortalCasper.sh -u http://localhost:3000 -p password > /dev/null 2>&1 &
    i=$[$i+1]
done