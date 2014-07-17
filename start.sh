#!/bin/bash

# read options
while getopts ":u:p:d:" opt; do
  case $opt in
    u)
      echo "URL set to $OPTARG" >&2
      url="$OPTARG"
      ;;
    p)
      echo "PASSWORD set to $OPTARG" >&2
      password="$OPTARG"
      ;;
    d)
      echo "DIRECTORY set to $OPTARG" >&2
      directory="$OPTARG"
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

if [ -z "$directory" -o -z "$url" -o -z "$password" ]; then
    echo "Usage: ./start.sh -u <HTTP://URL> -p <PASSWORD> -d <DIRECTORY>"
    exit
fi

# populate Drones
declare -a Drones=()
while read line; do Drones=("${Drones[@]}" "$line"); done < drones

# copy all files to the Drones
for i in "${Drones[@]}"
do
   scp parties-stress.js $i:$directory
   scp immortalCasper.sh $i:$directory
   scp accounts $i:$directory
   ssh $i chmod +x $directory/immortalCasper.sh
done


# run casper in all drones
for i in "${Drones[@]}"
do
   ssh $i "nohup $directory/immortalCasper.sh -u $url -p $password > /dev/null 2>&1 & "
   echo Started the immortal Casper on $i
done
